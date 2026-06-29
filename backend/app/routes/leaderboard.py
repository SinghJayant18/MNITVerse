import asyncio
from datetime import datetime, timezone
import requests

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.database import get_db
from app.models.schemas import CPStats, UpdateCPUsernames, UserResponse
from app.utils.deps import get_current_user_id
from app.utils.helpers import oid, serialize_user

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


class LeaderboardEntry(BaseModel):
    rank: int
    id: str
    name: str
    branch: str
    year: str
    leetcode_username: str | None = None
    codeforces_username: str | None = None
    cp_stats: CPStats | None = None


def fetch_cp_stats_sync(lc_username: str | None, cf_username: str | None) -> dict:
    stats = {
        "lc_solved_easy": 0,
        "lc_solved_medium": 0,
        "lc_solved_hard": 0,
        "lc_solved_score": 0,
        "lc_solved_total": 0,
        "lc_contest_rating": 0.0,
        "cf_rating": 0,
        "overall_score": 0.0,
        "lc_valid": True,
        "cf_valid": True,
    }

    # Fetch LeetCode solved
    if lc_username:
        try:
            r = requests.get(f"https://alfa-leetcode-api.onrender.com/{lc_username}/solved", timeout=8)
            if r.status_code == 200:
                data = r.json()
                if "errors" in data or (data.get("matchedUser") is None and "easySolved" not in data):
                    stats["lc_valid"] = False
                else:
                    stats["lc_solved_easy"] = data.get("easySolved", 0)
                    stats["lc_solved_medium"] = data.get("mediumSolved", 0)
                    stats["lc_solved_hard"] = data.get("hardSolved", 0)
                    # Total solved count (easy + medium + hard)
                    stats["lc_solved_total"] = (
                        stats["lc_solved_easy"] +
                        stats["lc_solved_medium"] +
                        stats["lc_solved_hard"]
                    )
                    # Weighted score for ranking purposes
                    stats["lc_solved_score"] = (
                        stats["lc_solved_easy"] * 1 +
                        stats["lc_solved_medium"] * 2 +
                        stats["lc_solved_hard"] * 3
                    )
            else:
                stats["lc_valid"] = False
        except Exception as e:
            print(f"Error fetching LeetCode solved for {lc_username}: {e}")

        # Fetch LeetCode contest rating
        if stats["lc_valid"]:
            try:
                r = requests.get(f"https://alfa-leetcode-api.onrender.com/{lc_username}/contest", timeout=8)
                if r.status_code == 200:
                    data = r.json()
                    if "errors" in data:
                        stats["lc_contest_rating"] = 0.0
                    else:
                        stats["lc_contest_rating"] = float(data.get("contestRating", 0.0))
                else:
                    stats["lc_contest_rating"] = 0.0
            except Exception as e:
                print(f"Error fetching LeetCode contest for {lc_username}: {e}")
    else:
        stats["lc_valid"] = True

    # Codeforces handling removed; only LeetCode stats are used

    # Compute overall score (weighted solved score + contest rating)
    stats["overall_score"] = (
        float(stats["lc_solved_score"]) +
        float(stats["lc_contest_rating"])
    )

    return stats


@router.put("/usernames", response_model=UserResponse)
async def update_usernames(
    data: UpdateCPUsernames,
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    user = await db.users.find_one({"_id": oid(user_id)})
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    lc_user = data.leetcode_username.strip() if data.leetcode_username else ""
    # Codeforces usernames are ignored in this simplified version
    cf_user = ""

    if lc_user:
        stats = await asyncio.to_thread(fetch_cp_stats_sync, lc_user, "")

        if not stats["lc_valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"LeetCode username '{lc_user}' does not exist.",
            )

        stats["last_updated"] = datetime.now(timezone.utc)
    else:
        stats = {
            "lc_solved_easy": 0,
            "lc_solved_medium": 0,
            "lc_solved_hard": 0,
            "lc_solved_score": 0,
            "lc_solved_total": 0,
            "lc_contest_rating": 0.0,
            "overall_score": 0.0,
            "lc_valid": True,
            "last_updated": datetime.now(timezone.utc),
        }

    await db.users.update_one(
        {"_id": oid(user_id)},
        {
            "$set": {
                "leetcode_username": lc_user,
                "codeforces_username": cf_user,
                "cp_stats": stats,
            }
        }
    )

    updated_user = await db.users.find_one({"_id": oid(user_id)})
    return UserResponse(**serialize_user(updated_user))


@router.post("/refresh", response_model=UserResponse)
async def refresh_stats(
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    user = await db.users.find_one({"_id": oid(user_id)})
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    lc_user = user.get("leetcode_username", "")
    # Codeforces username ignored
    if not lc_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Configure your LeetCode username first.",
        )

    stats = await asyncio.to_thread(fetch_cp_stats_sync, lc_user, "")
    stats["last_updated"] = datetime.now(timezone.utc)

    await db.users.update_one(
        {"_id": oid(user_id)},
        {"$set": {"cp_stats": stats}}
    )

    updated_user = await db.users.find_one({"_id": oid(user_id)})
    return UserResponse(**serialize_user(updated_user))


@router.get("", response_model=list[LeaderboardEntry])
async def get_leaderboard(
    branch: str | None = None,
    year: str | None = None,
    tab: str = "overall",
):
    db = get_db()

    query = {
        "leetcode_username": {"$gt": ""}
    }
    if branch:
        query["branch"] = branch
    if year:
        query["year"] = year

    cursor = db.users.find(query)
    users = [doc async for doc in cursor]

    def get_sort_key(u):
        stats = u.get("cp_stats") or {}
        if tab == "lc_solved":
            return stats.get("lc_solved_total", 0)
        elif tab == "lc_contest":
            return stats.get("lc_contest_rating", 0.0)
        else:  # overall
            return stats.get("overall_score", 0.0)

    users.sort(key=get_sort_key, reverse=True)

    entries = []
    for idx, u in enumerate(users):
        serialized = serialize_user(u)
        entries.append(LeaderboardEntry(
            rank=idx + 1,
            id=serialized["id"],
            name=serialized["name"],
            branch=serialized["branch"],
            year=serialized["year"],
            leetcode_username=serialized["leetcode_username"],
            codeforces_username=serialized["codeforces_username"],
            cp_stats=serialized["cp_stats"],
        ))

    return entries

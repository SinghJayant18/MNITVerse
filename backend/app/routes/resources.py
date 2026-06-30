import os
import uuid
from datetime import datetime, timezone

import aiofiles
from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from app.config import settings
from app.database import get_db
from app.models.schemas import RatingCreate, ResourceResponse
from app.utils.deps import get_current_user_id, get_optional_user_id
from app.utils.helpers import oid, serialize_resource

router = APIRouter(prefix="/resources", tags=["resources"])

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt", ".zip"}


def _resolve_filepath(doc: dict) -> str:
    stored = doc.get("stored_path")
    if stored and os.path.isfile(stored):
        return stored
    filepath = os.path.join(settings.upload_dir, doc["filename"])
    return os.path.abspath(filepath)


async def _bookmark_set(user_id: str | None) -> set[str]:
    if not user_id:
        return set()
    db = get_db()
    cursor = db.bookmarks.find({"user_id": user_id})
    return {b["resource_id"] async for b in cursor}


@router.get("", response_model=list[ResourceResponse])
async def list_resources(
    branch: str | None = None,
    subject: str | None = None,
    resource_type: str | None = None,
    search: str | None = None,
    sort: str = "recent",
    user_id: str | None = Depends(get_optional_user_id),
):
    db = get_db()
    query: dict = {}
    if branch:
        query["branch"] = branch
    if subject:
        query["subject"] = {"$regex": subject, "$options": "i"}
    if resource_type:
        query["resource_type"] = resource_type
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"subject": {"$regex": search, "$options": "i"}},
        ]

    sort_key = [("created_at", -1)]
    if sort == "popular":
        sort_key = [("downloads", -1)]
    elif sort == "rating":
        sort_key = [("avg_rating", -1)]

    bookmarks = await _bookmark_set(user_id)
    cursor = db.resources.find(query).sort(sort_key).limit(50)
    results = []
    async for doc in cursor:
        rid = str(doc["_id"])
        results.append(
            serialize_resource(doc, bookmarked=rid in bookmarks)
        )
    return [ResourceResponse(**r) for r in results]


@router.get("/trending", response_model=list[ResourceResponse])
async def trending(user_id: str | None = Depends(get_optional_user_id)):
    db = get_db()
    bookmarks = await _bookmark_set(user_id)
    cursor = db.resources.find().sort([("downloads", -1), ("created_at", -1)]).limit(8)
    results = []
    async for doc in cursor:
        rid = str(doc["_id"])
        results.append(serialize_resource(doc, bookmarked=rid in bookmarks))
    return [ResourceResponse(**r) for r in results]


@router.get("/recommendations", response_model=list[ResourceResponse])
async def recommendations(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    user = await db.users.find_one({"_id": oid(user_id)})
    branch = user.get("branch", "CSE") if user else "CSE"
    bookmarks = await _bookmark_set(user_id)
    cursor = (
        db.resources.find({"branch": branch})
        .sort([("avg_rating", -1), ("downloads", -1)])
        .limit(8)
    )
    results = []
    async for doc in cursor:
        rid = str(doc["_id"])
        results.append(serialize_resource(doc, bookmarked=rid in bookmarks))
    return [ResourceResponse(**r) for r in results]


@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: str,
    user_id: str | None = Depends(get_optional_user_id),
):
    db = get_db()
    doc = await db.resources.find_one({"_id": oid(resource_id)})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resource not found")
    bookmarks = await _bookmark_set(user_id)
    return ResourceResponse(
        **serialize_resource(doc, bookmarked=resource_id in bookmarks)
    )


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def upload_resource(
    title: str = Form(...),
    description: str = Form(""),
    branch: str = Form(...),
    subject: str = Form(...),
    semester: str = Form("1"),
    resource_type: str = Form("notes"),
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    os.makedirs(settings.upload_dir, exist_ok=True)
    safe_name = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.upload_dir, safe_name)

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File too large (max 20MB)")

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    if not os.path.exists(filepath) or os.path.getsize(filepath) != len(content):
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Failed to save file on server. Please try uploading again.",
        )

    db = get_db()
    user = await db.users.find_one({"_id": oid(user_id)})
    doc = {
        "title": title.strip(),
        "description": description.strip(),
        "branch": branch,
        "subject": subject.strip(),
        "semester": semester,
        "resource_type": resource_type,
        "filename": safe_name,
        "stored_path": os.path.abspath(filepath),
        "original_filename": file.filename,
        "file_size": len(content),
        "uploader_id": user_id,
        "uploader_name": user["name"] if user else "Student",
        "ratings": [],
        "avg_rating": 0.0,
        "downloads": 0,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.resources.insert_one(doc)
    doc["_id"] = result.inserted_id
    return ResourceResponse(**serialize_resource(doc))


@router.get("/{resource_id}/download")
async def download_resource(resource_id: str):
    db = get_db()
    doc = await db.resources.find_one({"_id": oid(resource_id)})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resource not found")

    filepath = _resolve_filepath(doc)
    if not os.path.isfile(filepath):
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "File missing on server. Please re-upload this resource.",
        )

    await db.resources.update_one(
        {"_id": oid(resource_id)}, {"$inc": {"downloads": 1}}
    )
    original_name = doc.get("original_filename", doc["filename"])
    return FileResponse(
        filepath,
        filename=original_name,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{original_name}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


@router.post("/{resource_id}/rate", response_model=ResourceResponse)
async def rate_resource(
    resource_id: str,
    data: RatingCreate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    doc = await db.resources.find_one({"_id": oid(resource_id)})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resource not found")

    ratings: list = doc.get("ratings", [])
    ratings.append(data.rating)
    avg = sum(ratings) / len(ratings)
    await db.resources.update_one(
        {"_id": oid(resource_id)},
        {"$set": {"ratings": ratings, "avg_rating": round(avg, 2)}},
    )
    doc["ratings"] = ratings
    bookmarks = await _bookmark_set(user_id)
    return ResourceResponse(
        **serialize_resource(doc, bookmarked=resource_id in bookmarks)
    )

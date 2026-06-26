from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.models.schemas import ResourceResponse
from app.utils.deps import get_current_user_id
from app.utils.helpers import oid, serialize_resource

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.get("", response_model=list[ResourceResponse])
async def list_bookmarks(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    cursor = db.bookmarks.find({"user_id": user_id}).sort("created_at", -1)
    results = []
    async for bm in cursor:
        doc = await db.resources.find_one({"_id": oid(bm["resource_id"])})
        if doc:
            results.append(serialize_resource(doc, bookmarked=True))
    return [ResourceResponse(**r) for r in results]


@router.post("/{resource_id}", status_code=status.HTTP_201_CREATED)
async def add_bookmark(
    resource_id: str, user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    doc = await db.resources.find_one({"_id": oid(resource_id)})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resource not found")

    from datetime import datetime, timezone

    try:
        await db.bookmarks.insert_one(
            {
                "user_id": user_id,
                "resource_id": resource_id,
                "created_at": datetime.now(timezone.utc),
            }
        )
    except Exception:
        pass
    return {"message": "Bookmarked"}


@router.delete("/{resource_id}")
async def remove_bookmark(
    resource_id: str, user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    await db.bookmarks.delete_one(
        {"user_id": user_id, "resource_id": resource_id}
    )
    return {"message": "Bookmark removed"}

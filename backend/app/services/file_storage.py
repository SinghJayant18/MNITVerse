import io
from typing import AsyncIterator

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorGridFSBucket

from app.database import get_db

BUCKET_NAME = "resource_files"


def _bucket() -> AsyncIOMotorGridFSBucket:
    return AsyncIOMotorGridFSBucket(get_db(), bucket_name=BUCKET_NAME)


async def save_file(content: bytes, filename: str, metadata: dict | None = None) -> str:
    """Store file in MongoDB GridFS. Returns file id as string."""
    bucket = _bucket()
    file_id = await bucket.upload_from_stream(
        filename,
        io.BytesIO(content),
        metadata=metadata or {},
    )
    return str(file_id)


async def file_exists(file_id: str) -> bool:
    bucket = _bucket()
    files = await bucket.find({"_id": ObjectId(file_id)}).to_list(1)
    return len(files) > 0


async def read_file(file_id: str) -> bytes:
    bucket = _bucket()
    grid_out = await bucket.open_download_stream(ObjectId(file_id))
    return await grid_out.read()


async def stream_file(file_id: str) -> AsyncIterator[bytes]:
    bucket = _bucket()
    grid_out = await bucket.open_download_stream(ObjectId(file_id))
    while True:
        chunk = await grid_out.readchunk()
        if not chunk:
            break
        yield chunk


async def delete_file(file_id: str) -> None:
    bucket = _bucket()
    await bucket.delete(ObjectId(file_id))

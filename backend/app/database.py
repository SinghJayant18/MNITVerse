from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    global client, db
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client.get_database("eduvault")
    await db.users.create_index("email", unique=True)
    await db.resources.create_index([("branch", 1), ("subject", 1)])
    await db.resources.create_index([("downloads", -1)])
    await db.resources.create_index([("created_at", -1)])
    await db.bookmarks.create_index([("user_id", 1), ("resource_id", 1)], unique=True)


async def close_db() -> None:
    global client, db
    if client:
        client.close()
    client = None
    db = None


def get_db() -> AsyncIOMotorDatabase:
    if db is None:
        raise RuntimeError("Database not initialized")
    return db

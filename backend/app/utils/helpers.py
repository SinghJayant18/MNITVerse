from bson import ObjectId


def oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception as exc:
        raise ValueError("Invalid ID") from exc


def serialize_user(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "branch": doc.get("branch", "CSE"),
        "year": doc.get("year", "1"),
        "created_at": doc.get("created_at"),
    }


def serialize_resource(doc: dict, bookmarked: bool = False) -> dict:
    ratings = doc.get("ratings", [])
    avg = sum(ratings) / len(ratings) if ratings else 0.0
    return {
        "id": str(doc["_id"]),
        "title": doc["title"],
        "description": doc.get("description", ""),
        "branch": doc["branch"],
        "subject": doc["subject"],
        "semester": doc.get("semester", "1"),
        "resource_type": doc.get("resource_type", "notes"),
        "filename": doc.get("filename", ""),
        "file_size": doc.get("file_size", 0),
        "uploader_id": doc.get("uploader_id", ""),
        "uploader_name": doc.get("uploader_name", "Anonymous"),
        "avg_rating": round(avg, 1),
        "rating_count": len(ratings),
        "downloads": doc.get("downloads", 0),
        "created_at": doc.get("created_at"),
        "bookmarked": bookmarked,
    }

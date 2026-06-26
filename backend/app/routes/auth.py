from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.models.schemas import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services.auth import create_access_token, hash_password, verify_password
from app.utils.deps import get_current_user_id
from app.utils.helpers import oid, serialize_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered")

    doc = {
        "name": data.name.strip(),
        "email": data.email.lower(),
        "password": hash_password(data.password),
        "branch": data.branch,
        "year": data.year,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    user_id = str(result.inserted_id)
    token = create_access_token(user_id)
    user = serialize_user({**doc, "_id": result.inserted_id})
    return TokenResponse(access_token=token, user=UserResponse(**user))


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    token = create_access_token(str(user["_id"]))
    return TokenResponse(
        access_token=token,
        user=UserResponse(**serialize_user(user)),
    )


@router.get("/me", response_model=UserResponse)
async def me(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    user = await db.users.find_one({"_id": oid(user_id)})
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return UserResponse(**serialize_user(user))

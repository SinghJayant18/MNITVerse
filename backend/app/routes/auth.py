from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models.schemas import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services.auth import create_access_token, hash_password, verify_password
from app.utils.deps import get_current_user_id
from app.utils.helpers import oid, serialize_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(data: UserCreate):
    db = get_db()
    
    # Check if user already exists
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered")

    # Generate 6-digit OTP
    from app.services.email_service import generate_otp, send_verification_email
    otp_code = generate_otp()
    
    # Store pending user details & OTP in 'pending_users'
    # Use hash_password(data.password) to store secure credentials
    pending_doc = {
        "name": data.name.strip(),
        "email": data.email.lower(),
        "password": hash_password(data.password),
        "branch": data.branch,
        "year": data.year,
        "otp": otp_code,
        "created_at": datetime.now(timezone.utc)
    }
    
    # Update or insert pending registration
    await db.pending_users.update_one(
        {"email": data.email.lower()},
        {"$set": pending_doc},
        upsert=True
    )
    
    # Send verification email
    sent = send_verification_email(data.email.lower(), otp_code, name=data.name.strip())
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please ensure SMTP credentials are configured in backend/.env."
        )
        
    return {"message": "Verification code sent to your email."}


from app.models.schemas import VerifyOTPRequest

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(data: VerifyOTPRequest):
    db = get_db()
    email_clean = data.email.lower()
    
    # Retrieve pending registration
    pending = await db.pending_users.find_one({"email": email_clean})
    if not pending:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No pending registration found for this email")
        
    # Check OTP
    if pending.get("otp") != data.otp.strip():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid verification code")
        
    # Create the user in main collection
    user_doc = {
        "name": pending["name"],
        "email": pending["email"],
        "password": pending["password"],
        "branch": pending["branch"],
        "year": pending["year"],
        "created_at": datetime.now(timezone.utc),
    }
    
    # Insert actual user
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Clean up pending
    await db.pending_users.delete_one({"email": email_clean})
    
    # Create token
    token = create_access_token(user_id)
    user = serialize_user({**user_doc, "_id": result.inserted_id})
    return TokenResponse(access_token=token, user=UserResponse(**user))


class ResendOTPRequest(BaseModel):
    email: EmailStr

@router.post("/resend-otp")
async def resend_otp(data: ResendOTPRequest):
    db = get_db()
    email_clean = data.email.lower()
    
    pending = await db.pending_users.find_one({"email": email_clean})
    if not pending:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No pending registration found for this email")
        
    from app.services.email_service import generate_otp, send_verification_email
    otp_code = generate_otp()
    
    await db.pending_users.update_one(
        {"email": email_clean},
        {"$set": {"otp": otp_code, "created_at": datetime.now(timezone.utc)}}
    )
    
    sent = send_verification_email(email_clean, otp_code, name=pending["name"])
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please ensure SMTP credentials are configured in backend/.env."
        )
    return {"message": "Verification code resent."}


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

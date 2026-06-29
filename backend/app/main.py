import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import close_db, connect_db
from app.models.schemas import SummarizeResponse, TextInput
from app.routes import ai, analytics, auth, bookmarks, resources
from app.services.gemini import summarize_text


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.upload_dir, exist_ok=True)
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="EduVault AI",
    description="College resource sharing platform with AI-powered study tools",
    version="1.0.0",
    lifespan=lifespan,
)
print("CORS ORIGINS LOADED:", settings.cors_origin_list)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resources.router)
app.include_router(bookmarks.router)
app.include_router(ai.router)
app.include_router(analytics.router)

if os.path.isdir(settings.upload_dir):
    app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.post("/summarize", response_model=SummarizeResponse)
async def summarize(data: TextInput):
    summary = await summarize_text(data.text, data.api_key)
    return SummarizeResponse(summary=summary)


@app.get("/")
def home():
    return {
        "message": "EduVault Backend Running Successfully 🚀",
        "docs": "/docs",
        "features": [
            "Upload/Download Resources",
            "Authentication",
            "Bookmarks & Ratings",
            "Gemini AI Summary",
            "PYQ Analysis",
            "Viva Question Generator",
            "Subject Recommendations",
            "Trending & Analytics",
        ],
    }

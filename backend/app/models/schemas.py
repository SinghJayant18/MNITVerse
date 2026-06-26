from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

Branch = Literal[
    "CSE", "IT", "ECE", "EEE", "ME", "CE", "AI/ML", "Data Science", "Other"
]
ResourceType = Literal["notes", "pyq", "book", "syllabus", "lab", "other"]
Year = Literal["1", "2", "3", "4"]


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)
    branch: Branch = "CSE"
    year: Year = "1"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    branch: str
    year: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ResourceCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(default="", max_length=2000)
    branch: Branch
    subject: str = Field(min_length=2, max_length=100)
    semester: str = Field(default="1", max_length=10)
    resource_type: ResourceType = "notes"


class ResourceResponse(BaseModel):
    id: str
    title: str
    description: str
    branch: str
    subject: str
    semester: str
    resource_type: str
    filename: str
    file_size: int
    uploader_id: str
    uploader_name: str
    avg_rating: float
    rating_count: int
    downloads: int
    created_at: datetime
    bookmarked: bool = False


class RatingCreate(BaseModel):
    rating: int = Field(ge=1, le=5)


class TextInput(BaseModel):
    text: str = Field(min_length=10)


class SummarizeResponse(BaseModel):
    summary: str


class PYQAnalysisResponse(BaseModel):
    analysis: str
    important_topics: list[str]
    difficulty: str


class VivaRequest(BaseModel):
    text: str = Field(min_length=10)
    count: int = Field(default=5, ge=1, le=20)


class VivaResponse(BaseModel):
    questions: list[str]


class AnalyticsResponse(BaseModel):
    total_resources: int
    total_users: int
    total_downloads: int
    by_branch: list[dict]
    by_type: list[dict]
    top_resources: list[ResourceResponse]
    recent_uploads: list[ResourceResponse]

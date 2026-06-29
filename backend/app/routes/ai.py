from fastapi import APIRouter

from app.models.schemas import (
    PYQAnalysisResponse,
    SummarizeResponse,
    TextInput,
    VivaRequest,
    VivaResponse,
)
from app.services.gemini import analyze_pyq, generate_viva_questions, summarize_text

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(data: TextInput):
    summary = await summarize_text(data.text, data.api_key)
    return SummarizeResponse(summary=summary)


@router.post("/analyze-pyq", response_model=PYQAnalysisResponse)
async def analyze_pyq_endpoint(data: TextInput):
    result = await analyze_pyq(data.text, data.api_key)
    return PYQAnalysisResponse(**result)


@router.post("/viva-questions", response_model=VivaResponse)
async def viva_questions(data: VivaRequest):
    questions = await generate_viva_questions(data.text, data.api_key, data.count)
    return VivaResponse(questions=questions)

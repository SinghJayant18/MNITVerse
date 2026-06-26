import json
import re

import google.generativeai as genai

from app.config import settings

_model: genai.GenerativeModel | None = None


def _get_model() -> genai.GenerativeModel:
    global _model
    if _model is None:
        genai.configure(api_key=settings.gemini_api_key)
        _model = genai.GenerativeModel("gemini-2.5-flash")
    return _model


def _fallback_summary(text: str) -> str:
    sentences = re.split(r"[.!?]+", text)
    key = [s.strip() for s in sentences if len(s.strip()) > 20][:5]
    return " ".join(key) if key else text[:500]


async def summarize_text(text: str) -> str:
    if not settings.gemini_api_key:
        return _fallback_summary(text)
    try:
        model = _get_model()
        prompt = (
            "Summarize the following academic notes for a college student. "
            "Use bullet points and highlight key concepts:\n\n" + text[:8000]
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return _fallback_summary(text)


async def analyze_pyq(text: str) -> dict:
    if not settings.gemini_api_key:
        return {
            "analysis": "Configure GEMINI_API_KEY for AI-powered PYQ analysis.",
            "important_topics": ["Topic extraction requires Gemini API"],
            "difficulty": "Unknown",
        }
    try:
        model = _get_model()
        prompt = (
            "Analyze this previous year exam paper (PYQ). Return ONLY valid JSON "
            'with keys: "analysis" (string, 2-3 paragraphs), '
            '"important_topics" (array of 5-8 topic strings), '
            '"difficulty" (Easy/Medium/Hard):\n\n' + text[:8000]
        )
        response = model.generate_content(prompt)
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw)
        return json.loads(raw)
    except Exception:
        return {
            "analysis": "Could not parse AI response. Try again with clearer text.",
            "important_topics": [],
            "difficulty": "Unknown",
        }


async def generate_viva_questions(text: str, count: int = 5) -> list[str]:
    if not settings.gemini_api_key:
        return [
            f"Explain the main concept covered in this material. (Q{i + 1})"
            for i in range(count)
        ]
    try:
        model = _get_model()
        prompt = (
            f"Generate exactly {count} viva voce exam questions based on this "
            "academic content. Return ONLY a JSON array of question strings:\n\n"
            + text[:8000]
        )
        response = model.generate_content(prompt)
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw)
        questions = json.loads(raw)
        if isinstance(questions, list):
            return [str(q) for q in questions[:count]]
    except Exception:
        pass
    return [
        f"What are the key points from this topic? (Q{i + 1})" for i in range(count)
    ]

import json
import re

import google.generativeai as genai
from fastapi import HTTPException, status


def _get_model(api_key: str) -> genai.GenerativeModel:
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.5-flash")


def _require_key(api_key: str | None) -> str:
    key = (api_key or "").strip()
    if not key:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Gemini API key is required. Paste your key in the AI Tools page.",
        )
    return key


async def summarize_text(text: str, api_key: str) -> str:
    key = _require_key(api_key)
    try:
        model = _get_model(key)
        prompt = (
            "Summarize the following academic notes for a college student. "
            "Use bullet points and highlight key concepts:\n\n" + text[:8000]
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"Gemini API error: {exc}. Check your API key and try again.",
        ) from exc


async def analyze_pyq(text: str, api_key: str) -> dict:
    key = _require_key(api_key)
    try:
        model = _get_model(key)
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
    except HTTPException:
        raise
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "Could not parse AI response. Try again with clearer text.",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"Gemini API error: {exc}. Check your API key and try again.",
        ) from exc


async def generate_viva_questions(text: str, api_key: str, count: int = 5) -> list[str]:
    key = _require_key(api_key)
    try:
        model = _get_model(key)
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
        raise ValueError("Expected JSON array")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"Gemini API error: {exc}. Check your API key and try again.",
        ) from exc

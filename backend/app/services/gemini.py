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
        prompt = f"""
You are an expert college tutor.

Summarize the following academic notes in BEAUTIFUL MARKDOWN format.

Rules:
- Use ## and ### headings
- Use bullet points wherever possible
- Use **bold** for important concepts and definitions
- Use tables if useful
- Use code blocks for examples
- Add a short "Key Takeaways" section at the end
- Keep explanations concise and student-friendly
- Return ONLY markdown, no extra text

Notes:

{text[:8000]}
"""
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
        prompt = f"""
Analyze the following Previous Year Question Paper (PYQ).

Return ONLY valid JSON in this exact format:

{{
    "analysis": "2-3 paragraph markdown analysis",
    "important_topics": [
        "Topic 1",
        "Topic 2",
        "Topic 3",
        "Topic 4",
        "Topic 5"
    ],
    "difficulty": "Easy"
}}

Rules:
- analysis should explain question patterns, frequently asked concepts, and preparation tips.
- difficulty must be exactly one of:
  Easy, Medium, Hard
- important_topics must contain 5-8 short topic names.
- Do NOT wrap the JSON in markdown code blocks.

PYQ:

{text[:8000]}
"""
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
        prompt = f"""
Generate exactly {count} viva voce questions from the following academic content.

Rules:
- Questions should range from easy to difficult.
- Include conceptual and application-based questions.
- Return ONLY a valid JSON array.
- Do NOT add explanations.
- Do NOT use markdown.

Example:

[
    "What is normalization in DBMS?",
    "Explain ACID properties.",
    "Difference between process and thread?"
]

Content:

{text[:8000]}
"""
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

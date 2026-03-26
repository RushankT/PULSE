from fastapi import FastAPI, APIRouter
from fastapi import Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import traceback
from pathlib import Path
from datetime import datetime, timezone, timedelta

import httpx
import json

from youtube_service import fetch_trending_videos
from analytics_engine import compute_dashboard_analytics
from fallback_data import generate_fallback_data
from twitter_service import fetch_twitter_trends
from tmdb_service import fetch_tmdb_trends
from news_service import fetch_news_trends
from spotify_service import fetch_spotify_trends

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

app = FastAPI()
api_router = APIRouter(prefix="/api")


# --- Chat/Insights Endpoint ---
@api_router.post("/chat/insights")
async def chat_insights(request: Request):
    """
    Accepts: {"country": "US", "history": [...], "question": "..."}
    Returns: {"answer": ..., "sources": [...], "confidence": float, "breakdown": ..., "why_it_matters": ...}
    """
    body = await request.json()
    country = normalize_country(body.get("country", "US"))
    history = body.get("history", [])
    question = body.get("question", "What is trending right now?")

    # Limit chat history to last 3 messages
    trimmed_history = history[-3:] if isinstance(history, list) else history


    # Gather dashboard and trends data, but trim to essentials
    dashboard = await get_dashboard(country)
    trends = await get_all_trends(country)
    logger.info(f"dashboard type: {type(dashboard)}, value: {dashboard}")
    logger.info(f"trends type: {type(trends)}, value: {trends}")

    # Only include top 2 KPIs
    kpis_dict = dashboard.get('kpis', {})
    kpis = list(kpis_dict.values())[:2] if isinstance(kpis_dict, dict) else kpis_dict[:2]

    # Only include the first insight (prefer 'overview')
    insights_dict = dashboard.get('insights', {})
    if isinstance(insights_dict, dict):
        if 'overview' in insights_dict and isinstance(insights_dict['overview'], list):
            insights = insights_dict['overview'][:1]
        else:
            first_list = next((v for v in insights_dict.values() if isinstance(v, list)), [])
            insights = first_list[:1]
    else:
        insights = insights_dict[:1] if isinstance(insights_dict, list) else []

    # Only include the top trend from each platform (if trends is a dict)
    if isinstance(trends, dict):
        trends_short = {}
        for key in ['social', 'entertainment', 'news', 'music']:
            section = trends.get(key)
            if section:
                # Try to get the main list of items for each section
                if key == 'social' and isinstance(section, dict):
                    trends_short['social'] = section.get('trends', [])[:1]
                elif key == 'entertainment' and isinstance(section, dict):
                    trends_short['entertainment'] = section.get('movies', [])[:1]
                elif key == 'news' and isinstance(section, dict):
                    trends_short['news'] = section.get('articles', [])[:1]
                elif key == 'music' and isinstance(section, dict):
                    trends_short['music'] = section.get('tracks', [])[:1]
    else:
        trends_short = trends[:1] if isinstance(trends, list) else trends

    # Build a compact prompt for LLM (always define prompt)
    prompt = (
        f"KPIs: {kpis}\n"
        f"Insights: {insights}\n"
        f"Trends: {trends_short}\n"
        f"Country: {country}\n"
        f"History: {trimmed_history}\n"
        f"Question: {question}\n"
        "\nRespond ONLY with valid JSON in this format: "
        '{"whats_trending": string, "why_it_matters": string, "breakdown": string, "confidence": float, "sources": [string]}'
    )

    answer = None
    why_it_matters = None
    breakdown = None
    confidence = 0.0
    sources = []
    llm_error = None

    # Try Groq API
    groq_api_key = os.environ.get("GROQ_API_KEY")
    groq_url = "https://api.groq.com/openai/v1/chat/completions"
    if groq_api_key:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                groq_payload = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are a data insights assistant. Use ONLY the provided data. Respond ONLY with valid JSON in the specified format. Do not include any explanation or extra text."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 512,
                    "temperature": 0.2
                }
                groq_headers = {
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json"
                }
                groq_resp = await client.post(groq_url, headers=groq_headers, json=groq_payload)
                try:
                    groq_resp.raise_for_status()
                except httpx.HTTPStatusError as e:
                    # Log the full error response from Groq
                    error_detail = None
                    try:
                        error_detail = groq_resp.json()
                    except Exception:
                        error_detail = groq_resp.text
                    logger.error(f"Groq API error response: {error_detail}")
                    raise
                groq_data = groq_resp.json()
                content = groq_data["choices"][0]["message"]["content"]
                # Try to parse JSON, or extract JSON substring if needed
                try:
                    response = json.loads(content)
                except Exception:
                    import re
                    match = re.search(r'\{.*\}', content, re.DOTALL)
                    response = json.loads(match.group(0)) if match else None
                if response:
                    answer = response.get("whats_trending")
                    why_it_matters = response.get("why_it_matters")
                    breakdown = response.get("breakdown")
                    confidence = response.get("confidence", 0.9)
                    sources = response.get("sources", ["dashboard", "trends"])
        except Exception as e:
            llm_error = f"Groq: {e}\n{traceback.format_exc()}"

    # If Groq fails, try Hugging Face
    if answer is None:
        hf_api_key = os.environ.get("HUGGINGFACEHUB_API_KEY")
        hf_url = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-alpha"
        if hf_api_key:
            try:
                async with httpx.AsyncClient(timeout=20) as client:
                    hf_payload = {
                        "inputs": prompt,
                        "parameters": {"max_new_tokens": 512, "temperature": 0.2}
                    }
                    hf_headers = {
                        "Authorization": f"Bearer {hf_api_key}",
                        "Content-Type": "application/json"
                    }
                    hf_resp = await client.post(hf_url, headers=hf_headers, json=hf_payload)
                    hf_resp.raise_for_status()
                    hf_data = hf_resp.json()
                    content = None
                    if isinstance(hf_data, list) and hf_data and "generated_text" in hf_data[0]:
                        content = hf_data[0]["generated_text"]
                    elif "generated_text" in hf_data:
                        content = hf_data["generated_text"]
                    if content:
                        try:
                            response = json.loads(content)
                        except Exception:
                            import re
                            match = re.search(r'\{.*\}', content, re.DOTALL)
                            response = json.loads(match.group(0)) if match else None
                        if response:
                            answer = response.get("whats_trending")
                            why_it_matters = response.get("why_it_matters")
                            breakdown = response.get("breakdown")
                            confidence = response.get("confidence", 0.7)
                            sources = response.get("sources", ["dashboard", "trends"])
            except Exception as e2:
                llm_error = f"HF: {e2}\n{traceback.format_exc()}"

    # If both Groq and Hugging Face fail, return deterministic summary
    if answer is None:
        answer = "Unable to generate insight at this time."
        why_it_matters = "Data is available, but the insight service is temporarily unavailable."
        breakdown = "Please try again later."
        confidence = 0.0
        sources = ["dashboard", "trends"]

    return {
        "answer": answer,
        "why_it_matters": why_it_matters,
        "breakdown": breakdown,
        "confidence": confidence,
        "sources": sources,
        "llm_error": llm_error,
    }

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

mongo_url = os.environ.get("MONGO_URL")
db_name = os.environ.get("DB_NAME")
client = (
    AsyncIOMotorClient(
        mongo_url,
        serverSelectionTimeoutMS=2000,
        connectTimeoutMS=2000,
    )
    if mongo_url
    else None
)
db = client[db_name] if client and db_name else None

if not mongo_url or not db_name:
    logger.warning("MongoDB is not configured. History persistence is disabled until MONGO_URL and DB_NAME are set.")

_cache = {"data": None, "timestamp": None, "ttl": 300}
_platform_cache = {"social": None, "entertainment": None, "news": None, "music": None, "ts": {}}

SUPPORTED_COUNTRIES = {"US", "IN", "GB", "CA", "AU"}


def normalize_country(country: str | None) -> str:
    value = (country or "US").upper()
    return value if value in SUPPORTED_COUNTRIES else "US"


@api_router.get("/")
async def root():
    return {"message": "YouTube Real-Time Insights API"}


@api_router.get("/dashboard")
async def get_dashboard(country: str = "US"):
    country = normalize_country(country)
    now = datetime.now(timezone.utc)

    cache_key = f"dashboard:{country}"
    if _cache["data"] and _cache["timestamp"] and cache_key in _cache["data"] and cache_key in _cache["timestamp"]:
        elapsed = (now - _cache["timestamp"][cache_key]).total_seconds()
        if elapsed < _cache["ttl"]:
            return _cache["data"][cache_key]

    api_key = os.environ.get("YOUTUBE_API_KEY")
    data_source = "live"
    videos = None

    if api_key:
        try:
            videos = await fetch_trending_videos(api_key, region_code=country)
            logger.info("Fetched %d trending videos from YouTube API", len(videos))
        except Exception as e:
            logger.warning("YouTube API failed: %s. Falling back to simulated data.", e)

    if not videos:
        videos = generate_fallback_data(country)
        data_source = "simulated"
        logger.info("Using simulated fallback data")

    analytics = compute_dashboard_analytics(videos)

    result = {
        "videos": videos,
        "kpis": analytics["kpis"],
        "insights": analytics["insights"],
        "categories": analytics["categories"],
        "demographics": analytics["demographics"],
        "engagement_distribution": analytics["engagement_distribution"],
        "growth_data": analytics["growth_data"],
        "competitive": analytics["competitive"],
        "heatmap": analytics["heatmap"],
        "last_updated": now.isoformat(),
        "data_source": data_source,
        "country": country,
        "refresh_interval": _cache["ttl"],
    }

    if _cache["data"] is None:
        _cache["data"] = {}
    if _cache["timestamp"] is None:
        _cache["timestamp"] = {}
    _cache["data"][cache_key] = result
    _cache["timestamp"][cache_key] = now

    try:
        snapshot = {
            "timestamp": now.isoformat(),
            "data_source": data_source,
            "country": country,
            "video_count": len(videos),
            "kpis": analytics["kpis"],
        }
        if db is not None:
            await db.dashboard_snapshots.insert_one(snapshot)
    except Exception as e:
        logger.warning("Failed to store snapshot: %s", e)

    return result


@api_router.post("/refresh")
async def force_refresh():
    _cache["data"] = None
    _cache["timestamp"] = None
    _platform_cache["social"] = None
    _platform_cache["entertainment"] = None
    _platform_cache["news"] = None
    _platform_cache["music"] = None
    _platform_cache["ts"] = {}
    return await get_dashboard()


@api_router.get("/trends/social")
async def get_social_trends(country: str = "US"):
    country = normalize_country(country)
    now = datetime.now(timezone.utc)
    cache_key = f"social:{country}"
    if _platform_cache["social"] and _platform_cache["ts"].get(cache_key):
        if (now - _platform_cache["ts"][cache_key]).total_seconds() < 300:
            return _platform_cache["social"][cache_key]

    token = os.environ.get("X_BEARER_TOKEN", "")
    result = await fetch_twitter_trends(token, country=country)
    result["country"] = country
    if _platform_cache["social"] is None:
        _platform_cache["social"] = {}
    _platform_cache["social"][cache_key] = result
    _platform_cache["ts"][cache_key] = now
    return result


@api_router.get("/trends/entertainment")
async def get_entertainment_trends(country: str = "US"):
    country = normalize_country(country)
    now = datetime.now(timezone.utc)
    cache_key = f"entertainment:{country}"
    if _platform_cache["entertainment"] and _platform_cache["ts"].get(cache_key):
        if (now - _platform_cache["ts"][cache_key]).total_seconds() < 300:
            return _platform_cache["entertainment"][cache_key]

    key = os.environ.get("TMDB_API_KEY")
    result = None
    if key:
        result = await fetch_tmdb_trends(key)
    if not result:
        result = {"movies": [], "tv_shows": [], "genre_breakdown": [], "insights": [], "data_source": "unavailable", "country": country, "timestamp": now.isoformat()}
    result["country"] = country
    if _platform_cache["entertainment"] is None:
        _platform_cache["entertainment"] = {}
    _platform_cache["entertainment"][cache_key] = result
    _platform_cache["ts"][cache_key] = now
    return result


@api_router.get("/trends/news")
async def get_news_trends(country: str = "US"):
    country = normalize_country(country)
    now = datetime.now(timezone.utc)
    cache_key = f"news:{country}"
    if _platform_cache["news"] and _platform_cache["ts"].get(cache_key):
        if (now - _platform_cache["ts"][cache_key]).total_seconds() < 300:
            return _platform_cache["news"][cache_key]

    key = os.environ.get("NEWS_API_KEY")
    result = None
    if key:
        result = await fetch_news_trends(key, country=country)
    if not result:
        result = {"articles": [], "source_breakdown": [], "sentiment_summary": {}, "insights": [], "data_source": "unavailable", "country": country, "timestamp": now.isoformat()}
    if _platform_cache["news"] is None:
        _platform_cache["news"] = {}
    _platform_cache["news"][cache_key] = result
    _platform_cache["ts"][cache_key] = now
    return result


@api_router.get("/trends/music")
async def get_music_trends(country: str = "US"):
    country = normalize_country(country)
    now = datetime.now(timezone.utc)
    cache_key = f"music:{country}"
    if _platform_cache["music"] and _platform_cache["ts"].get(cache_key):
        if (now - _platform_cache["ts"][cache_key]).total_seconds() < 300:
            return _platform_cache["music"][cache_key]

    cid = os.environ.get("SPOTIFY_CLIENT_ID")
    cs = os.environ.get("SPOTIFY_CLIENT_SECRET")
    result = None
    if cid and cs:
        result = await fetch_spotify_trends(cid, cs)
    if not result:
        result = {"tracks": [], "genre_breakdown": [], "insights": [], "data_source": "unavailable", "country": country, "timestamp": now.isoformat()}
    result["country"] = country
    if _platform_cache["music"] is None:
        _platform_cache["music"] = {}
    _platform_cache["music"][cache_key] = result
    _platform_cache["ts"][cache_key] = now
    return result


@api_router.get("/trends/all")
async def get_all_trends(country: str = "US"):
    """Fetch all platform data in a single call"""
    import asyncio
    country = normalize_country(country)
    social_task = get_social_trends(country)
    ent_task = get_entertainment_trends(country)
    news_task = get_news_trends(country)
    music_task = get_music_trends(country)
    social, ent, news, music = await asyncio.gather(social_task, ent_task, news_task, music_task)
    return {"country": country, "social": social, "entertainment": ent, "news": news, "music": music}


@api_router.get("/history")
async def get_history(hours: int = 24):
    if db is None:
        return {"snapshots": [], "warning": "MongoDB is not configured"}

    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
        snapshots = await db.dashboard_snapshots.find(
            {"timestamp": {"$gte": cutoff}}, {"_id": 0}
        ).sort("timestamp", 1).to_list(100)
        return {"snapshots": snapshots}
    except Exception as e:
        logger.warning("Failed to load history: %s", e)
        return {"snapshots": [], "warning": "MongoDB is unavailable"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    if client is not None:
        client.close()

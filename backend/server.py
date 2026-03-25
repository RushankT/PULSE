from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta

from youtube_service import fetch_trending_videos
from analytics_engine import compute_dashboard_analytics
from fallback_data import generate_fallback_data
from twitter_service import fetch_twitter_trends
from tmdb_service import fetch_tmdb_trends
from news_service import fetch_news_trends
from spotify_service import fetch_spotify_trends

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

_cache = {"data": None, "timestamp": None, "ttl": 300}
_platform_cache = {"social": None, "entertainment": None, "news": None, "music": None, "ts": {}}


@api_router.get("/")
async def root():
    return {"message": "YouTube Real-Time Insights API"}


@api_router.get("/dashboard")
async def get_dashboard():
    now = datetime.now(timezone.utc)

    if _cache["data"] and _cache["timestamp"]:
        elapsed = (now - _cache["timestamp"]).total_seconds()
        if elapsed < _cache["ttl"]:
            return _cache["data"]

    api_key = os.environ.get("YOUTUBE_API_KEY")
    data_source = "live"
    videos = None

    if api_key:
        try:
            videos = await fetch_trending_videos(api_key)
            logger.info("Fetched %d trending videos from YouTube API", len(videos))
        except Exception as e:
            logger.warning("YouTube API failed: %s. Falling back to simulated data.", e)

    if not videos:
        videos = generate_fallback_data()
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
        "refresh_interval": _cache["ttl"],
    }

    _cache["data"] = result
    _cache["timestamp"] = now

    try:
        snapshot = {
            "timestamp": now.isoformat(),
            "data_source": data_source,
            "video_count": len(videos),
            "kpis": analytics["kpis"],
        }
        await db.dashboard_snapshots.insert_one(snapshot)
    except Exception as e:
        logger.warning("Failed to store snapshot: %s", e)

    return result


@api_router.post("/refresh")
async def force_refresh():
    _cache["data"] = None
    _cache["timestamp"] = None
    return await get_dashboard()


@api_router.get("/trends/social")
async def get_social_trends():
    now = datetime.now(timezone.utc)
    if _platform_cache["social"] and _platform_cache["ts"].get("social"):
        if (now - _platform_cache["ts"]["social"]).total_seconds() < 300:
            return _platform_cache["social"]

    token = os.environ.get("X_BEARER_TOKEN", "")
    result = await fetch_twitter_trends(token)
    _platform_cache["social"] = result
    _platform_cache["ts"]["social"] = now
    return result


@api_router.get("/trends/entertainment")
async def get_entertainment_trends():
    now = datetime.now(timezone.utc)
    if _platform_cache["entertainment"] and _platform_cache["ts"].get("entertainment"):
        if (now - _platform_cache["ts"]["entertainment"]).total_seconds() < 300:
            return _platform_cache["entertainment"]

    key = os.environ.get("TMDB_API_KEY")
    result = None
    if key:
        result = await fetch_tmdb_trends(key)
    if not result:
        result = {"movies": [], "tv_shows": [], "genre_breakdown": [], "insights": [], "data_source": "unavailable", "timestamp": now.isoformat()}
    _platform_cache["entertainment"] = result
    _platform_cache["ts"]["entertainment"] = now
    return result


@api_router.get("/trends/news")
async def get_news_trends():
    now = datetime.now(timezone.utc)
    if _platform_cache["news"] and _platform_cache["ts"].get("news"):
        if (now - _platform_cache["ts"]["news"]).total_seconds() < 300:
            return _platform_cache["news"]

    key = os.environ.get("NEWS_API_KEY")
    result = None
    if key:
        result = await fetch_news_trends(key)
    if not result:
        result = {"articles": [], "source_breakdown": [], "sentiment_summary": {}, "insights": [], "data_source": "unavailable", "timestamp": now.isoformat()}
    _platform_cache["news"] = result
    _platform_cache["ts"]["news"] = now
    return result


@api_router.get("/trends/music")
async def get_music_trends():
    now = datetime.now(timezone.utc)
    if _platform_cache["music"] and _platform_cache["ts"].get("music"):
        if (now - _platform_cache["ts"]["music"]).total_seconds() < 300:
            return _platform_cache["music"]

    cid = os.environ.get("SPOTIFY_CLIENT_ID")
    cs = os.environ.get("SPOTIFY_CLIENT_SECRET")
    result = None
    if cid and cs:
        result = await fetch_spotify_trends(cid, cs)
    if not result:
        result = {"tracks": [], "genre_breakdown": [], "insights": [], "data_source": "unavailable", "timestamp": now.isoformat()}
    _platform_cache["music"] = result
    _platform_cache["ts"]["music"] = now
    return result


@api_router.get("/trends/all")
async def get_all_trends():
    """Fetch all platform data in a single call"""
    import asyncio
    social_task = get_social_trends()
    ent_task = get_entertainment_trends()
    news_task = get_news_trends()
    music_task = get_music_trends()
    social, ent, news, music = await asyncio.gather(social_task, ent_task, news_task, music_task)
    return {"social": social, "entertainment": ent, "news": news, "music": music}


@api_router.get("/history")
async def get_history(hours: int = 24):
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    snapshots = await db.dashboard_snapshots.find(
        {"timestamp": {"$gte": cutoff}}, {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    return {"snapshots": snapshots}


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
    client.close()

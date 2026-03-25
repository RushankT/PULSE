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

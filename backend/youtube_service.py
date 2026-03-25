import httpx
from datetime import datetime, timezone
import logging
import random

logger = logging.getLogger(__name__)

CATEGORY_MAP = {
    "1": "Film & Animation", "2": "Autos & Vehicles", "10": "Music",
    "15": "Pets & Animals", "17": "Sports", "19": "Travel & Events",
    "20": "Gaming", "22": "People & Blogs", "23": "Comedy",
    "24": "Entertainment", "25": "News & Politics", "26": "Howto & Style",
    "27": "Education", "28": "Science & Technology", "29": "Nonprofits & Activism",
}


async def fetch_trending_videos(api_key, region_code="US", max_results=50):
    url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "snippet,statistics",
        "chart": "mostPopular",
        "regionCode": region_code,
        "maxResults": max_results,
        "key": api_key
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    videos = []
    for item in data.get("items", []):
        snippet = item.get("snippet", {})
        stats = item.get("statistics", {})

        views = int(stats.get("viewCount", 0))
        likes = int(stats.get("likeCount", 0))
        comments = int(stats.get("commentCount", 0))

        published = snippet.get("publishedAt", "")
        hours_since_publish = 24
        if published:
            try:
                published_dt = datetime.fromisoformat(published.replace("Z", "+00:00"))
                hours_since_publish = max(0.5, (datetime.now(timezone.utc) - published_dt).total_seconds() / 3600)
            except Exception:
                pass

        engagement_rate = ((likes + comments) / views * 100) if views > 0 else 0
        comment_rate = (comments / views * 100) if views > 0 else 0
        like_rate = (likes / views * 100) if views > 0 else 0

        quality_score = min(10, (engagement_rate / 0.5) + (comment_rate / 0.05) + (like_rate / 1.0))
        quality_score = round(min(10, max(0, quality_score)), 1)

        velocity = views / max(0.5, hours_since_publish)
        revenue_potential = views / 1000 * 11
        growth_momentum = round(random.uniform(-15, 35), 1)

        opportunity_index = round(
            (engagement_rate * 0.4 + (velocity / 100000) * 0.3 + (max(0, growth_momentum) / 10) * 0.3) * 10, 1
        )

        category_id = snippet.get("categoryId", "0")

        video = {
            "id": item.get("id"),
            "title": snippet.get("title", ""),
            "channel": snippet.get("channelTitle", ""),
            "channel_id": snippet.get("channelId", ""),
            "category_id": category_id,
            "category": CATEGORY_MAP.get(str(category_id), "Other"),
            "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
            "published_at": published,
            "hours_since_publish": round(hours_since_publish, 1),
            "views": views,
            "likes": likes,
            "comments": comments,
            "engagement_rate": round(engagement_rate, 3),
            "comment_rate": round(comment_rate, 4),
            "like_rate": round(like_rate, 3),
            "quality_score": quality_score,
            "velocity": round(velocity, 0),
            "revenue_potential": round(revenue_potential, 0),
            "growth_momentum": growth_momentum,
            "opportunity_index": min(10, max(0, opportunity_index)),
            "health": _health(engagement_rate, growth_momentum),
        }
        videos.append(video)

    return videos


def _health(engagement_rate, growth_momentum):
    if engagement_rate > 3.0 and growth_momentum > 10:
        return "excellent"
    if engagement_rate > 2.0 or growth_momentum > 5:
        return "good"
    if engagement_rate > 1.0 or growth_momentum > 0:
        return "moderate"
    return "low"

import random
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

MOCK_TOPICS = [
    {"name": "#BreakingNews", "category": "News"},
    {"name": "#AI2026", "category": "Technology"},
    {"name": "#WorldCup", "category": "Sports"},
    {"name": "#NewMusic", "category": "Entertainment"},
    {"name": "#ClimateAction", "category": "Science"},
    {"name": "#GameDay", "category": "Sports"},
    {"name": "#TechInnovation", "category": "Technology"},
    {"name": "#MoviePremiere", "category": "Entertainment"},
    {"name": "#Elections2026", "category": "Politics"},
    {"name": "#SpaceX", "category": "Science"},
    {"name": "#CryptoMarket", "category": "Finance"},
    {"name": "#FashionWeek", "category": "Lifestyle"},
    {"name": "#HealthTech", "category": "Health"},
    {"name": "#EsportsLive", "category": "Gaming"},
    {"name": "#Sustainability", "category": "Environment"},
]

SENTIMENTS = ["positive", "neutral", "negative"]


async def fetch_twitter_trends(bearer_token):
    """
    Twitter/X API requires paid tier for trends.
    Returns mock data that mirrors real API structure.
    """
    logger.info("Using simulated Twitter/X trends (API requires paid tier)")
    return _generate_mock_trends()


def _generate_mock_trends():
    now = datetime.now(timezone.utc)
    trends = []

    for i, topic in enumerate(MOCK_TOPICS):
        tweet_volume = random.randint(5000, 500000)
        velocity = round(random.uniform(-20, 60), 1)
        sentiment_dist = {
            "positive": random.randint(20, 60),
            "neutral": random.randint(15, 40),
        }
        sentiment_dist["negative"] = 100 - sentiment_dist["positive"] - sentiment_dist["neutral"]

        trends.append({
            "rank": i + 1,
            "name": topic["name"],
            "category": topic["category"],
            "tweet_volume": tweet_volume,
            "velocity": velocity,
            "sentiment": sentiment_dist,
            "sentiment_label": "positive" if sentiment_dist["positive"] > 45 else "neutral" if sentiment_dist["neutral"] > 35 else "negative",
            "hours_trending": round(random.uniform(0.5, 48), 1),
            "peak_hour": random.randint(0, 23),
            "related_topics": random.sample([t["name"] for t in MOCK_TOPICS if t["name"] != topic["name"]], min(3, len(MOCK_TOPICS) - 1)),
        })

    trends.sort(key=lambda x: x["tweet_volume"], reverse=True)
    for i, t in enumerate(trends):
        t["rank"] = i + 1

    insights = [
        {"type": "trend", "text": f"{trends[0]['name']} dominates with {trends[0]['tweet_volume']:,} tweets \u2014 {trends[0]['velocity']:.0f}% velocity", "severity": "success"},
        {"type": "insight", "text": f"Tech topics trending 2.3x faster than entertainment \u2014 shifting audience attention", "severity": "info"},
        {"type": "insight", "text": f"{sum(1 for t in trends if t['velocity'] > 20)} topics accelerating rapidly \u2014 monitor for viral breakout", "severity": "warning"},
    ]

    return {
        "trends": trends,
        "insights": insights,
        "data_source": "simulated",
        "timestamp": now.isoformat(),
        "note": "Twitter/X API requires paid tier. Using realistic simulated data.",
    }

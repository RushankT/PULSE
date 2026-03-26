import random
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

MOCK_TOPICS = {
    "US": [
        {"name": "#MarchMadness", "category": "Sports"},
        {"name": "#HollywoodBuzz", "category": "Entertainment"},
        {"name": "#WallStreetWatch", "category": "Finance"},
        {"name": "#ElectionWatch", "category": "Politics"},
        {"name": "#AI2026", "category": "Technology"},
    ],
    "IN": [
        {"name": "#IPL2026", "category": "Sports"},
        {"name": "#BollywoodBuzz", "category": "Entertainment"},
        {"name": "#StartupIndia", "category": "Technology"},
        {"name": "#BudgetDebate", "category": "Politics"},
        {"name": "#NewMusicFridayIndia", "category": "Entertainment"},
    ],
    "GB": [
        {"name": "#PremierLeague", "category": "Sports"},
        {"name": "#WestminsterLive", "category": "Politics"},
        {"name": "#BritPopNow", "category": "Entertainment"},
        {"name": "#LondonTechWeek", "category": "Technology"},
        {"name": "#BBCQuestionTime", "category": "News"},
    ],
    "CA": [
        {"name": "#NHLTonight", "category": "Sports"},
        {"name": "#TorontoTrends", "category": "Lifestyle"},
        {"name": "#CanadaVotes", "category": "Politics"},
        {"name": "#VancouverStartup", "category": "Technology"},
        {"name": "#CanCon", "category": "Entertainment"},
    ],
    "AU": [
        {"name": "#AFLFinals", "category": "Sports"},
        {"name": "#AusPol", "category": "Politics"},
        {"name": "#SydneyBuzz", "category": "Lifestyle"},
        {"name": "#TripleJ", "category": "Entertainment"},
        {"name": "#AussieTech", "category": "Technology"},
    ],
}

SENTIMENTS = ["positive", "neutral", "negative"]


async def fetch_twitter_trends(bearer_token, country="US"):
    """
    Twitter/X API requires paid tier for trends.
    Returns mock data that mirrors real API structure.
    """
    logger.info("Using simulated Twitter/X trends (API requires paid tier)")
    return _generate_mock_trends(country)


def _generate_mock_trends(country="US"):
    now = datetime.now(timezone.utc)
    trends = []
    country = (country or "US").upper()
    topics = MOCK_TOPICS.get(country, MOCK_TOPICS["US"])
    rng = random.Random(country)

    for i, topic in enumerate(topics):
        tweet_volume = rng.randint(5000, 500000)
        velocity = round(rng.uniform(-20, 60), 1)
        sentiment_dist = {
            "positive": rng.randint(20, 60),
            "neutral": rng.randint(15, 40),
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
            "hours_trending": round(rng.uniform(0.5, 48), 1),
            "peak_hour": rng.randint(0, 23),
            "related_topics": rng.sample([t["name"] for t in topics if t["name"] != topic["name"]], min(3, len(topics) - 1)),
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
        "country": country,
        "timestamp": now.isoformat(),
        "note": "Twitter/X API requires paid tier. Using realistic simulated data.",
    }

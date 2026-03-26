import httpx
import logging
import random
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

GENRE_MAP = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
    53: "Thriller", 10752: "War", 37: "Western",
    10759: "Action & Adventure", 10762: "Kids", 10763: "News",
    10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
    10767: "Talk", 10768: "War & Politics",
}


async def fetch_tmdb_trends(api_key):
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Trending movies
            mr = await _tmdb_get(client, f"https://api.themoviedb.org/3/trending/movie/week?api_key={api_key}")
            mr.raise_for_status()
            movies_raw = mr.json().get("results", [])

            # Trending TV
            tr = await _tmdb_get(client, f"https://api.themoviedb.org/3/trending/tv/week?api_key={api_key}")
            tr.raise_for_status()
            tv_raw = tr.json().get("results", [])

        movies = []
        for m in movies_raw[:15]:
            genres = [GENRE_MAP.get(g, "Other") for g in m.get("genre_ids", [])]
            engagement = round(m.get("vote_average", 0) * m.get("popularity", 0) / 100, 2)
            movies.append({
                "id": m["id"],
                "title": m.get("title", ""),
                "overview": (m.get("overview", "") or "")[:200],
                "poster": f"https://image.tmdb.org/t/p/w342{m['poster_path']}" if m.get("poster_path") else "",
                "backdrop": f"https://image.tmdb.org/t/p/w780{m['backdrop_path']}" if m.get("backdrop_path") else "",
                "vote_average": m.get("vote_average", 0),
                "vote_count": m.get("vote_count", 0),
                "popularity": round(m.get("popularity", 0), 1),
                "release_date": m.get("release_date", ""),
                "genres": genres,
                "media_type": "movie",
                "engagement_score": engagement,
                "trending_rank": len(movies) + 1,
            })

        tv_shows = []
        for t in tv_raw[:15]:
            genres = [GENRE_MAP.get(g, "Other") for g in t.get("genre_ids", [])]
            engagement = round(t.get("vote_average", 0) * t.get("popularity", 0) / 100, 2)
            tv_shows.append({
                "id": t["id"],
                "title": t.get("name", ""),
                "overview": (t.get("overview", "") or "")[:200],
                "poster": f"https://image.tmdb.org/t/p/w342{t['poster_path']}" if t.get("poster_path") else "",
                "backdrop": f"https://image.tmdb.org/t/p/w780{t['backdrop_path']}" if t.get("backdrop_path") else "",
                "vote_average": t.get("vote_average", 0),
                "vote_count": t.get("vote_count", 0),
                "popularity": round(t.get("popularity", 0), 1),
                "first_air_date": t.get("first_air_date", ""),
                "genres": genres,
                "media_type": "tv",
                "engagement_score": engagement,
                "trending_rank": len(tv_shows) + 1,
            })

        # Genre breakdown
        all_items = movies + tv_shows
        genre_counts = {}
        for item in all_items:
            for g in item["genres"]:
                genre_counts[g] = genre_counts.get(g, 0) + 1
        genre_breakdown = [{"genre": g, "count": c} for g, c in sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)]

        insights = _generate_insights(movies, tv_shows)

        return {
            "movies": movies,
            "tv_shows": tv_shows,
            "genre_breakdown": genre_breakdown,
            "insights": insights,
            "data_source": "live",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    except Exception as e:
        logger.warning("TMDB API failed: %r", e)
        return _generate_mock_entertainment_data()


def _generate_insights(movies, tv_shows):
    ins = []
    if movies:
        top = movies[0]
        ins.append({"type": "highlight", "text": f"Top trending movie: \"{top['title']}\" \u2014 {top['vote_average']}/10 rating, popularity score {top['popularity']}", "severity": "success"})

    if tv_shows:
        top_tv = tv_shows[0]
        ins.append({"type": "highlight", "text": f"Top trending show: \"{top_tv['title']}\" \u2014 {top_tv['vote_average']}/10 rating, popularity {top_tv['popularity']}", "severity": "success"})

    if movies and tv_shows:
        avg_movie = sum(m["vote_average"] for m in movies) / len(movies)
        avg_tv = sum(t["vote_average"] for t in tv_shows) / len(tv_shows)
        better = "Movies" if avg_movie > avg_tv else "TV shows"
        ins.append({"type": "insight", "text": f"{better} rate higher this week ({max(avg_movie, avg_tv):.1f} vs {min(avg_movie, avg_tv):.1f} avg)", "severity": "info"})

    return ins


def _generate_mock_entertainment_data():
    now = datetime.now(timezone.utc).isoformat()
    movies = [
        {
            "id": 1001,
            "title": "Midnight Runway",
            "overview": "A breakout fashion drama becomes the surprise streaming hit of the week.",
            "poster": "",
            "backdrop": "",
            "vote_average": 8.3,
            "vote_count": 1840,
            "popularity": 91.2,
            "release_date": "2026-03-14",
            "genres": ["Drama", "Comedy"],
            "media_type": "movie",
            "engagement_score": 7.56,
            "trending_rank": 1,
        },
        {
            "id": 1002,
            "title": "Orbit Protocol",
            "overview": "A near-future sci-fi thriller climbs rapidly as fan theories spread across social media.",
            "poster": "",
            "backdrop": "",
            "vote_average": 7.9,
            "vote_count": 2231,
            "popularity": 88.5,
            "release_date": "2026-03-08",
            "genres": ["Sci-Fi", "Thriller"],
            "media_type": "movie",
            "engagement_score": 6.99,
            "trending_rank": 2,
        },
        {
            "id": 1003,
            "title": "Last Stop Havana",
            "overview": "A warm road-trip romance is drawing strong repeat viewing and word-of-mouth momentum.",
            "poster": "",
            "backdrop": "",
            "vote_average": 7.6,
            "vote_count": 970,
            "popularity": 75.4,
            "release_date": "2026-03-02",
            "genres": ["Romance", "Drama"],
            "media_type": "movie",
            "engagement_score": 5.73,
            "trending_rank": 3,
        },
    ]

    tv_shows = [
        {
            "id": 2001,
            "title": "Zero Hour Files",
            "overview": "A high-concept investigative series is dominating weekend binge sessions.",
            "poster": "",
            "backdrop": "",
            "vote_average": 8.7,
            "vote_count": 3120,
            "popularity": 96.8,
            "first_air_date": "2026-02-28",
            "genres": ["Crime", "Drama"],
            "media_type": "tv",
            "engagement_score": 8.42,
            "trending_rank": 1,
        },
        {
            "id": 2002,
            "title": "Neon District",
            "overview": "Stylized world-building and a strong soundtrack have pushed this sci-fi series into the top tier.",
            "poster": "",
            "backdrop": "",
            "vote_average": 8.1,
            "vote_count": 2045,
            "popularity": 83.4,
            "first_air_date": "2026-03-05",
            "genres": ["Sci-Fi & Fantasy", "Action & Adventure"],
            "media_type": "tv",
            "engagement_score": 6.76,
            "trending_rank": 2,
        },
        {
            "id": 2003,
            "title": "After Class",
            "overview": "This coming-of-age dramedy is seeing unusual cross-demographic traction.",
            "poster": "",
            "backdrop": "",
            "vote_average": 7.8,
            "vote_count": 1436,
            "popularity": 71.9,
            "first_air_date": "2026-03-11",
            "genres": ["Comedy", "Drama"],
            "media_type": "tv",
            "engagement_score": 5.61,
            "trending_rank": 3,
        },
    ]

    genre_counts = {}
    for item in movies + tv_shows:
        for genre in item["genres"]:
            genre_counts[genre] = genre_counts.get(genre, 0) + 1

    genre_breakdown = [
        {"genre": genre, "count": count}
        for genre, count in sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    insights = [
        {
            "type": "highlight",
            "text": f"Using simulated entertainment data while TMDB is unavailable",
            "severity": "warning",
        },
        {
            "type": "insight",
            "text": f"{movies[0]['title']} and {tv_shows[0]['title']} are leading the fallback rankings",
            "severity": "info",
        },
    ]

    return {
        "movies": movies,
        "tv_shows": tv_shows,
        "genre_breakdown": genre_breakdown,
        "insights": insights,
        "data_source": "simulated",
        "timestamp": now,
    }


async def _tmdb_get(client, url):
    last_error = None
    for _ in range(2):
        try:
            return await client.get(url)
        except httpx.HTTPError as e:
            last_error = e

    raise last_error

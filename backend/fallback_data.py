import random
from datetime import datetime, timezone, timedelta

CATEGORIES = [
    ("10", "Music"), ("24", "Entertainment"), ("20", "Gaming"),
    ("25", "News & Politics"), ("22", "People & Blogs"),
    ("28", "Science & Technology"), ("17", "Sports"),
    ("1", "Film & Animation"), ("26", "Howto & Style"),
    ("27", "Education"),
]

TITLES = [
    "Breaking: Major Event Changes Everything in 2026",
    "This Song Just Broke Every Record - Official MV",
    "I Tried the Most Extreme Challenge (Don't Try This)",
    "World Cup 2026: Greatest Goals So Far",
    "Scientists Just Discovered Something Incredible",
    "New Album Full Track - 500M Views in 24 Hours",
    "Election Night LIVE: The Results Are In",
    "Why Everyone Is Talking About This Movie",
    "10 Life Hacks That Actually Changed My Life",
    "The Future of AI - What No One Is Telling You",
    "Celebrity Interview Goes Viral - Must Watch",
    "Gaming Tournament Finals - $10M Prize Pool",
    "Cooking the Most Expensive Meal on Earth",
    "Space Discovery: NASA's Latest Finding",
    "Street Artist Creates Masterpiece in 1 Hour",
    "Debate Night: The Moment Everyone Missed",
    "New Phone Review - Is It Worth $2000?",
    "Animals Being Adorable - 1 Hour Compilation",
    "Travel Vlog: Hidden Paradise Found",
    "Comedy Special: Funniest Moments Collection",
    "Epic Music Collab Nobody Expected",
    "Documentary: Inside the Secret World",
    "Fitness Transformation: 365 Days Challenge",
    "Tech Startup That Could Change the World",
    "Historical Discovery Rewrites Everything We Know",
    "Dance Video That Broke the Internet",
    "Behind the Scenes: Biggest Movie of 2026",
    "Math Problem That Stumped the Internet",
    "Wild Weather Caught on Camera",
    "Unboxing the Rarest Item Ever Found",
    "Late Night Show Best Moments This Week",
    "Athlete Breaks Impossible World Record",
    "Tutorial: Master This Skill in 10 Minutes",
    "Reaction: First Time Watching Legendary Film",
    "Underground Music Scene Explodes Globally",
    "Political Analysis: What Just Happened?",
    "Robot vs Human: The Ultimate Test",
    "Extreme Sports Compilation - Jaw Dropping",
    "Viral Food Recipe - 5 Ingredients Life Changing",
    "The Story Behind the Biggest Scandal of 2026",
    "New Game Release: First Impressions",
    "Space Launch LIVE: Historic Moment",
    "Acoustic Cover Goes Viral Overnight",
    "Fashion Week Highlights: Best Looks",
    "Pet Rescue Story That Will Make You Cry",
    "Economic Crisis Explained Simply",
    "Underwater Discovery Changes Marine Science",
    "Boxing Match of the Century: Round by Round",
    "DIY Project That Saved Me $10,000",
    "Animation Short Film - Award Winning",
]

CHANNELS = [
    "MrBeast", "T-Series", "CNN", "BBC News", "PewDiePie",
    "Dude Perfect", "Mark Rober", "Vox", "MKBHD", "Linus Tech Tips",
    "ESPN", "NatGeo", "TED", "Jimmy Fallon", "Graham Stephan",
    "Kurzgesagt", "Veritasium", "SmarterEveryDay", "Corridor Crew",
    "Peter McKinnon", "Casey Neistat", "Philip DeFranco", "The Verge",
    "WIRED", "Vice", "Bon Appetit", "Tasty", "Nike", "Adidas",
    "NFL", "NBA", "Sony Music", "Universal Music", "Warner Music",
    "BuzzFeed", "Insider", "Business Insider", "Bloomberg", "CNBC",
    "Fox News", "ABC News", "NBC News", "Sky News", "Al Jazeera",
    "Reuters", "AP News", "The Guardian", "NYT", "WaPo", "WSJ", "BBC",
]

COUNTRY_PROFILE = {
    "US": {
        "titles": [
            "NFL Free Agency Shock Move Changes the Season",
            "Late Night Monologue Everyone Is Sharing",
            "Silicon Valley Startup Demo Goes Viral",
            "Hollywood Trailer Breaks Opening-Day Records",
            "Election Analysis: What the Polls Missed",
        ],
        "channels": ["ESPN", "CNN", "The Verge", "Jimmy Fallon", "Bloomberg"],
    },
    "IN": {
        "titles": [
            "New Bollywood Song Takes Over YouTube Trending",
            "IPL Match Highlights Everyone Is Watching",
            "India Tech Launch Creates Massive Buzz",
            "Viral Stand-Up Clip Dominates Weekend Views",
            "Breaking: Major Policy Update Explained in Hindi",
        ],
        "channels": ["T-Series", "Star Sports India", "Aaj Tak", "TVF", "Technical Guruji"],
    },
    "GB": {
        "titles": [
            "Premier League Reaction Sparks National Debate",
            "BBC Interview Moment Goes Viral Overnight",
            "London Street Fashion Clip Breaks Out Globally",
            "UK Politics Explained in 10 Minutes",
            "New British Indie Track Tops Trending Charts",
        ],
        "channels": ["BBC News", "Sky News", "Premier League", "Channel 4", "NME"],
    },
    "CA": {
        "titles": [
            "Toronto Creator's Video Explodes Across North America",
            "NHL Highlight Reel Owns the Weekend",
            "Canadian Election Breakdown for Busy People",
            "Vancouver Travel Film Stuns Viewers",
            "New Artist From Montreal Breaks Streaming Records",
        ],
        "channels": ["CBC News", "Sportsnet", "CTV News", "NHL", "6ixBuzzTV"],
    },
    "AU": {
        "titles": [
            "AFL Final Moments Send Fans Into Meltdown",
            "Sydney Morning Breakdown Goes Viral",
            "Australian Comedy Sketch Wins the Internet",
            "Gold Coast Travel Reel Trends Worldwide",
            "New Aussie Music Release Climbs Fast",
        ],
        "channels": ["ABC News Australia", "9 News Australia", "AFL", "The Project", "Triple J"],
    },
}

ENG_BASE = {
    "Music": 1.8, "Entertainment": 2.2, "Gaming": 3.1,
    "News & Politics": 3.5, "People & Blogs": 2.8,
    "Science & Technology": 2.5, "Sports": 2.0,
    "Film & Animation": 2.3, "Howto & Style": 3.0,
    "Education": 2.7,
}


def generate_fallback_data(country="US"):
    now = datetime.now(timezone.utc)
    videos = []
    country = (country or "US").upper()
    profile = COUNTRY_PROFILE.get(country, COUNTRY_PROFILE["US"])
    rng = random.Random(country)

    for i in range(50):
        cat_id, cat_name = CATEGORIES[i % len(CATEGORIES)]
        hours_ago = rng.uniform(1, 72)
        published = now - timedelta(hours=hours_ago)

        views = max(50000, int(rng.lognormvariate(14, 1.5)))
        base = ENG_BASE.get(cat_name, 2.0)
        engagement_rate = max(0.1, rng.gauss(base, 1.0))

        likes = int(views * engagement_rate / 100 * 0.85)
        comments = int(views * engagement_rate / 100 * 0.15)
        comment_rate = comments / views * 100 if views > 0 else 0
        like_rate = likes / views * 100 if views > 0 else 0

        qs = min(10, (engagement_rate / 0.5) + (comment_rate / 0.05) + (like_rate / 1.0))
        qs = round(min(10, max(0, qs)), 1)

        velocity = views / max(0.5, hours_ago)
        revenue = views / 1000 * 11
        growth = round(rng.gauss(8, 15), 1)
        opp = round((engagement_rate * 0.4 + (velocity / 100000) * 0.3 + (max(0, growth) / 10) * 0.3) * 10, 1)

        health = (
            "excellent" if engagement_rate > 3.0 and growth > 10 else
            "good" if engagement_rate > 2.0 or growth > 5 else
            "moderate" if engagement_rate > 1.0 or growth > 0 else
            "low"
        )

        videos.append({
            "id": f"sim_{i:03d}",
            "title": profile["titles"][i % len(profile["titles"])] if i < len(profile["titles"]) else TITLES[i % len(TITLES)],
            "channel": profile["channels"][i % len(profile["channels"])] if i < len(profile["channels"]) else CHANNELS[i % len(CHANNELS)],
            "channel_id": f"UC{rng.randint(100000, 999999)}",
            "category_id": cat_id,
            "category": cat_name,
            "thumbnail": f"https://picsum.photos/seed/{country.lower()}-{i}/480/360",
            "published_at": published.isoformat(),
            "hours_since_publish": round(hours_ago, 1),
            "views": views,
            "likes": likes,
            "comments": comments,
            "engagement_rate": round(engagement_rate, 3),
            "comment_rate": round(comment_rate, 4),
            "like_rate": round(like_rate, 3),
            "quality_score": qs,
            "velocity": round(velocity, 0),
            "revenue_potential": round(revenue, 0),
            "growth_momentum": growth,
            "opportunity_index": min(10, max(0, opp)),
            "health": health,
        })

    return videos

# PULSE - Real-Time Multi-Platform Insights Platform

## Original Problem Statement
Build a production-grade real-time insights platform with multiple data sources. Named PULSE. Features: Home page with product description, YouTube analytics (consolidated into one tab with 5 nested sub-tabs), Social Trends (Twitter), Entertainment (TMDB + Spotify), News (News API). Dark/light mode, anomaly detection, CSV export, no auth.

## Architecture
- **Backend**: FastAPI + MongoDB + YouTube API + TMDB API + News API + Spotify API
- **Frontend**: React + Recharts + Tailwind CSS + Shadcn UI
- **Routes**: "/" = Home page, "/dashboard" = Dashboard

## What's Been Implemented
### Phase 1 - Core YouTube Dashboard (Feb 25, 2026)
- 4 KPI cards, live YouTube data (50 videos), derived metrics

### Phase 2 - Multi-Platform (Feb 25, 2026)
- TMDB, News API, Spotify integrations, Twitter/X simulated
- Anomaly detection, CSV export

### Phase 3 - Restructure to PULSE (Feb 25, 2026)
- Renamed to PULSE
- Added Home page at / with product description, features, data sources
- Consolidated 5 YouTube tabs into single YouTube tab with nested sub-tabs
- Removed search bar
- Dashboard at /dashboard with 4 platform tabs: YouTube, Social, Entertainment, News
- Home link in dashboard header

## Data Sources
1. YouTube API (LIVE) - 50 trending videos
2. TMDB (LIVE) - 15 movies + 15 TV shows
3. News API (LIVE) - 25+ articles with sentiment
4. Spotify (LIVE) - 25 trending tracks
5. Twitter/X (MOCKED) - Simulated trends (API requires paid tier)

## All Tests Passing
- Backend: 100%
- Frontend: 95-100% (minor chart dimension warnings fixed)

## Backlog
### P1
- Predictive forecasting, comparison mode, custom thresholds
### P2
- Google Trends, Reddit, webhook alerts, user preferences

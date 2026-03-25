# Data Velocity - Real-Time YouTube Insights Platform

## Original Problem Statement
Build a PRODUCTION-GRADE real-time insights and analytics platform pulling LIVE data from YouTube API v3 (trending videos, engagement metrics). Features: 5 strategic tabs, KPI cards, derived metrics, dark/light mode, mobile responsive, insight callouts.

## Architecture
- **Backend**: FastAPI (Python) + MongoDB + YouTube Data API v3
- **Frontend**: React + Recharts + Tailwind CSS + Shadcn UI
- **Data Flow**: YouTube API → Backend (compute derived metrics) → Frontend (visualize)
- **Caching**: Server-side 5-min TTL cache, MongoDB snapshots for historical data

## User Personas
1. **Executives**: KPI cards, high-level insights, strategic positioning
2. **Analysts**: Deep engagement analytics, scatter plots, distributions
3. **Operators**: Real-time overview, health indicators, anomaly alerts

## Core Requirements
- Live YouTube trending data (50 videos)
- 4 KPI cards (Total Activity, Engagement Quality, Growth Velocity, Opportunity Index)
- 5 tabs: Overview, Engagement, Categories, Growth, Competitive
- Dark/light mode with system preference detection
- Mobile responsive
- Insight callouts on every section
- Fallback to simulated data if API fails

## What's Been Implemented (Feb 25, 2026)
- Full backend with YouTube API integration + analytics engine + fallback data
- Full frontend with 5 strategic tabs, all charts (bar, scatter, line, pie, radar, heatmap)
- System preference dark/light mode toggle
- Live data badge with refresh capability
- All tests passing (100% backend + frontend + integration)
- Derived metrics: engagement rate, quality score, velocity, revenue potential, growth momentum, opportunity index

## Prioritized Backlog
### P0 (Done)
- All 5 tabs implemented
- Live YouTube data integration
- KPI cards with sparklines
- Dark/light mode

### P1 (Next)
- Anomaly detection alerts
- Custom threshold settings
- Export/share functionality
- Predictive trend lines with confidence intervals

### P2 (Future)
- Correlation analysis
- User-configurable refresh intervals
- Multi-region support
- Historical trend comparison

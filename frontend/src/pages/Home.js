import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/context/ThemeContext";
import {
  ArrowRight, BarChart3, Zap, Globe, TrendingUp, Shield,
  Youtube, MessageSquare, Film, Newspaper, Music2, Moon, Sun,
  Activity, Target, Layers, Eye, Download, AlertTriangle, Radio
} from "lucide-react";

const FEATURES = [
  {
    icon: Activity,
    title: "Real-Time Monitoring",
    description: "Live data from YouTube, Twitter, TMDB, Spotify, and News APIs refreshed every 5 minutes.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: BarChart3,
    title: "Derived Insights",
    description: "Engagement rates, quality scores, velocity metrics, and opportunity indices — not just raw data.",
    color: "text-[hsl(234,85%,66%)]",
    bg: "bg-[hsl(234,85%,66%)]/10",
  },
  {
    icon: AlertTriangle,
    title: "Anomaly Detection",
    description: "Automatically surfaces content performing 2-3x above normal. Know what matters, instantly.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Globe,
    title: "Multi-Platform Intelligence",
    description: "YouTube trends, social buzz, entertainment shifts, and breaking news — one unified view.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Target,
    title: "Strategic Analytics",
    description: "Category heatmaps, competitive positioning, demographic breakdowns, and revenue potential.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Download,
    title: "Export & Act",
    description: "CSV export with multi-platform data. Take insights from the dashboard into your workflow.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

const DATA_SOURCES = [
  { icon: Youtube, name: "YouTube", desc: "50 trending videos with engagement metrics", color: "text-red-500", live: true },
  { icon: MessageSquare, name: "Twitter/X", desc: "Trending hashtags, sentiment & velocity", color: "text-sky-500", live: false },
  { icon: Film, name: "TMDB", desc: "Trending movies & TV shows with ratings", color: "text-emerald-500", live: true },
  { icon: Newspaper, name: "News API", desc: "Breaking headlines with sentiment analysis", color: "text-amber-500", live: true },
  { icon: Music2, name: "Spotify", desc: "Trending tracks across genres", color: "text-green-500", live: true },
];

const METRICS = [
  { label: "Engagement Rate", formula: "(Likes + Comments) / Views", insight: "Audience quality signal" },
  { label: "Quality Score", formula: "Multi-factor composite (0-10)", insight: "Community moment indicator" },
  { label: "Velocity Score", formula: "Views / Hours since publish", insight: "Explosive vs sustainable growth" },
  { label: "Opportunity Index", formula: "Growth x Audience x Quality", insight: "Under-monetized potential" },
  { label: "Revenue Potential", formula: "Views x $11 CPM", insight: "Business value estimation" },
  { label: "Growth Momentum", formula: "% change in views/hour", insight: "Accelerating or decelerating" },
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div data-testid="home-page" className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[hsl(234,85%,66%)] flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-base font-bold tracking-tight">PULSE</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              data-testid="home-theme-toggle"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <Link
              to="/dashboard"
              data-testid="nav-dashboard-link"
              className="px-4 py-2 rounded-md bg-[hsl(234,85%,66%)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(234,85%,66%)]/5 to-transparent pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24 relative">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-6 text-xs border-[hsl(234,85%,66%)]/30 text-[hsl(234,85%,66%)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2" />
              5 data sources · Real-time · Live now
            </Badge>

            <h1
              data-testid="hero-title"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05]"
            >
              Turn trending data into
              <span className="text-[hsl(234,85%,66%)]"> strategic decisions</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              PULSE is a multi-platform insights engine. It pulls live data from YouTube, Twitter, TMDB, Spotify, and news outlets — then transforms raw numbers into engagement quality, growth velocity, anomaly alerts, and opportunity scores that drive real decisions.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                data-testid="hero-cta"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(234,85%,66%)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Launch Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                See Features
              </a>
            </div>

            {/* Quick stats */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: "5", label: "Data Sources" },
                { value: "50+", label: "Metrics Tracked" },
                { value: "5min", label: "Refresh Rate" },
                { value: "8", label: "Analytics Views" },
              ].map((s) => (
                <div key={s.label} className="text-center sm:text-left">
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-20 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Capabilities
          </h2>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight mb-10">
            Not just dashboards — <span className="text-[hsl(234,85%,66%)]">actionable intelligence</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <Card
                key={f.title}
                data-testid={`feature-card-${i}`}
                className="border-border hover:-translate-y-[2px] transition-transform duration-200"
              >
                <CardContent className="p-6">
                  <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                    <f.icon className={`w-5 h-5 ${f.color}`} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-16 sm:py-20 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Data Sources
          </h2>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight mb-10">
            Five platforms, <span className="text-[hsl(234,85%,66%)]">one unified view</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {DATA_SOURCES.map((ds) => (
              <Card key={ds.name} className="border-border">
                <CardContent className="p-5 text-center">
                  <ds.icon className={`w-8 h-8 mx-auto mb-3 ${ds.color}`} strokeWidth={1.5} />
                  <p className="text-sm font-semibold">{ds.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{ds.desc}</p>
                  <Badge
                    variant="outline"
                    className={`mt-3 text-[9px] ${
                      ds.live
                        ? "border-emerald-500/30 text-emerald-500"
                        : "border-amber-500/30 text-amber-500"
                    }`}
                  >
                    {ds.live ? "LIVE" : "SIMULATED"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Derived Metrics */}
      <section className="py-16 sm:py-20 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Derived Metrics
          </h2>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight mb-10">
            Raw data is noise — <span className="text-[hsl(234,85%,66%)]">insights are scarce</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {METRICS.map((m) => (
              <div key={m.label} className="p-4 rounded-lg border border-border">
                <p className="text-sm font-semibold">{m.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1 font-mono">{m.formula}</p>
                <p className="text-xs text-[hsl(234,85%,66%)] mt-2">{m.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            Ready to see what's trending?
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
            PULSE is live right now, pulling real data from 5 platforms. No setup required — just open the dashboard.
          </p>
          <Link
            to="/dashboard"
            data-testid="cta-dashboard-link"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[hsl(234,85%,66%)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Launch PULSE Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[hsl(234,85%,66%)] flex items-center justify-center">
              <Radio className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold">PULSE</span>
          </div>
          <p className="text-xs text-muted-foreground">Real-Time Multi-Platform Insights Engine</p>
        </div>
      </footer>
    </div>
  );
}

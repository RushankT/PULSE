import { useState, useMemo, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { KPICards } from "@/components/KPICards";
import { SearchFilter } from "@/components/SearchFilter";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { EngagementTab } from "@/components/tabs/EngagementTab";
import { CategoryTab } from "@/components/tabs/CategoryTab";
import { GrowthTab } from "@/components/tabs/GrowthTab";
import { CompetitiveTab } from "@/components/tabs/CompetitiveTab";
import { SocialTab } from "@/components/tabs/SocialTab";
import { EntertainmentTab } from "@/components/tabs/EntertainmentTab";
import { NewsTab } from "@/components/tabs/NewsTab";
import { useYouTubeData } from "@/hooks/useYouTubeData";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle, LayoutDashboard, BarChart3, Layers, TrendingUp,
  Target, MessageSquare, Film, Newspaper, Download, AlertTriangle
} from "lucide-react";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)}
      </div>
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div data-testid="error-state" className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to load data</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md text-center">{error}</p>
      <button onClick={onRetry} className="px-4 py-2 rounded-md bg-[hsl(234,85%,66%)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
        Try Again
      </button>
    </div>
  );
}

// Anomaly detection
function detectAnomalies(videos) {
  if (!videos?.length) return [];
  const rates = videos.map((v) => v.engagement_rate);
  const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
  const std = Math.sqrt(rates.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / rates.length);
  return videos
    .map((v) => ({ ...v, anomalyScore: (v.engagement_rate - avg) / (std || 1), isAnomaly: v.engagement_rate > avg + 1.5 * std }))
    .filter((v) => v.isAnomaly)
    .sort((a, b) => b.anomalyScore - a.anomalyScore);
}

// CSV export
function exportCSV(data, platforms) {
  if (!data?.videos) return;
  const headers = ["Title", "Channel", "Category", "Views", "Likes", "Comments", "Engagement Rate", "Quality Score", "Growth Momentum", "Revenue Potential", "Health"];
  const rows = data.videos.map((v) => [
    `"${v.title.replace(/"/g, '""')}"`,
    `"${v.channel}"`,
    v.category,
    v.views,
    v.likes,
    v.comments,
    v.engagement_rate,
    v.quality_score,
    v.growth_momentum,
    v.revenue_potential,
    v.health,
  ]);
  let csv = headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");

  // Add platform data
  if (platforms?.entertainment?.movies?.length) {
    csv += "\n\nTMDB Trending Movies\nTitle,Rating,Popularity,Genres";
    platforms.entertainment.movies.forEach((m) => {
      csv += `\n"${m.title.replace(/"/g, '""')}",${m.vote_average},${m.popularity},"${m.genres?.join(", ")}"`;
    });
  }
  if (platforms?.news?.articles?.length) {
    csv += "\n\nNews Headlines\nTitle,Source,Sentiment";
    platforms.news.articles.forEach((a) => {
      csv += `\n"${a.title.replace(/"/g, '""')}","${a.source}",${a.sentiment_label}`;
    });
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `data-velocity-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { data, loading, error, refresh, platforms, platformsLoading } = useYouTubeData(300000);
  const [search, setSearch] = useState("");

  // Filter videos by search
  const filteredVideos = useMemo(() => {
    if (!data?.videos || !search) return data?.videos;
    const q = search.toLowerCase();
    return data.videos.filter(
      (v) => v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)
    );
  }, [data?.videos, search]);

  // Anomalies
  const anomalies = useMemo(() => detectAnomalies(data?.videos), [data?.videos]);

  const handleExport = useCallback(() => exportCSV(data, platforms), [data, platforms]);

  // Platform data source counts
  const platformCount = useMemo(() => {
    let count = 0;
    if (data?.data_source) count++;
    if (platforms?.social?.trends?.length) count++;
    if (platforms?.entertainment?.movies?.length) count++;
    if (platforms?.news?.articles?.length) count++;
    if (platforms?.music?.tracks?.length) count++;
    return count;
  }, [data, platforms]);

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-background">
      <Header
        dataSource={data?.data_source}
        lastUpdated={data?.last_updated}
        refreshInterval={data?.refresh_interval}
        onRefresh={refresh}
        loading={loading}
        onExport={handleExport}
        platformCount={platformCount}
      />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && !data ? (
          <ErrorState error={error} onRetry={refresh} />
        ) : loading && !data ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <KPICards kpis={data?.kpis} />

            {/* Anomaly Alerts */}
            {anomalies.length > 0 && (
              <div data-testid="anomaly-alerts" className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold">Anomaly Detection: {anomalies.length} outlier{anomalies.length > 1 ? "s" : ""} found</h3>
                </div>
                <div className="space-y-1.5">
                  {anomalies.slice(0, 3).map((a, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">"{a.title.slice(0, 50)}..."</span> — {a.anomalyScore.toFixed(1)}x above normal ({a.engagement_rate.toFixed(1)}% engagement)
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Search + Data Freshness */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-full sm:max-w-sm">
                <SearchFilter value={search} onChange={setSearch} placeholder="Search videos, channels, categories..." />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                <span className={`w-1.5 h-1.5 rounded-full ${data?.data_source === "live" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {platformCount} data source{platformCount !== 1 ? "s" : ""} active · Updated {data?.last_updated ? new Date(data.last_updated).toLocaleTimeString() : "—"} · Auto-refresh 5m
              </div>
            </div>

            {/* Tab Navigation */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList data-testid="tab-navigation" className="h-auto p-1 bg-muted/50 border border-border rounded-lg flex-wrap gap-0.5">
                <TabsTrigger value="overview" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="tab-overview">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Overview
                </TabsTrigger>
                <TabsTrigger value="engagement" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="tab-engagement">
                  <BarChart3 className="w-3.5 h-3.5" /> Engagement
                </TabsTrigger>
                <TabsTrigger value="category" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="tab-category">
                  <Layers className="w-3.5 h-3.5" /> Categories
                </TabsTrigger>
                <TabsTrigger value="growth" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="tab-growth">
                  <TrendingUp className="w-3.5 h-3.5" /> Growth
                </TabsTrigger>
                <TabsTrigger value="competitive" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="tab-competitive">
                  <Target className="w-3.5 h-3.5" /> Competitive
                </TabsTrigger>
                <TabsTrigger value="social" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="tab-social">
                  <MessageSquare className="w-3.5 h-3.5" /> Social
                </TabsTrigger>
                <TabsTrigger value="entertainment" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="tab-entertainment">
                  <Film className="w-3.5 h-3.5" /> Entertainment
                </TabsTrigger>
                <TabsTrigger value="news" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="tab-news">
                  <Newspaper className="w-3.5 h-3.5" /> News
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <OverviewTab videos={filteredVideos} insights={data?.insights} />
              </TabsContent>
              <TabsContent value="engagement" className="mt-4">
                <EngagementTab videos={filteredVideos} engagementDistribution={data?.engagement_distribution} insights={data?.insights} />
              </TabsContent>
              <TabsContent value="category" className="mt-4">
                <CategoryTab categories={data?.categories} demographics={data?.demographics} heatmap={data?.heatmap} insights={data?.insights} />
              </TabsContent>
              <TabsContent value="growth" className="mt-4">
                <GrowthTab growthData={data?.growth_data} insights={data?.insights} />
              </TabsContent>
              <TabsContent value="competitive" className="mt-4">
                <CompetitiveTab competitive={data?.competitive} insights={data?.insights} />
              </TabsContent>
              <TabsContent value="social" className="mt-4">
                <SocialTab data={platforms?.social} />
              </TabsContent>
              <TabsContent value="entertainment" className="mt-4">
                <EntertainmentTab entertainment={platforms?.entertainment} music={platforms?.music} />
              </TabsContent>
              <TabsContent value="news" className="mt-4">
                <NewsTab data={platforms?.news} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}

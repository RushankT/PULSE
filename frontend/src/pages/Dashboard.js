import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { KPICards } from "@/components/KPICards";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { EngagementTab } from "@/components/tabs/EngagementTab";
import { CategoryTab } from "@/components/tabs/CategoryTab";
import { GrowthTab } from "@/components/tabs/GrowthTab";
import { CompetitiveTab } from "@/components/tabs/CompetitiveTab";
import { useYouTubeData } from "@/hooks/useYouTubeData";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, LayoutDashboard, BarChart3, Layers, TrendingUp, Target } from "lucide-react";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
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
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-md bg-[hsl(234,85%,66%)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, refresh } = useYouTubeData(300000);

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-background">
      <Header
        dataSource={data?.data_source}
        lastUpdated={data?.last_updated}
        refreshInterval={data?.refresh_interval}
        onRefresh={refresh}
        loading={loading}
      />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && !data ? (
          <ErrorState error={error} onRetry={refresh} />
        ) : loading && !data ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-6">
            {/* KPI Cards - Always Visible */}
            <KPICards kpis={data?.kpis} />

            {/* Data freshness footer */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className={`w-1.5 h-1.5 rounded-full ${data?.data_source === "live" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              Real-time data from YouTube API · Last updated: {data?.last_updated ? new Date(data.last_updated).toLocaleTimeString() : "—"} · Refresh every {Math.round((data?.refresh_interval || 300) / 60)} minutes
            </div>

            {/* Tab Navigation */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList
                data-testid="tab-navigation"
                className="h-auto p-1 bg-muted/50 border border-border rounded-lg flex-wrap"
              >
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
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <OverviewTab videos={data?.videos} insights={data?.insights} />
              </TabsContent>

              <TabsContent value="engagement" className="mt-4">
                <EngagementTab
                  videos={data?.videos}
                  engagementDistribution={data?.engagement_distribution}
                  insights={data?.insights}
                />
              </TabsContent>

              <TabsContent value="category" className="mt-4">
                <CategoryTab
                  categories={data?.categories}
                  demographics={data?.demographics}
                  heatmap={data?.heatmap}
                  insights={data?.insights}
                />
              </TabsContent>

              <TabsContent value="growth" className="mt-4">
                <GrowthTab growthData={data?.growth_data} insights={data?.insights} />
              </TabsContent>

              <TabsContent value="competitive" className="mt-4">
                <CompetitiveTab competitive={data?.competitive} insights={data?.insights} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}

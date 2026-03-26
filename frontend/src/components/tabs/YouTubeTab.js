import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KPICards } from "@/components/KPICards";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { EngagementTab } from "@/components/tabs/EngagementTab";
import { CategoryTab } from "@/components/tabs/CategoryTab";
import { GrowthTab } from "@/components/tabs/GrowthTab";
import { CompetitiveTab } from "@/components/tabs/CompetitiveTab";
import { LayoutDashboard, BarChart3, Layers, TrendingUp, Target, AlertTriangle } from "lucide-react";

function detectAnomalies(videos) {
  if (!videos?.length) return [];
  const rates = videos.map((video) => video.engagement_rate);
  const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
  const std = Math.sqrt(rates.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / rates.length);
  return videos
    .map((video) => ({
      ...video,
      anomalyScore: (video.engagement_rate - avg) / (std || 1),
      isAnomaly: video.engagement_rate > avg + 1.5 * std,
    }))
    .filter((video) => video.isAnomaly)
    .sort((a, b) => b.anomalyScore - a.anomalyScore);
}

export function YouTubeTab({ data }) {
  const [activeTab, setActiveTab] = useState("yt-overview");

  if (!data) return <p className="text-muted-foreground p-4">Loading YouTube data...</p>;

  const anomalies = detectAnomalies(data.videos);

  return (
    <div data-testid="youtube-tab" className="space-y-6">
      <KPICards kpis={data.kpis} />

      {anomalies.length > 0 && (
        <div data-testid="anomaly-alerts" className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Anomaly Detection: {anomalies.length} outlier{anomalies.length > 1 ? "s" : ""} found</h3>
          </div>
          <div className="space-y-1.5">
            {anomalies.slice(0, 3).map((anomaly, index) => (
              <p key={index} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">"{anomaly.title.slice(0, 50)}..."</span> — {anomaly.anomalyScore.toFixed(1)}x above normal ({anomaly.engagement_rate.toFixed(1)}% engagement)
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Inner sub-tabs for YouTube analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto p-1 bg-muted/30 border border-border rounded-lg flex-wrap gap-0.5">
          <TabsTrigger value="yt-overview" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="yt-sub-overview">
            <LayoutDashboard className="w-3 h-3" /> Overview
          </TabsTrigger>
          <TabsTrigger value="yt-engagement" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="yt-sub-engagement">
            <BarChart3 className="w-3 h-3" /> Engagement
          </TabsTrigger>
          <TabsTrigger value="yt-categories" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="yt-sub-categories">
            <Layers className="w-3 h-3" /> Categories
          </TabsTrigger>
          <TabsTrigger value="yt-growth" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="yt-sub-growth">
            <TrendingUp className="w-3 h-3" /> Growth
          </TabsTrigger>
          <TabsTrigger value="yt-competitive" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm" data-testid="yt-sub-competitive">
            <Target className="w-3 h-3" /> Competitive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yt-overview" className="mt-4">
          {activeTab === "yt-overview" && <OverviewTab videos={data.videos} insights={data.insights} />}
        </TabsContent>
        <TabsContent value="yt-engagement" className="mt-4">
          {activeTab === "yt-engagement" && <EngagementTab videos={data.videos} engagementDistribution={data.engagement_distribution} insights={data.insights} />}
        </TabsContent>
        <TabsContent value="yt-categories" className="mt-4">
          {activeTab === "yt-categories" && <CategoryTab categories={data.categories} demographics={data.demographics} heatmap={data.heatmap} insights={data.insights} />}
        </TabsContent>
        <TabsContent value="yt-growth" className="mt-4">
          {activeTab === "yt-growth" && <GrowthTab growthData={data.growth_data} insights={data.insights} />}
        </TabsContent>
        <TabsContent value="yt-competitive" className="mt-4">
          {activeTab === "yt-competitive" && <CompetitiveTab competitive={data.competitive} insights={data.insights} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

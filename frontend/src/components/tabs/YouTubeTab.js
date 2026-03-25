import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { EngagementTab } from "@/components/tabs/EngagementTab";
import { CategoryTab } from "@/components/tabs/CategoryTab";
import { GrowthTab } from "@/components/tabs/GrowthTab";
import { CompetitiveTab } from "@/components/tabs/CompetitiveTab";
import { LayoutDashboard, BarChart3, Layers, TrendingUp, Target } from "lucide-react";

export function YouTubeTab({ data }) {
  if (!data) return <p className="text-muted-foreground p-4">Loading YouTube data...</p>;

  return (
    <div data-testid="youtube-tab" className="space-y-6">
      {/* Inner sub-tabs for YouTube analytics */}
      <Tabs defaultValue="yt-overview">
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
          <OverviewTab videos={data.videos} insights={data.insights} />
        </TabsContent>
        <TabsContent value="yt-engagement" className="mt-4">
          <EngagementTab videos={data.videos} engagementDistribution={data.engagement_distribution} insights={data.insights} />
        </TabsContent>
        <TabsContent value="yt-categories" className="mt-4">
          <CategoryTab categories={data.categories} demographics={data.demographics} heatmap={data.heatmap} insights={data.insights} />
        </TabsContent>
        <TabsContent value="yt-growth" className="mt-4">
          <GrowthTab growthData={data.growth_data} insights={data.insights} />
        </TabsContent>
        <TabsContent value="yt-competitive" className="mt-4">
          <CompetitiveTab competitive={data.competitive} insights={data.insights} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightPanel } from "@/components/InsightCallout";
import { Eye, ThumbsUp, MessageSquare, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const HEALTH_COLORS = {
  excellent: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
  good: { bg: "bg-[hsl(234,85%,66%)]/10", text: "text-[hsl(234,85%,66%)]", border: "border-[hsl(234,85%,66%)]/30" },
  moderate: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  low: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30" },
};

function formatNum(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

function MiniSparkline({ data }) {
  const max = Math.max(...data);
  return (
    <div className="sparkline-container">
      {data.map((v, i) => (
        <div
          key={i}
          className="sparkline-bar bg-[hsl(234,85%,66%)]/50"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{d.title}</p>
      <p className="text-muted-foreground">{d.channel}</p>
      <div className="mt-2 space-y-1">
        <p>Views: {formatNum(d.views)}</p>
        <p>Engagement: {d.engagement_rate?.toFixed(2)}%</p>
        <p>Quality: {d.quality_score}/10</p>
      </div>
    </div>
  );
}

export function OverviewTab({ videos, insights }) {
  if (!videos?.length) return <p className="text-muted-foreground p-4">No data available.</p>;

  const top10 = [...videos].sort((a, b) => b.engagement_rate - a.engagement_rate).slice(0, 10);

  const chartData = top10.map((v) => ({
    ...v,
    name: v.title.slice(0, 20) + "...",
  }));

  return (
    <div data-testid="overview-tab" className="space-y-6">
      {/* Insight callouts */}
      <InsightPanel insights={insights?.overview} title="Key Insights" />

      {/* Top engagement chart */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight">Top 10 by Engagement Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))", strokeOpacity: 0.3 }} tickLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="engagement_rate" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.health === "excellent" ? "#10b981" : entry.health === "good" ? "#667eea" : entry.health === "moderate" ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Video Cards Grid */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Top Performers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {top10.slice(0, 9).map((video, idx) => {
            const hc = HEALTH_COLORS[video.health] || HEALTH_COLORS.moderate;
            const sparkData = Array.from({ length: 12 }, () => Math.random() * 100);

            return (
              <Card
                key={video.id}
                data-testid={`video-card-${idx}`}
                className={`animate-fade-in-up border-border hover:-translate-y-[2px] transition-transform duration-200`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-24 h-16 rounded-md object-cover shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight line-clamp-2">{video.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] ${hc.text} ${hc.border}`}>
                      {video.health}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {formatNum(video.views)}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> {formatNum(video.likes)}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {formatNum(video.comments)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Engagement</p>
                      <p className="text-sm font-semibold">{video.engagement_rate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Quality</p>
                      <p className="text-sm font-semibold">{video.quality_score}/10</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Revenue</p>
                      <p className="text-sm font-semibold">${formatNum(video.revenue_potential)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs">
                      {video.growth_momentum > 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={video.growth_momentum > 0 ? "text-emerald-500" : "text-red-500"}>
                        {video.growth_momentum > 0 ? "+" : ""}{video.growth_momentum.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {video.hours_since_publish.toFixed(0)}h ago
                    </div>
                    <MiniSparkline data={sparkData} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

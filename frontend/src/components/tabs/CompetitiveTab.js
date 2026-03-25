import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightPanel } from "@/components/InsightCallout";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  Tooltip, CartesianGrid, Cell, Legend
} from "recharts";

const QUADRANT_COLORS = {
  blue_ocean: "#667eea",
  star: "#10b981",
  red_ocean: "#ef4444",
  niche: "#f59e0b",
};

const QUADRANT_LABELS = {
  blue_ocean: "Blue Ocean",
  star: "Star",
  red_ocean: "Red Ocean",
  niche: "Niche",
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold mb-1">{d.category || d.name}</p>
      {d.competition !== undefined && <p>Competition: {d.competition} videos</p>}
      {d.growth !== undefined && <p>Growth: {d.growth}%</p>}
      {d.engagement !== undefined && <p>Engagement: {d.engagement}%</p>}
      {d.value !== undefined && <p>Score: {d.value}</p>}
    </div>
  );
}

export function CompetitiveTab({ competitive, insights }) {
  if (!competitive) return <p className="text-muted-foreground p-4">No data available.</p>;

  const { radar = {}, benchmarks = {}, matrix = [] } = competitive;

  // Radar data
  const radarKeys = Object.keys(radar.platform || {});
  const radarData = radarKeys.map((key) => ({
    name: key,
    "This Platform": radar.platform?.[key] || 0,
    "Generic Tools": radar.generic?.[key] || 0,
  }));

  // Matrix scatter data
  const matrixData = matrix.map((m) => ({
    ...m,
    x: m.competition,
    y: m.growth,
    z: m.views / 1000000,
  }));

  return (
    <div data-testid="competitive-tab" className="space-y-6">
      <InsightPanel insights={insights?.competitive} title="Strategic Insights" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Platform Positioning</CardTitle>
            <p className="text-xs text-muted-foreground">Capability comparison vs generic analytics tools</p>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name="This Platform" dataKey="This Platform" stroke="#667eea" fill="#667eea" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Generic Tools" dataKey="Generic Tools" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeWidth={1} strokeDasharray="4 4" />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Benchmarks */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Industry Benchmarks</CardTitle>
            <p className="text-xs text-muted-foreground">How your content performs vs market standards</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* Engagement benchmark */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Average Engagement Rate</span>
                  <span className="font-semibold">{benchmarks.avg_engagement_rate}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden relative">
                  <div className="h-full rounded-full bg-muted-foreground/30" style={{ width: "100%" }} />
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-[hsl(234,85%,66%)]"
                    style={{ width: `${Math.min(100, (benchmarks.your_median / 5) * 100)}%` }}
                  />
                  <div
                    className="absolute top-0 h-full w-0.5 bg-red-500"
                    style={{ left: `${(benchmarks.avg_engagement_rate / 5) * 100}%` }}
                    title="Industry Average"
                  />
                </div>
                <div className="flex justify-between text-[10px] mt-1 text-muted-foreground">
                  <span>0%</span>
                  <span>Industry avg: {benchmarks.avg_engagement_rate}%</span>
                  <span>5%</span>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Your Median</p>
                  <p className="text-xl font-bold mt-1">{benchmarks.your_median}%</p>
                  <p className="text-xs mt-1">
                    {benchmarks.your_median > benchmarks.avg_engagement_rate ? (
                      <span className="text-emerald-500">
                        +{((benchmarks.your_median - benchmarks.avg_engagement_rate) / benchmarks.avg_engagement_rate * 100).toFixed(0)}% above avg
                      </span>
                    ) : (
                      <span className="text-red-500">Below average</span>
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Top Quartile</p>
                  <p className="text-xl font-bold mt-1">{benchmarks.top_quartile}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Threshold for top 25%</p>
                </div>
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Market Position</p>
                  <p className="text-xl font-bold mt-1">{benchmarks.outperform_pct}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Content above benchmark</p>
                </div>
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Data Advantage</p>
                  <p className="text-xl font-bold mt-1 text-[hsl(234,85%,66%)]">Real-Time</p>
                  <p className="text-xs text-muted-foreground mt-1">vs competitors' daily</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2x2 Matrix */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight">Opportunity vs Competition Matrix</CardTitle>
          <p className="text-xs text-muted-foreground">
            X: Competition (video count) · Y: Growth momentum · Size: Total views · Color: Quadrant
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis type="number" dataKey="x" name="Competition" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} label={{ value: "Competition (videos)", position: "bottom", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }} />
                <YAxis type="number" dataKey="y" name="Growth %" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} label={{ value: "Growth %", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }} />
                <ZAxis type="number" dataKey="z" range={[100, 600]} />
                <Tooltip content={<ChartTooltip />} />
                <Scatter data={matrixData}>
                  {matrixData.map((entry, i) => (
                    <Cell key={i} fill={QUADRANT_COLORS[entry.quadrant]} fillOpacity={0.7} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3 justify-center">
            {Object.entries(QUADRANT_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: QUADRANT_COLORS[key] }} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
          {/* Category detail */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {matrix.map((m) => (
              <div key={m.category} className="p-2 rounded-md border border-border text-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: QUADRANT_COLORS[m.quadrant] }} />
                  <span className="font-medium truncate">{m.category}</span>
                </div>
                <div className="text-muted-foreground">
                  {m.competition} videos · {m.growth > 0 ? "+" : ""}{m.growth}% growth
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

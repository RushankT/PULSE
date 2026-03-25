import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightPanel } from "@/components/InsightCallout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, CartesianGrid,
  LineChart, Line, Cell, Legend
} from "recharts";

function formatNum(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n?.toLocaleString?.() || "0";
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-xs">
      {label && <p className="font-semibold mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
}

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-xs max-w-[220px]">
      <p className="font-semibold mb-1 truncate">{d.title}</p>
      <p className="text-muted-foreground">{d.channel}</p>
      <div className="mt-1.5 space-y-0.5">
        <p>Views: {formatNum(d.views)}</p>
        <p>Engagement: {d.engagement_rate?.toFixed(2)}%</p>
        <p>Quality: {d.quality_score}/10</p>
      </div>
    </div>
  );
}

export function EngagementTab({ videos, engagementDistribution, insights }) {
  if (!videos?.length) return <p className="text-muted-foreground p-4">No data available.</p>;

  const scatterData = videos.map((v) => ({
    ...v,
    x: v.views,
    y: v.engagement_rate,
    z: v.quality_score * 40,
  }));

  // Velocity data: sort by velocity, take top 15
  const velocityData = [...videos]
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 15)
    .map((v) => ({
      name: v.title.slice(0, 18) + "...",
      velocity: Math.round(v.velocity),
      hours: v.hours_since_publish,
      title: v.title,
    }));

  // Box plot simulated data: group by category, show engagement distribution
  const categories = {};
  videos.forEach((v) => {
    if (!categories[v.category]) categories[v.category] = [];
    categories[v.category].push(v.engagement_rate);
  });

  const boxData = Object.entries(categories)
    .filter(([, vals]) => vals.length >= 2)
    .map(([cat, vals]) => {
      const sorted = vals.sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const median = sorted[Math.floor(sorted.length * 0.5)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      return { category: cat.slice(0, 12), q1, median, q3, min, max, count: sorted.length };
    })
    .sort((a, b) => b.median - a.median);

  return (
    <div data-testid="engagement-tab" className="space-y-6">
      <InsightPanel insights={insights?.engagement} title="Engagement Insights" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Histogram */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Engagement Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">How engagement rates cluster across trending content</p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementDistribution} margin={{ bottom: 5 }}>
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Videos">
                    {engagementDistribution?.map((entry, i) => (
                      <Cell key={i} fill={entry.min >= 3 ? "#10b981" : entry.min >= 2 ? "#667eea" : entry.min >= 1 ? "#f59e0b" : "#ef4444"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scatter: Views vs Engagement */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Quality vs Quantity</CardTitle>
            <p className="text-xs text-muted-foreground">Views (scale) vs Engagement Rate (quality)</p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis type="number" dataKey="x" name="Views" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
                  <YAxis type="number" dataKey="y" name="Engagement %" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <ZAxis type="number" dataKey="z" range={[40, 400]} />
                  <Tooltip content={<ScatterTooltip />} />
                  <Scatter data={scatterData} fill="#667eea" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Velocity Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Trend Velocity</CardTitle>
            <p className="text-xs text-muted-foreground">Views per hour - how fast content reaches peak popularity</p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityData} layout="vertical" margin={{ left: 5, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="velocity" fill="#667eea" radius={[0, 4, 4, 0]} fillOpacity={0.8} name="Views/Hour" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Box Plot (Simulated as grouped bar) */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Engagement by Category</CardTitle>
            <p className="text-xs text-muted-foreground">Min / Q1 / Median / Q3 / Max engagement rates</p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={boxData} margin={{ bottom: 5 }}>
                  <XAxis dataKey="category" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="min" fill="#ef4444" fillOpacity={0.4} name="Min" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="median" fill="#667eea" fillOpacity={0.8} name="Median" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="max" fill="#10b981" fillOpacity={0.4} name="Max" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

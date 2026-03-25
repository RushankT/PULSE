import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightPanel } from "@/components/InsightCallout";
import { TrendingUp, TrendingDown, Zap, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, Cell
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
          {p.name}: {typeof p.value === "number" ? (p.value > 1000 ? formatNum(p.value) : p.value.toFixed(1)) : p.value}
        </p>
      ))}
    </div>
  );
}

export function GrowthTab({ growthData, insights }) {
  if (!growthData) return <p className="text-muted-foreground p-4">No data available.</p>;

  const { ranking = [], emerging = [], projections = [] } = growthData;

  const growthChart = ranking.slice(0, 12).map((v) => ({
    name: v.title.slice(0, 18) + "...",
    growth: v.growth,
    title: v.title,
  }));

  const projectionChart = projections.map((p) => ({
    name: p.title.slice(0, 18) + "...",
    current: p.current,
    "24h Projected": p.projected_24h,
    "48h Projected": p.projected_48h,
    title: p.title,
  }));

  return (
    <div data-testid="growth-tab" className="space-y-6">
      <InsightPanel insights={insights?.growth} title="Growth & Opportunity Insights" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Growth Ranking */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Growth Rate Ranking</CardTitle>
            <p className="text-xs text-muted-foreground">Last 24h growth momentum for top content</p>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthChart} layout="vertical" margin={{ left: 5, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="growth" radius={[0, 4, 4, 0]} name="Growth %">
                    {growthChart.map((entry, i) => (
                      <Cell key={i} fill={entry.growth > 15 ? "#10b981" : entry.growth > 0 ? "#667eea" : "#ef4444"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trend Projection */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Trend Prediction</CardTitle>
            <p className="text-xs text-muted-foreground">Projected views in 24h and 48h based on current velocity</p>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectionChart} margin={{ bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={45} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="current" fill="#667eea" fillOpacity={0.9} radius={[4, 4, 0, 0]} name="Current" />
                  <Bar dataKey="24h Projected" fill="#10b981" fillOpacity={0.6} radius={[4, 4, 0, 0]} name="24h Projected" />
                  <Bar dataKey="48h Projected" fill="#f59e0b" fillOpacity={0.4} radius={[4, 4, 0, 0]} name="48h Projected" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emerging Content */}
      {emerging.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Emerging Content Matrix
            </CardTitle>
            <p className="text-xs text-muted-foreground">Recently trending content (less than 12 hours old)</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emerging.map((item, idx) => (
                <div
                  key={idx}
                  data-testid={`emerging-item-${idx}`}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-amber-500">#{idx + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.channel} · {item.category}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Views</p>
                      <p className="text-sm font-semibold">{formatNum(item.views)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Velocity</p>
                      <p className="text-sm font-semibold">{formatNum(item.velocity)}/h</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Engagement</p>
                      <p className="text-sm font-semibold">{item.engagement_rate.toFixed(1)}%</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.hours_ago.toFixed(0)}h
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunity Scores Table */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight">Opportunity Scores</CardTitle>
          <p className="text-xs text-muted-foreground">Growth Rate x Audience Size x Engagement Quality</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table data-testid="opportunity-table" className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground p-2 font-semibold">Content</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground p-2 font-semibold">Views</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground p-2 font-semibold">Engagement</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground p-2 font-semibold">Growth</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground p-2 font-semibold">Opportunity</th>
                  <th className="text-center text-[10px] uppercase tracking-wider text-muted-foreground p-2 font-semibold">Health</th>
                </tr>
              </thead>
              <tbody>
                {ranking.slice(0, 10).map((r, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="p-2">
                      <p className="text-sm font-medium truncate max-w-[200px]">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground">{r.channel}</p>
                    </td>
                    <td className="p-2 text-right text-sm font-medium">{formatNum(r.views)}</td>
                    <td className="p-2 text-right text-sm font-medium">{r.engagement_rate.toFixed(1)}%</td>
                    <td className="p-2 text-right">
                      <span className={`text-sm font-medium flex items-center justify-end gap-1 ${r.growth > 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {r.growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {r.growth > 0 ? "+" : ""}{r.growth.toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-2 text-right text-sm font-bold text-[hsl(234,85%,66%)]">{r.opportunity_index.toFixed(1)}</td>
                    <td className="p-2 text-center">
                      <Badge variant="outline" className={`text-[10px] ${
                        r.health === "excellent" ? "border-emerald-500/30 text-emerald-500" :
                        r.health === "good" ? "border-[hsl(234,85%,66%)]/30 text-[hsl(234,85%,66%)]" :
                        r.health === "moderate" ? "border-amber-500/30 text-amber-500" :
                        "border-red-500/30 text-red-500"
                      }`}>{r.health}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

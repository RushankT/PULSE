import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightPanel } from "@/components/InsightCallout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { MessageSquare, TrendingUp, Clock } from "lucide-react";

const SENTIMENT_COLORS = { positive: "#10b981", neutral: "#667eea", negative: "#ef4444" };

function formatNum(n) {
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
        <p key={i} style={{ color: p.color || p.fill }}>{p.name}: {typeof p.value === "number" ? formatNum(p.value) : p.value}</p>
      ))}
    </div>
  );
}

export function SocialTab({ data }) {
  if (!data) return <p className="text-muted-foreground p-4">Loading social trends...</p>;

  const { trends = [], insights = [], data_source, note } = data;

  // Volume chart
  const volumeChart = trends.slice(0, 10).map((t) => ({
    name: t.name.slice(0, 15),
    volume: t.tweet_volume,
    velocity: t.velocity,
    fullName: t.name,
  }));

  // Sentiment pie
  const sentimentAgg = trends.reduce(
    (acc, t) => {
      acc.positive += t.sentiment?.positive || 0;
      acc.neutral += t.sentiment?.neutral || 0;
      acc.negative += t.sentiment?.negative || 0;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );
  const total = sentimentAgg.positive + sentimentAgg.neutral + sentimentAgg.negative;
  const sentimentPie = [
    { name: "Positive", value: Math.round(sentimentAgg.positive / total * 100) },
    { name: "Neutral", value: Math.round(sentimentAgg.neutral / total * 100) },
    { name: "Negative", value: Math.round(sentimentAgg.negative / total * 100) },
  ];

  // Category breakdown
  const catCounts = {};
  trends.forEach((t) => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
  const catChart = Object.entries(catCounts).map(([k, v]) => ({ name: k, count: v })).sort((a, b) => b.count - a.count);

  return (
    <div data-testid="social-tab" className="space-y-6">
      {note && (
        <div className="bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-l-amber-500 p-3 rounded-r-md text-xs text-muted-foreground">
          {note}
        </div>
      )}

      <InsightPanel insights={insights} title="Social Insights" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tweet Volume */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Tweet Volume by Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChart} layout="vertical" margin={{ left: 5, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="volume" fill="#667eea" fillOpacity={0.8} radius={[0, 4, 4, 0]} name="Tweets" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Overall Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                    <Cell fill={SENTIMENT_COLORS.positive} />
                    <Cell fill={SENTIMENT_COLORS.neutral} />
                    <Cell fill={SENTIMENT_COLORS.negative} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {Object.entries(SENTIMENT_COLORS).map(([k, c]) => (
                <div key={k} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                  <span className="text-muted-foreground capitalize">{k}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Topics List */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight">Trending Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trends.slice(0, 12).map((t, i) => (
              <div key={i} data-testid={`social-trend-${i}`} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <span className="text-lg font-bold text-muted-foreground w-8 text-center">#{t.rank}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.category}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-xs">
                  <div className="text-right">
                    <p className="text-muted-foreground">Volume</p>
                    <p className="font-semibold flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {formatNum(t.tweet_volume)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Velocity</p>
                    <p className={`font-semibold flex items-center gap-1 ${t.velocity > 0 ? "text-emerald-500" : "text-red-500"}`}>
                      <TrendingUp className="w-3 h-3" /> {t.velocity > 0 ? "+" : ""}{t.velocity}%
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${t.sentiment_label === "positive" ? "border-emerald-500/30 text-emerald-500" : t.sentiment_label === "negative" ? "border-red-500/30 text-red-500" : "border-[hsl(234,85%,66%)]/30 text-[hsl(234,85%,66%)]"}`}>
                    {t.sentiment_label}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" /> {t.hours_trending.toFixed(0)}h
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightPanel } from "@/components/InsightCallout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from "recharts";
import { Newspaper, ExternalLink, ThumbsUp, ThumbsDown, Minus } from "lucide-react";

const SENTIMENT_ICONS = {
  positive: ThumbsUp,
  negative: ThumbsDown,
  neutral: Minus,
};
const SENTIMENT_COLORS_MAP = {
  positive: "text-emerald-500 border-emerald-500/30",
  negative: "text-red-500 border-red-500/30",
  neutral: "text-[hsl(234,85%,66%)] border-[hsl(234,85%,66%)]/30",
};
const PIE_COLORS = ["#10b981", "#667eea", "#ef4444"];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-xs">
      {label && <p className="font-semibold mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export function NewsTab({ data }) {
  if (!data) return <p className="text-muted-foreground p-4">Loading news trends...</p>;

  const { articles = [], source_breakdown = [], sentiment_summary = {}, insights = [] } = data;

  const sentimentPie = [
    { name: "Positive", value: sentiment_summary.positive_count || 0 },
    { name: "Neutral", value: sentiment_summary.neutral_count || 0 },
    { name: "Negative", value: sentiment_summary.negative_count || 0 },
  ];

  const sourceChart = source_breakdown.slice(0, 8).map((s) => ({
    name: s.source.length > 15 ? s.source.slice(0, 15) + "..." : s.source,
    count: s.count,
    fullName: s.source,
  }));

  return (
    <div data-testid="news-tab" className="space-y-6">
      <InsightPanel insights={insights} title="News Intelligence" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Breakdown */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Source Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Article count by news source</p>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceChart} layout="vertical" margin={{ left: 5, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="#667eea" fillOpacity={0.8} radius={[0, 4, 4, 0]} name="Articles" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Breakdown */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">News Sentiment</CardTitle>
            <p className="text-xs text-muted-foreground">
              Average sentiment: {sentiment_summary.average > 0 ? "+" : ""}{sentiment_summary.average?.toFixed(2) || "0"} ({sentiment_summary.total || 0} articles)
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentPie} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {sentimentPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {["Positive", "Neutral", "Negative"].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles List */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <Newspaper className="w-4 h-4" /> Breaking Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {articles.slice(0, 15).map((article, i) => {
              const SentIcon = SENTIMENT_ICONS[article.sentiment_label] || Minus;
              const sentClass = SENTIMENT_COLORS_MAP[article.sentiment_label] || "";

              return (
                <div key={i} data-testid={`news-article-${i}`} className="flex gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  {article.image && (
                    <img src={article.image} alt="" className="w-20 h-14 rounded object-cover shrink-0" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight line-clamp-2">{article.title}</p>
                      {article.url && (
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {article.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <Badge variant="secondary" className="text-[10px]">{article.source}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${sentClass}`}>
                        <SentIcon className="w-3 h-3 mr-1" /> {article.sentiment_label}
                      </Badge>
                      <span className="text-muted-foreground">
                        {article.published_at ? new Date(article.published_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

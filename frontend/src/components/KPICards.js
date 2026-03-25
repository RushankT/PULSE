import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Zap, Target, BarChart3 } from "lucide-react";

const KPI_CONFIG = {
  total_activity: { icon: Activity, color: "text-[hsl(234,85%,66%)]", bgColor: "bg-[hsl(234,85%,66%)]/10" },
  engagement_quality: { icon: Target, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  growth_velocity: { icon: Zap, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  opportunity_index: { icon: BarChart3, color: "text-[hsl(234,85%,66%)]", bgColor: "bg-[hsl(234,85%,66%)]/10" },
};

function formatValue(value, format) {
  if (format === "number") {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString();
  }
  if (format === "percent") return `${value}%`;
  if (format === "score") return `${value}/10`;
  return value;
}

function Sparkline({ positive }) {
  const bars = Array.from({ length: 12 }, (_, i) => {
    const base = positive ? 40 + i * 3 : 80 - i * 2;
    return Math.max(10, base + (Math.random() - 0.5) * 20);
  });
  return (
    <div className="sparkline-container">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`sparkline-bar ${positive ? "bg-emerald-500/60" : "bg-red-500/60"}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function KPICards({ kpis }) {
  if (!kpis) return null;

  const keys = ["total_activity", "engagement_quality", "growth_velocity", "opportunity_index"];

  return (
    <div
      data-testid="kpi-cards-grid"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {keys.map((key, idx) => {
        const kpi = kpis[key];
        if (!kpi) return null;

        const config = KPI_CONFIG[key];
        const Icon = config.icon;
        const isPositive = kpi.trend > 0;

        return (
          <Card
            key={key}
            data-testid={`kpi-card-${key}`}
            className="animate-fade-in-up border-border hover:-translate-y-[2px] transition-transform duration-200"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {formatValue(kpi.value, kpi.format)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                      {isPositive ? "+" : ""}{kpi.trend}%
                    </span>
                    <span className="text-[11px] text-muted-foreground">{kpi.trend_label}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`w-9 h-9 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${config.color}`} strokeWidth={2} />
                  </div>
                  <Sparkline positive={isPositive} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

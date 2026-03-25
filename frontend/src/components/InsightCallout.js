import { AlertCircle, TrendingUp, Lightbulb, ShieldAlert, Target, Zap } from "lucide-react";

const ICONS = {
  highlight: TrendingUp,
  trend: TrendingUp,
  quality: Target,
  outlier: AlertCircle,
  insight: Lightbulb,
  dark_horse: Zap,
  segment: Target,
  momentum: TrendingUp,
  opportunity: Lightbulb,
  risk: ShieldAlert,
  benchmark: Target,
  revenue: TrendingUp,
};

const SEVERITY_STYLES = {
  success: "border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10",
  warning: "border-l-amber-500 bg-amber-500/5 dark:bg-amber-500/10",
  danger: "border-l-red-500 bg-red-500/5 dark:bg-red-500/10",
  info: "border-l-[hsl(234,85%,66%)] bg-[hsl(234,85%,66%)]/5 dark:bg-[hsl(234,85%,66%)]/10",
};

const ICON_COLORS = {
  success: "text-emerald-500",
  warning: "text-amber-500",
  danger: "text-red-500",
  info: "text-[hsl(234,85%,66%)]",
};

export function InsightCallout({ insight }) {
  const Icon = ICONS[insight.type] || Lightbulb;
  const severity = insight.severity || "info";

  return (
    <div
      data-testid={`insight-callout-${insight.type}`}
      className={`border-l-4 p-4 rounded-r-md flex gap-3 items-start ${SEVERITY_STYLES[severity]}`}
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${ICON_COLORS[severity]}`} strokeWidth={2} />
      <p className="text-sm leading-relaxed text-foreground/90">{insight.text}</p>
    </div>
  );
}

export function InsightPanel({ insights, title }) {
  if (!insights || insights.length === 0) return null;
  return (
    <div data-testid="insight-panel" className="space-y-3">
      {title && (
        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </h4>
      )}
      {insights.map((ins, i) => (
        <InsightCallout key={i} insight={ins} />
      ))}
    </div>
  );
}

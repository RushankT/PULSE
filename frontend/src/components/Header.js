import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, RefreshCw, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Header({ dataSource, lastUpdated, refreshInterval, onRefresh, loading }) {
  const { theme, toggleTheme } = useTheme();

  const formatTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <header
      data-testid="dashboard-header"
      className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[hsl(234,85%,66%)] flex items-center justify-center">
            <Radio className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none">
              Data Velocity
            </h1>
            <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
              Real-Time Insights Platform
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Data source badge */}
          <Badge
            data-testid="data-source-badge"
            variant="outline"
            className={`text-[10px] uppercase tracking-wider font-semibold ${
              dataSource === "live"
                ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                : "border-amber-500/50 text-amber-600 dark:text-amber-400"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              dataSource === "live" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`} />
            {dataSource === "live" ? "Live Data" : "Simulated"}
          </Badge>

          {/* Last updated */}
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Updated {formatTime(lastUpdated)} · {Math.round((refreshInterval || 300) / 60)}m refresh
          </span>

          {/* Refresh */}
          <button
            data-testid="refresh-button"
            onClick={onRefresh}
            disabled={loading}
            className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50"
            title="Force refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={2} />
          </button>

          {/* Theme toggle */}
          <button
            data-testid="theme-toggle"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5" strokeWidth={2} />
            ) : (
              <Moon className="w-3.5 h-3.5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

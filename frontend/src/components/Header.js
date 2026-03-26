import { useTheme } from "@/context/ThemeContext";
import { Link } from "react-router-dom";
import { Moon, Sun, RefreshCw, Radio, Download, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRY_OPTIONS, getCountryLabel } from "@/lib/utils";

export function Header({ dataSource, lastUpdated, refreshInterval, onRefresh, loading, onExport, platformCount, country, onCountryChange }) {
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
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-[hsl(234,85%,66%)] flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none">
                PULSE
              </h1>
              <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                Real-Time Insights Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">Region</span>
            <Select value={country} onValueChange={onCountryChange}>
              <SelectTrigger className="h-8 w-[170px] text-xs">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            {dataSource === "live" ? "YouTube: Live" : "YouTube: Simulated"}
          </Badge>

          {/* Platform count */}
          {platformCount > 1 && (
            <Badge variant="outline" className="text-[10px] border-[hsl(234,85%,66%)]/50 text-[hsl(234,85%,66%)] hidden sm:inline-flex">
              {platformCount} sources
            </Badge>
          )}

          {/* Last updated */}
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            {getCountryLabel(country)} · Updated {formatTime(lastUpdated)} · {Math.round((refreshInterval || 300) / 60)}m refresh
          </span>

          {/* Export */}
          <button
            data-testid="export-button"
            onClick={onExport}
            className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
          </button>

          {/* Home link */}
          <Link
            to="/"
            data-testid="home-link"
            className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
            title="Back to home"
          >
            <Home className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>

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

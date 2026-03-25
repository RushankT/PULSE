import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightPanel } from "@/components/InsightCallout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ComposedChart, Line
} from "recharts";

const PIE_COLORS = ["#667eea", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

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
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === "number" ? (p.value > 1000 ? formatNum(p.value) : p.value.toFixed(2)) : p.value}
        </p>
      ))}
    </div>
  );
}

function HeatmapCell({ value, maxVal }) {
  const intensity = Math.min(1, value / maxVal);
  const bg = `rgba(102, 126, 234, ${0.1 + intensity * 0.7})`;
  return (
    <td className="p-2 text-center text-xs font-medium rounded" style={{ backgroundColor: bg }}>
      {value.toFixed(1)}%
    </td>
  );
}

export function CategoryTab({ categories, demographics, heatmap, insights }) {
  if (!categories?.length) return <p className="text-muted-foreground p-4">No data available.</p>;

  const topCats = categories.slice(0, 8);

  // Find max heatmap value
  let maxHeat = 0;
  heatmap?.forEach((row) => {
    Object.values(row.values).forEach((v) => {
      if (v > maxHeat) maxHeat = v;
    });
  });

  return (
    <div data-testid="category-tab" className="space-y-6">
      <InsightPanel insights={insights?.category} title="Category Insights" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category views + engagement */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Performance by Category</CardTitle>
            <p className="text-xs text-muted-foreground">Total views (bars) + avg engagement rate (line)</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={topCats} margin={{ bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar yAxisId="left" dataKey="views" fill="#667eea" fillOpacity={0.7} radius={[4, 4, 0, 0]} name="Total Views" />
                  <Line yAxisId="right" type="monotone" dataKey="avg_engagement" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} name="Avg Engagement %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Demographics pie */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Audience Composition</CardTitle>
            <p className="text-xs text-muted-foreground">Estimated demographic breakdown</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographics}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="percentage"
                    nameKey="age_group"
                    label={({ age_group, percentage }) => `${age_group}: ${percentage}%`}
                  >
                    {demographics?.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Demo details */}
            <div className="mt-2 space-y-1.5">
              {demographics?.map((d, i) => (
                <div key={d.age_group} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-muted-foreground">{d.label} ({d.age_group})</span>
                  </div>
                  <span className="font-medium">{d.engagement_multiplier}x engagement</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      {heatmap?.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Segment Engagement Heatmap</CardTitle>
            <p className="text-xs text-muted-foreground">Category vs Demographic engagement intensity</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table data-testid="heatmap-table" className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground p-2 font-semibold">Category</th>
                    {["18-24", "25-34", "35-44", "45-54", "55+"].map((d) => (
                      <th key={d} className="text-center text-[10px] uppercase tracking-wider text-muted-foreground p-2 font-semibold">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.map((row) => (
                    <tr key={row.category}>
                      <td className="p-2 text-xs font-medium">{row.category}</td>
                      {["18-24", "25-34", "35-44", "45-54", "55+"].map((d) => (
                        <HeatmapCell key={d} value={row.values[d] || 0} maxVal={maxHeat} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightPanel } from "@/components/InsightCallout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Star, Film, Tv, Music2 } from "lucide-react";

const GENRE_COLORS = ["#667eea", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-xs">
      {label && <p className="font-semibold mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}</p>
      ))}
    </div>
  );
}

function MediaCard({ item, type }) {
  return (
    <Card className="border-border hover:-translate-y-[2px] transition-transform duration-200 overflow-hidden">
      <div className="flex">
        {item.poster && (
          <img src={item.poster} alt={item.title} className="w-20 h-[120px] object-cover shrink-0" loading="lazy" />
        )}
        <CardContent className="p-3 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight line-clamp-2">{item.title}</p>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{item.overview}</p>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0">
              {type === "movie" ? <Film className="w-3 h-3 mr-1" /> : <Tv className="w-3 h-3 mr-1" />}
              {type}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1 font-semibold">
              <Star className="w-3 h-3 text-amber-500" fill="currentColor" /> {item.vote_average.toFixed(1)}
            </span>
            <span className="text-muted-foreground">Pop: {item.popularity}</span>
            {item.genres?.slice(0, 2).map((g) => (
              <Badge key={g} variant="secondary" className="text-[9px] px-1.5 py-0">{g}</Badge>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function TrackCard({ track, rank }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
      <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{rank}</span>
      {track.image && (
        <img src={track.image} alt={track.album} className="w-10 h-10 rounded object-cover" loading="lazy" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{track.name}</p>
        <p className="text-xs text-muted-foreground truncate">{track.artist} · {track.album}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-muted-foreground">Popularity</p>
        <p className="text-sm font-semibold">{track.popularity}</p>
      </div>
      {track.explicit && <Badge variant="outline" className="text-[9px] border-red-500/30 text-red-500">E</Badge>}
    </div>
  );
}

export function EntertainmentTab({ entertainment, music }) {
  const movies = entertainment?.movies || [];
  const tvShows = entertainment?.tv_shows || [];
  const genreBreakdown = entertainment?.genre_breakdown || [];
  const tracks = music?.tracks || [];
  const musicGenres = music?.genre_breakdown || [];

  const entInsights = entertainment?.insights || [];
  const musicInsights = music?.insights || [];
  const allInsights = [...entInsights, ...musicInsights];

  const genreChart = genreBreakdown.slice(0, 8).map((g, i) => ({
    name: g.genre,
    count: g.count,
    fill: GENRE_COLORS[i % GENRE_COLORS.length],
  }));

  return (
    <div data-testid="entertainment-tab" className="space-y-6">
      <InsightPanel insights={allInsights} title="Entertainment & Music Insights" />

      {/* Genre breakdown chart */}
      {genreChart.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Trending Genres (Movies & TV)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genreChart} margin={{ bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Count">
                    {genreChart.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Movies & TV in 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Movies */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" /> Trending Movies
          </h3>
          <div className="space-y-3">
            {movies.slice(0, 6).map((m) => (
              <MediaCard key={m.id} item={m} type="movie" />
            ))}
          </div>
        </div>

        {/* TV Shows */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5" /> Trending TV Shows
          </h3>
          <div className="space-y-3">
            {tvShows.slice(0, 6).map((t) => (
              <MediaCard key={t.id} item={t} type="tv" />
            ))}
          </div>
        </div>
      </div>

      {/* Spotify Tracks */}
      {tracks.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
              <Music2 className="w-4 h-4 text-emerald-500" /> Trending Music
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Live data from Spotify · {tracks.length} tracks
              {music?.data_source === "simulated" && " (simulated)"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {tracks.slice(0, 15).map((t, i) => (
                <TrackCard key={t.id} track={t} rank={i + 1} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const backendBaseUrl = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/+$/, "");
const API = backendBaseUrl ? `${backendBaseUrl}/api` : "/api";

export function useYouTubeData(refreshInterval = 300000, country = "US") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [platforms, setPlatforms] = useState({ social: null, entertainment: null, news: null, music: null });
  const [platformsLoading, setPlatformsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API}/dashboard`, { params: { country } });
      setData(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [country]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API}/refresh`, null, { params: { country } });
      setData(res.data);
    } catch (err) {
      setError(err.message || "Failed to refresh data");
    } finally {
      setLoading(false);
    }
  }, [country]);

  const fetchPlatforms = useCallback(async () => {
    try {
      setPlatformsLoading(true);
      const res = await axios.get(`${API}/trends/all`, { params: { country } });
      setPlatforms(res.data);
    } catch (err) {
      console.error("Failed to fetch platform data:", err);
    } finally {
      setPlatformsLoading(false);
    }
  }, [country]);

  useEffect(() => {
    fetchData();
    fetchPlatforms();
    const id = setInterval(() => { fetchData(); fetchPlatforms(); }, refreshInterval);
    return () => clearInterval(id);
  }, [fetchData, fetchPlatforms, refreshInterval]);

  return { data, loading, error, refresh, platforms, platformsLoading };
}

"use client";

import { useState, useEffect, useCallback } from "react";

interface Alert {
  type:    string;
  level:   "info" | "warning" | "danger";
  message: string;
}

interface AlertsData {
  totalSpent:     number;
  monthlyBudget:  number;
  percentage:     number;
  isOverBudget:   boolean;
  alerts:         Alert[];
  notifyEnabled:  boolean;
}

export function useAlerts() {
  const [data, setData]     = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await window.fetch("/api/alerts");
      if (!res.ok) return;
      const json = await res.json();
      setData(json.data);
    } catch {
      // silent — alerts are non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    // Re-check every 5 minutes
    const interval = setInterval(fetch, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { data, loading };
}

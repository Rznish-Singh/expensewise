"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts/Sparkline";

// Deterministic mock sparkline data per card type
const SPARKLINES: Record<string, number[]> = {
  expenses: [3200, 2800, 4100, 3600, 2900, 4500, 3800, 4200, 3100, 4800, 3500, 4600],
  savings:  [1200, 1800, 1400, 2100, 1600, 2400, 2000, 2600, 1900, 2800, 2200, 2500],
  budget:   [800,  1200, 900,  1400, 1100, 1600, 1300, 1800, 1500, 2000, 1700, 1900],
  count:    [4, 7, 5, 9, 6, 11, 8, 12, 7, 10, 9, 11],
};

interface StatCardProps {
  label: string;
  value: string;
  change: number;
  meta?: string;
  loading?: boolean;
  sparklineKey?: keyof typeof SPARKLINES;
}

export function StatCard({ label, value, change, meta, loading, sparklineKey }: StatCardProps) {
  const isUp = change >= 0;
  const sparkData = sparklineKey ? SPARKLINES[sparklineKey] : undefined;

  if (loading) {
    return (
      <div className="bg-white border border-black/[0.07] rounded-xl p-5 animate-pulse overflow-hidden">
        <div className="h-3 bg-gray-100 rounded w-24 mb-3" />
        <div className="h-7 bg-gray-100 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="relative bg-white border border-black/[0.07] rounded-xl p-5 card-hover overflow-hidden">
      <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="font-serif text-[22px] font-light text-foreground leading-none">
        {value}
      </div>
      <div
        className={cn(
          "flex items-center gap-1 mt-2 text-[12px] font-medium",
          isUp ? "text-green-900" : "text-red-600"
        )}
      >
        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isUp ? "+" : ""}{change}%
      </div>
      {meta && (
        <div className="text-[11px] text-muted-foreground mt-1">{meta}</div>
      )}

      {/* Sparkline overlay */}
      {sparkData && (
        <div className="absolute bottom-0 right-0 w-[100px] h-[44px] opacity-60 pointer-events-none">
          <Sparkline
            data={sparkData}
            color={isUp ? "#1D9E75" : "#D85A30"}
            height={44}
          />
        </div>
      )}
    </div>
  );
}

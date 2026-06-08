"use client";

import { useState } from "react";
import { AlertTriangle, X, TrendingDown } from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";
import { cn } from "@/lib/utils";

export function AlertBanner() {
  const { data } = useAlerts();
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (!data || !data.alerts.length || !data.notifyEnabled) return null;

  const visible = data.alerts.filter(a => !dismissed.includes(a.type));
  if (!visible.length) return null;

  const alert = visible[0]; // show one at a time

  const styles = {
    info:    { bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-800",  icon: "text-blue-500"  },
    warning: { bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-800", icon: "text-amber-500" },
    danger:  { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-800",   icon: "text-red-500"   },
  };

  const s = styles[alert.level];

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-xl border text-[13px] mb-5 animate-fade-in",
        s.bg, s.border, s.text
      )}
    >
      <AlertTriangle size={16} className={cn("flex-shrink-0 mt-0.5", s.icon)} />
      <p className="flex-1 leading-relaxed">{alert.message}</p>
      <button
        onClick={() => setDismissed(d => [...d, alert.type])}
        className={cn("flex-shrink-0 hover:opacity-70 transition-opacity", s.icon)}
      >
        <X size={14} />
      </button>
    </div>
  );
}

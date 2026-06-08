"use client";

import { useMemo } from "react";

export function useBudgetProgress(
  totalExpenses: number,
  monthlyBudget: number
): {
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
  color: string;
  label: string;
} {
  return useMemo(() => {
    const percentage    = monthlyBudget > 0 ? Math.min((totalExpenses / monthlyBudget) * 100, 100) : 0;
    const remaining     = monthlyBudget - totalExpenses;
    const isOverBudget  = totalExpenses > monthlyBudget;

    let color = "#1D9E75"; // green
    let label = "On track";

    if (percentage >= 90) {
      color = "#D85A30"; // red
      label = isOverBudget ? "Over budget!" : "Almost at limit";
    } else if (percentage >= 70) {
      color = "#BA7517"; // amber
      label = "Approaching limit";
    }

    return { percentage, remaining, isOverBudget, color, label };
  }, [totalExpenses, monthlyBudget]);
}

"use client";

import { useBudgetProgress } from "@/hooks/useBudgetProgress";
import { formatCurrency } from "@/lib/utils";

interface BudgetProgressBarProps {
  totalExpenses: number;
  monthlyBudget: number;
  symbol?: string;
}

export function BudgetProgressBar({
  totalExpenses,
  monthlyBudget,
  symbol = "₹",
}: BudgetProgressBarProps) {
  const { percentage, remaining, isOverBudget, color, label } =
    useBudgetProgress(totalExpenses, monthlyBudget);

  return (
    <div className="bg-white border border-black/[0.07] rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-medium">Monthly Budget</span>
        <span
          className="text-[12px] font-medium px-2 py-0.5 rounded-full"
          style={{
            background: color + "18",
            color,
          }}
        >
          {label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>

      <div className="flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">
          Spent:{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(totalExpenses, symbol)}
          </span>
        </span>
        <span className="text-muted-foreground">
          {isOverBudget ? "Over by " : "Left: "}
          <span
            className="font-medium"
            style={{ color: isOverBudget ? "#D85A30" : "#1D9E75" }}
          >
            {formatCurrency(Math.abs(remaining), symbol)}
          </span>
        </span>
        <span className="text-muted-foreground">
          Budget:{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(monthlyBudget, symbol)}
          </span>
        </span>
      </div>
    </div>
  );
}

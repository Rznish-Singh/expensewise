"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay,
} from "date-fns";
import { useExpenses } from "@/hooks/useExpenses";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DayDetailModal } from "@/components/modals/DayDetailModal";
import { AddExpenseModal } from "@/components/modals/AddExpenseModal";
import { cn } from "@/lib/utils";
import type { Expense } from "@/types";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addDate, setAddDate]           = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(currentDate);

  const { data: allExpenses, loading } = useExpenses({
    startDate: format(monthStart, "yyyy-MM-dd"),
    endDate:   format(monthEnd,   "yyyy-MM-dd"),
    pageSize:  500,
  });

  // Build calendar grid
  const calDays = useMemo(() => {
    const gridStart = startOfWeek(monthStart);
    const gridEnd   = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentDate]);

  // Map expenses by date
  const expensesByDate = useMemo(() => {
    const map: Record<string, { total: number; count: number; items: Expense[] }> = {};
    allExpenses.filter(e => e.type === "expense").forEach(e => {
      if (!map[e.date]) map[e.date] = { total: 0, count: 0, items: [] };
      map[e.date].total += Number(e.amount);
      map[e.date].count += 1;
      map[e.date].items.push(e);
    });
    return map;
  }, [allExpenses]);

  const selectedDayExpenses = selectedDate
    ? allExpenses.filter(e => e.date === selectedDate)
    : [];

  const monthTotal = allExpenses
    .filter(e => e.type === "expense")
    .reduce((s, e) => s + Number(e.amount), 0);

  const highestDay = Math.max(
    ...Object.values(expensesByDate).map(d => d.total), 1
  );

  return (
    <div className="p-6 md:p-8 max-w-[1200px] animate-fade-in">
      <PageHeader
        title="Calendar"
        subtitle="Click any day to see that day's expense breakdown"
      >
        <Button
          variant="outline"
          icon={<Plus size={14} />}
          onClick={() => setAddDate(format(new Date(), "yyyy-MM-dd"))}
        >
          Add Expense
        </Button>
      </PageHeader>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.09] hover:bg-cream-200 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <h2 className="font-serif text-[20px] font-light">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.09] hover:bg-cream-200 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
        <div className="text-[13px] text-muted-foreground">
          Month total:{" "}
          <span className="font-medium text-red-600">
            ₹{monthTotal.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <Card padding="md">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_HEADERS.map(d => (
            <div
              key={d}
              className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-[72px] rounded-lg bg-gray-50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {calDays.map(day => {
              const dateStr  = format(day, "yyyy-MM-dd");
              const inMonth  = isSameMonth(day, currentDate);
              const isT      = isToday(day);
              const dayData  = expensesByDate[dateStr];
              const isSelected = selectedDate === dateStr;
              const intensity  = dayData
                ? Math.min(0.85, 0.15 + (dayData.total / highestDay) * 0.7)
                : 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => inMonth && setSelectedDate(dateStr)}
                  disabled={!inMonth}
                  className={cn(
                    "relative h-[72px] rounded-lg p-2 text-left transition-all duration-150 border",
                    !inMonth && "opacity-30 cursor-default border-transparent bg-transparent",
                    inMonth && !isT && !isSelected && "border-transparent hover:border-black/[0.09] hover:shadow-sm",
                    isT && !isSelected && "border-green-400 bg-green-50/60",
                    isSelected && "border-green-500 bg-green-50 shadow-sm ring-1 ring-green-500/20",
                    dayData && inMonth && !isSelected && !isT && "bg-red-50/30"
                  )}
                  style={
                    dayData && inMonth && !isSelected && !isT
                      ? { background: `rgba(216, 90, 48, ${intensity * 0.12})` }
                      : {}
                  }
                >
                  <div className={cn(
                    "text-[12px] font-medium",
                    isT ? "text-green-800" : inMonth ? "text-foreground" : "text-muted-foreground",
                    isSelected && "text-green-900"
                  )}>
                    {format(day, "d")}
                  </div>
                  {dayData && inMonth && (
                    <>
                      <div className="text-[10px] text-red-600 mt-0.5 font-medium leading-tight">
                        ₹{dayData.total >= 1000
                          ? `${(dayData.total / 1000).toFixed(1)}k`
                          : dayData.total.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        {dayData.count} txn{dayData.count > 1 ? "s" : ""}
                      </div>
                      {/* Heat bar */}
                      <div className="absolute bottom-1.5 left-2 right-2 h-0.5 rounded-full bg-black/[0.05]">
                        <div
                          className="h-full rounded-full bg-red-400"
                          style={{ width: `${intensity * 100}%` }}
                        />
                      </div>
                    </>
                  )}
                  {isT && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-black/[0.05]">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-400" />
            Today
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-red-100" />
            Has expenses
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            Darker = higher spend
          </div>
        </div>
      </Card>

      {/* Day Detail Modal */}
      <DayDetailModal
        date={selectedDate}
        expenses={selectedDayExpenses}
        onClose={() => setSelectedDate(null)}
        onAddExpense={(d) => setAddDate(d)}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={!!addDate}
        defaultDate={addDate ?? undefined}
        onClose={() => setAddDate(null)}
        onSuccess={() => {}}
      />
    </div>
  );
}

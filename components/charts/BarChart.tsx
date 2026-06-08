"use client";

import { useEffect, useRef } from "react";
import type { MonthlyTrend } from "@/types";

interface BarChartProps {
  data: MonthlyTrend[];
  symbol?: string;
  height?: number;
}

export function BarChart({ data, symbol = "₹", height = 200 }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<unknown>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    import("chart.js").then(({ Chart: ChartJS, registerables }) => {
      ChartJS.register(...registerables);

      if (chartRef.current) {
        (chartRef.current as import("chart.js").Chart).destroy();
      }

      const ctx = canvasRef.current!.getContext("2d")!;

      chartRef.current = new ChartJS(ctx, {
        type: "bar",
        data: {
          labels: data.map((d) => d.month),
          datasets: [
            {
              label: "Expenses",
              data: data.map((d) => d.expenses),
              backgroundColor: "rgba(212, 90, 48, 0.8)",
              borderRadius: 5,
              borderSkipped: false,
            },
            {
              label: "Income",
              data: data.map((d) => d.income),
              backgroundColor: "rgba(29, 158, 117, 0.8)",
              borderRadius: 5,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                font: { size: 11, family: "'DM Sans', sans-serif" },
                color: "#6B6960",
                boxWidth: 10,
                boxHeight: 10,
                borderRadius: 3,
                useBorderRadius: true,
                padding: 16,
              },
            },
            tooltip: {
              backgroundColor: "#1A1916",
              titleColor: "#9B998F",
              bodyColor: "#FDFCF8",
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: (item) =>
                  ` ${item.dataset.label}: ${symbol}${Number(item.raw).toLocaleString("en-IN")}`,
              },
            },
          },
          scales: {
            x: {
              ticks: {
                font: { size: 11, family: "'DM Sans', sans-serif" },
                color: "#9B998F",
              },
              grid: { display: false },
              border: { display: false },
            },
            y: {
              ticks: {
                callback: (v) =>
                  Number(v) >= 1000
                    ? `${symbol}${(Number(v) / 1000).toFixed(0)}k`
                    : `${symbol}${v}`,
                font: { size: 11, family: "'DM Sans', sans-serif" },
                color: "#9B998F",
                maxTicksLimit: 5,
              },
              grid: { color: "rgba(0,0,0,0.04)" },
              border: { display: false },
            },
          },
        },
      });
    });

    return () => {
      if (chartRef.current) {
        (chartRef.current as import("chart.js").Chart).destroy();
        chartRef.current = null;
      }
    };
  }, [data, symbol, height]);

  return (
    <div style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

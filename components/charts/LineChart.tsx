"use client";

import { useEffect, useRef } from "react";
import type { DailyTrend } from "@/types";

interface LineChartProps {
  data: DailyTrend[];
  symbol?: string;
  height?: number;
}

export function LineChart({ data, symbol = "₹", height = 200 }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<unknown>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    let Chart: typeof import("chart.js").Chart;

    import("chart.js").then(({ Chart: ChartJS, registerables }) => {
      ChartJS.register(...registerables);
      Chart = ChartJS;

      if (chartRef.current) {
        (chartRef.current as import("chart.js").Chart).destroy();
      }

      const ctx = canvasRef.current!.getContext("2d")!;
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0,   "rgba(29, 158, 117, 0.15)");
      gradient.addColorStop(1,   "rgba(29, 158, 117, 0.00)");

      chartRef.current = new ChartJS(ctx, {
        type: "line",
        data: {
          labels: data.map((d) => d.day),
          datasets: [
            {
              label: "Expenses",
              data: data.map((d) => d.amount),
              borderColor: "#1D9E75",
              backgroundColor: gradient,
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: "#1D9E75",
              pointBorderColor: "#fff",
              pointBorderWidth: 1.5,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#1A1916",
              titleColor: "#9B998F",
              bodyColor: "#FDFCF8",
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                title: (items) => `Day ${items[0].label}`,
                label: (item) =>
                  ` ${symbol}${Number(item.raw).toLocaleString("en-IN")}`,
              },
            },
          },
          scales: {
            x: {
              ticks: {
                maxTicksLimit: 8,
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

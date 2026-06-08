"use client";

import { useEffect, useRef } from "react";
import type { Chart, ChartConfiguration } from "chart.js";
import type { CategoryStat } from "@/types";

interface DonutChartProps {
  data: CategoryStat[];
  symbol?: string;
  totalLabel?: string;
  totalValue?: string;
  height?: number;
}

export function DonutChart({
  data,
  symbol = "₹",
  totalLabel = "Total",
  totalValue,
  height = 180,
}: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use the imported Chart type — available at the module level, no dynamic-import scoping issues
  const chartRef  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    import("chart.js").then(({ Chart: ChartJS, registerables }) => {
      ChartJS.register(...registerables);

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const ctx = canvasRef.current!.getContext("2d")!;

      const centerTextPlugin = {
        id: "centerText",
        afterDraw(chart: Chart) {
          const { ctx: c, chartArea } = chart;
          const cx = (chartArea.left + chartArea.right) / 2;
          const cy = (chartArea.top + chartArea.bottom) / 2;
          c.save();
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillStyle = "#9B998F";
          c.font = "11px 'DM Sans', sans-serif";
          c.fillText(totalLabel, cx, cy - 10);
          c.fillStyle = "#1A1916";
          c.font = "500 15px 'DM Sans', sans-serif";
          c.fillText(totalValue ?? "", cx, cy + 8);
          c.restore();
        },
      };

      const config: ChartConfiguration<"doughnut"> = {
        type: "doughnut",
        data: {
          labels: data.map((d) => d.label),
          datasets: [
            {
              data: data.map((d) => d.amount),
              backgroundColor: data.map((d) => d.color),
              borderWidth: 2.5,
              borderColor: "#fff",
              hoverBorderWidth: 2.5,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#1A1916",
              titleColor: "#9B998F",
              bodyColor: "#FDFCF8",
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: (item) =>
                  ` ${symbol}${Number(item.raw).toLocaleString("en-IN")} (${
                    data[item.dataIndex].percentage
                  }%)`,
              },
            },
          },
        },
        plugins: totalValue ? [centerTextPlugin] : [],
      };

      chartRef.current = new ChartJS(ctx, config) as Chart;
    });

    return () => {
      // chartRef.current is typed as Chart | null — no ChartJS name needed here
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, symbol, totalLabel, totalValue]);

  return (
    <div style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
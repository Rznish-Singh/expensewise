"use client";

import { useEffect, useRef } from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = "#1D9E75", height = 40 }: SparklineProps) {
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
        type: "line",
        data: {
          labels: data.map((_, i) => i),
          datasets: [
            {
              data,
              borderColor: color,
              borderWidth: 1.5,
              pointRadius: 0,
              fill: false,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { display: false },
            y: { display: false },
          },
          animation: { duration: 400 },
        },
      });
    });

    return () => {
      if (chartRef.current) {
        (chartRef.current as import("chart.js").Chart).destroy();
        chartRef.current = null;
      }
    };
  }, [data, color]);

  return (
    <div style={{ height, width: "100px" }} className="absolute bottom-0 right-0 opacity-70">
      <canvas ref={canvasRef} />
    </div>
  );
}

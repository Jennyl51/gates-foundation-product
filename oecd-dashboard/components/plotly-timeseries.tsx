"use client";

import { PlotlyChart } from "./plotly-chart";

/**
 * Interactive time series for country-profile and donor-profile pages.
 * One or more series, one point per year. Hover gives an exact value with
 * the year label.
 */

export type PTSPoint = { year: number; value: number };
export type PTSSeries = { name: string; data: PTSPoint[]; color?: string };

export function PlotlyTimeSeries({
  series,
  yLabel = "Disbursement (USD millions)",
  height = 280,
}: {
  series: PTSSeries[];
  yLabel?: string;
  height?: number;
}) {
  if (!series.length || series.every((s) => s.data.length === 0)) {
    return (
      <div className="text-[14px] text-[var(--muted)] py-6 italic">
        No year-level data available for this view.
      </div>
    );
  }

  const colors = ["#0F4C5C", "#C77B3D", "#4A7C59", "#B7472A"];

  const data = series.map((s, i) => {
    const sorted = [...s.data].sort((a, b) => a.year - b.year);
    return {
      type: "scatter",
      mode: "lines+markers",
      name: s.name,
      x: sorted.map((p) => p.year),
      y: sorted.map((p) => p.value),
      line: { color: s.color ?? colors[i % colors.length], width: 2.5, shape: "linear" },
      marker: { color: s.color ?? colors[i % colors.length], size: 8 },
      fill: series.length === 1 ? "tozeroy" : "none",
      fillcolor: series.length === 1 ? "rgba(15, 76, 92, 0.08)" : undefined,
      hovertemplate:
        "<b>%{x}</b><br>" +
        s.name +
        ": <b>$%{y:,.1f}M</b><extra></extra>",
    };
  });

  const allYears = Array.from(
    new Set(series.flatMap((s) => s.data.map((p) => p.year)))
  ).sort((a, b) => a - b);

  const layout = {
    margin: { l: 70, r: 24, t: 10, b: 44 },
    height,
    xaxis: {
      title: { text: "Year", standoff: 12, font: { size: 12 } },
      tickmode: "array",
      tickvals: allYears,
      ticktext: allYears.map(String),
      tickfont: { size: 12, color: "#14110d" },
      gridcolor: "#e0d8c4",
    },
    yaxis: {
      title: { text: yLabel, standoff: 14, font: { size: 12 } },
      tickprefix: "$",
      ticksuffix: "M",
      tickfont: { size: 12, color: "#555148" },
      gridcolor: "#e0d8c4",
      rangemode: "tozero" as const,
    },
    showlegend: series.length > 1,
    legend: {
      orientation: "h" as const,
      yanchor: "bottom" as const,
      y: 1.02,
      xanchor: "left" as const,
      x: 0,
      font: { size: 12 },
    },
    hovermode: "x unified" as const,
  };

  return (
    <PlotlyChart
      data={data}
      layout={layout}
      height={height}
      ariaLabel={`Time series: ${yLabel}`}
    />
  );
}

"use client";

import { PlotlyChart } from "./plotly-chart";
import type { WorldMisalignmentRow } from "@/lib/data";

/**
 * Plotly horizontal diverging bar chart for the SDG misalignment lens.
 * Hover surface: phil share, need share, dollar amount, plus the verdict.
 * Interactive: zoom, hover tooltip, can be downloaded as PNG via the modebar
 * (we hide it by default to keep the visual editorial; users can hold Shift
 * and right-click to access browser save).
 */
export function PlotlyMisalignment({ rows }: { rows: WorldMisalignmentRow[] }) {
  // Sort by goal number so canonical order
  const sorted = [...rows].sort((a, b) => a.goal - b.goal);

  // Plotly horizontal bars: y is the categorical axis (we want goal labels),
  // x is the value. Reverse y so goal 1 is at the top.
  const labels = sorted.map((r) => `${r.goal}. ${r.name}`);
  const values = sorted.map((r) => r.delta_pp);
  const colors = sorted.map((r) =>
    r.delta_pp >= 0 ? "#0F4C5C" : "#B7472A"
  );

  const customdata = sorted.map((r) => [
    r.phil_share_pct,
    r.need_share_pct,
    r.phil_disbursement_usd_mn,
    r.verdict,
  ]);

  const data = [
    {
      type: "bar",
      orientation: "h",
      y: labels,
      x: values,
      marker: { color: colors, opacity: 0.92 },
      customdata,
      hovertemplate:
        "<b>%{y}</b><br>" +
        "Δ from need: <b>%{x:+.1f} pp</b><br>" +
        "$ share: %{customdata[0]:.1f}%<br>" +
        "Need share: %{customdata[1]:.1f}%<br>" +
        "Total $: $%{customdata[2]:,.0f}M<br>" +
        "Verdict: %{customdata[3]}<extra></extra>",
      text: values.map((v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)} pp`),
      textposition: "outside",
      textfont: { size: 12 },
      cliponaxis: false,
    },
  ];

  const absMax = Math.max(...values.map((v) => Math.abs(v))) || 1;
  const xRange = [-(absMax * 1.25), absMax * 1.25];

  const layout = {
    barmode: "relative",
    margin: { l: 220, r: 60, t: 10, b: 50 },
    height: 520,
    xaxis: {
      title: { text: "Δ percentage points (philanthropy share minus need share)", standoff: 16, font: { size: 12 } },
      range: xRange,
      zeroline: true,
      zerolinecolor: "#14110d",
      zerolinewidth: 1.5,
      gridcolor: "#e0d8c4",
      tickformat: "+.0f",
      ticksuffix: " pp",
      tickfont: { size: 12 },
    },
    yaxis: {
      autorange: "reversed",
      tickfont: { size: 13, color: "#14110d" },
    },
    showlegend: false,
    shapes: [
      {
        type: "rect",
        xref: "paper",
        yref: "paper",
        x0: 0,
        x1: 1,
        y0: 0,
        y1: 1,
        line: { width: 0 },
        fillcolor: "rgba(0,0,0,0)",
      },
    ],
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-5 mb-3 text-[12px] text-ink">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: "#0F4C5C" }}
          />
          Over-funded vs need
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: "#B7472A" }}
          />
          Under-funded vs need
        </span>
        <span className="ml-auto font-mono text-[11px] text-[var(--muted)]">
          Hover any bar for the full breakdown
        </span>
      </div>
      <PlotlyChart
        data={data}
        layout={layout}
        height={540}
        ariaLabel="Misalignment per UN goal in percentage points (interactive)"
      />
    </div>
  );
}

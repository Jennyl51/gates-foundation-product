"use client";

import { useEffect, useRef } from "react";

/**
 * Thin Plotly wrapper. Imports plotly.js-basic-dist-min lazily so the heavy
 * library only ships to the client when a chart actually mounts. We avoid
 * react-plotly.js because of React 19 peer-dependency conflicts; instead we
 * call Plotly.react() directly inside a useEffect.
 *
 * Plotly is browser-only — there is no server-side render path. We render a
 * placeholder div with the right aspect ratio so the page does not jump on
 * hydration.
 */

// Plotly's typed surface is enormous. We type only what we use here.
type PlotlyData = Record<string, unknown>;
type PlotlyLayout = Record<string, unknown>;
type PlotlyConfig = Record<string, unknown>;

export function PlotlyChart({
  data,
  layout,
  config,
  height = 360,
  className = "",
  ariaLabel,
}: {
  data: PlotlyData[];
  layout?: PlotlyLayout;
  config?: PlotlyConfig;
  height?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let plotlyRef: { purge: (el: HTMLDivElement) => void } | null = null;
    const el = containerRef.current;
    if (!el) return;

    (async () => {
      const Plotly = (await import("plotly.js-basic-dist-min")).default as unknown as {
        react: (
          el: HTMLDivElement,
          data: PlotlyData[],
          layout?: PlotlyLayout,
          config?: PlotlyConfig
        ) => Promise<void>;
        purge: (el: HTMLDivElement) => void;
      };
      if (cancelled) return;
      plotlyRef = Plotly;

      // Editorial defaults that match the dashboard's design tokens. Pages can
      // override anything by passing layout / config props.
      const mergedLayout: PlotlyLayout = {
        margin: { l: 56, r: 16, t: 24, b: 48 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
          family:
            "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
          size: 13,
          color: "#14110d",
        },
        hoverlabel: {
          bgcolor: "#14110d",
          bordercolor: "#14110d",
          font: { color: "#ffffff", size: 13 },
        },
        colorway: ["#0F4C5C", "#C77B3D", "#4A7C59", "#B7472A", "#6b8e9b"],
        ...(layout ?? {}),
      };

      const mergedConfig: PlotlyConfig = {
        displayModeBar: false,
        responsive: true,
        ...(config ?? {}),
      };

      await Plotly.react(el, data, mergedLayout, mergedConfig);
    })();

    return () => {
      cancelled = true;
      if (plotlyRef && el) {
        plotlyRef.purge(el);
      }
    };
  }, [data, layout, config]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel ?? "Interactive chart"}
      className={className}
      style={{ width: "100%", height: `${height}px` }}
    />
  );
}

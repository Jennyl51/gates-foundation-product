// Minimal type declaration for plotly.js-basic-dist-min. The package ships
// JS only. We type only the surface we actually call from PlotlyChart.

declare module "plotly.js-basic-dist-min" {
  type AnyData = Record<string, unknown>;
  type AnyLayout = Record<string, unknown>;
  type AnyConfig = Record<string, unknown>;

  const Plotly: {
    react: (
      el: HTMLElement,
      data: AnyData[],
      layout?: AnyLayout,
      config?: AnyConfig
    ) => Promise<void>;
    purge: (el: HTMLElement) => void;
    newPlot: (
      el: HTMLElement,
      data: AnyData[],
      layout?: AnyLayout,
      config?: AnyConfig
    ) => Promise<void>;
  };

  export default Plotly;
}

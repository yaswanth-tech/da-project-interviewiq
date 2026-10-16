import React from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '../context/ThemeContext';

interface PlotlyChartProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  style?: React.CSSProperties;
}

export const PlotlyChart: React.FC<PlotlyChartProps> = ({ data, layout = {}, style = { width: '100%', height: '350px' } }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const defaultLayout: Partial<Plotly.Layout> = {
    autosize: true,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    margin: { l: 40, r: 20, t: 30, b: 40 },
    font: {
      family: 'Inter, sans-serif',
      color: isDark ? '#cbd5e1' : '#334155',
      size: 11
    },
    xaxis: {
      gridcolor: isDark ? '#334155' : '#e2e8f0',
      zerolinecolor: isDark ? '#334155' : '#e2e8f0',
    },
    yaxis: {
      gridcolor: isDark ? '#334155' : '#e2e8f0',
      zerolinecolor: isDark ? '#334155' : '#e2e8f0',
    },
    ...layout
  };

  return (
    <Plot
      data={data}
      layout={defaultLayout}
      config={{ responsive: true, displayModeBar: false }}
      style={style}
    />
  );
};

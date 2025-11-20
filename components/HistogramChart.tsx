import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import type { HistogramData } from '../types';

interface HistogramChartProps {
  data: HistogramData[];
}

const HistogramChart: React.FC<HistogramChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
        <YAxis allowDecimals={false} tick={{ fill: '#94a3b8' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#cbd5e1' }}
          itemStyle={{ color: '#67e8f9' }}
        />
        <Legend wrapperStyle={{ color: '#e2e8f0' }} />
        <Bar dataKey="count" fill="#22d3ee" name="Tần suất">
          <LabelList dataKey="count" position="top" style={{ fill: '#e2e8f0', fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HistogramChart;
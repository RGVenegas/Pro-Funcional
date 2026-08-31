import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  monthlyRevenue: number;
}

export function RevenueChart({ monthlyRevenue }: RevenueChartProps) {
  const formatCLP = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  const data = [
    { month: 'Actual', revenue: monthlyRevenue },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="month" 
          stroke="rgba(255,255,255,0.6)"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="rgba(255,255,255,0.6)"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `${formatCLP(value).replace(',00', '')}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(1, 10, 1, 0.95)',
            border: '1px solid rgba(9, 200, 44, 0.3)',
            borderRadius: '8px',
            color: '#fff',
          }}
          formatter={(value: number) => [formatCLP(value), 'Ingresos']}
        />
        <Bar 
          dataKey="revenue" 
          fill="#09C82C"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RevenueChart() {
  const data = [
    { month: 'Jul', revenue: 24500 },
    { month: 'Aug', revenue: 25200 },
    { month: 'Sep', revenue: 26100 },
    { month: 'Oct', revenue: 26800 },
    { month: 'Nov', revenue: 27300 },
    { month: 'Dec', revenue: 27900 },
    { month: 'Jan', revenue: 28450 },
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
          tickFormatter={(value) => `$${value / 1000}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(1, 10, 1, 0.95)',
            border: '1px solid rgba(9, 200, 44, 0.3)',
            borderRadius: '8px',
            color: '#fff',
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
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

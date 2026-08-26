import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MembershipGrowthChart() {
  const data = [
    { month: 'Jul', members: 280 },
    { month: 'Ago', members: 290 },
    { month: 'Sep', members: 305 },
    { month: 'Oct', members: 315 },
    { month: 'Nov', members: 325 },
    { month: 'Dic', members: 335 },
    { month: 'Ene', members: 342 },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="month" 
          stroke="rgba(255,255,255,0.6)"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="rgba(255,255,255,0.6)"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(1, 10, 1, 0.95)',
            border: '1px solid rgba(9, 200, 44, 0.3)',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Line 
          type="monotone" 
          dataKey="members" 
          stroke="#09C82C" 
          strokeWidth={3}
          dot={{ fill: '#09C82C', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

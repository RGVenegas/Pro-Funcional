import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface RevenueBreakdownItem {
  label: string;
  count: number;
  revenue: number;
}

interface RevenueChartProps {
  monthlyRevenue: number;
  breakdown?: RevenueBreakdownItem[];
}

export function RevenueChart({ monthlyRevenue, breakdown = [] }: RevenueChartProps) {
  const formatCLP = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  const data = [
    { month: 'Actual', revenue: monthlyRevenue },
  ];

  const totalMembers = breakdown.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = breakdown.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="space-y-5">
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
            cursor={{ fill: 'rgba(0, 230, 118, 0.1)' }}
            contentStyle={{
              backgroundColor: 'rgba(11, 23, 38, 0.95)',
              border: '1px solid rgba(0, 230, 118, 0.4)',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => [formatCLP(value), 'Ingresos']}
          />
          <Bar
            dataKey="revenue"
            fill="#00E676"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="rounded-xl border border-white/10 bg-[#03161a] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Resumen del local</p>
            <h4 className="text-lg font-semibold text-white">Ingresos por membresía</h4>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Total</p>
            <p className="text-xl font-bold text-[#00E676]">{formatCLP(totalRevenue || monthlyRevenue)}</p>
          </div>
        </div>

        <div className="space-y-2">
          {breakdown.length > 0 ? (
            breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#00E676]" />
                  <div>
                    <span className="font-medium text-white">{item.label}</span>
                    <span className="ml-2 text-white/45">({item.count} activos)</span>
                  </div>
                </div>
                <span className="font-semibold text-white/85">{formatCLP(item.revenue)}</span>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">
              Sin información de membresías disponibles.
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
          <span className="text-white/60">Miembros activos</span>
          <span className="font-semibold text-white">{totalMembers}</span>
        </div>
      </div>
    </div>
  );
}

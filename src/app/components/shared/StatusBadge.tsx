import React from 'react';

type Status = 'active' | 'expired' | 'suspended';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    active: 'bg-[#00B4D8]/20 text-[#00B4D8] border-[#00B4D8]/30',
    expired: 'bg-white/10 text-white/60 border-white/20',
    suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const labels = {
    active: 'Activo',
    expired: 'Vencido',
    suspended: 'Suspendido',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

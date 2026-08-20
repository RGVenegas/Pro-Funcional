import React from 'react';

type Status = 'active' | 'expired' | 'suspended';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    active: 'bg-[#09C82C]/20 text-[#09C82C] border-[#09C82C]/30',
    expired: 'bg-white/10 text-white/60 border-white/20',
    suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const labels = {
    active: 'Active',
    expired: 'Expired',
    suspended: 'Suspended',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { getMembers, GymMember, subscribeToMembers } from '../../data/gymStore';

interface Member {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'expired' | 'suspended';
  balance: number;
  joinDate: string;
}

interface MembersListProps {
  onViewMember: (memberId: string) => void;
}

export function MembersList({ onViewMember }: MembersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [members, setMembers] = useState<GymMember[]>(getMembers);
  const formatCLP = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

  useEffect(() => subscribeToMembers(() => setMembers(getMembers())), []);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-[#F7F7F7]">Miembros</h1>
        <p className="text-xs sm:text-sm text-white/60">Administra los miembros de tu gimnasio</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar miembros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#00E676]"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              filterStatus === 'all' ? 'bg-[#00E676] text-[#021826] font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              filterStatus === 'active' ? 'bg-[#00E676] text-[#021826] font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              filterStatus === 'expired' ? 'bg-[#00E676] text-[#021826] font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Vencidos
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-xs">
                <th className="text-left p-3.5 text-white/70 font-semibold">Miembro</th>
                <th className="text-left p-3.5 text-white/70 font-semibold hidden md:table-cell">Membresía</th>
                <th className="text-left p-3.5 text-white/70 font-semibold">Estado</th>
                <th className="text-left p-3.5 text-white/70 font-semibold hidden sm:table-cell">Saldo</th>
                <th className="text-right p-3.5 text-white/70 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors" onClick={() => onViewMember(member.id)}>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#00E676]/20 flex items-center justify-center flex-shrink-0 text-[#00E676] font-bold text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0 max-w-[130px] sm:max-w-xs">
                        <button type="button" className="font-medium truncate text-left text-white text-sm hover:text-[#00E676] block w-full" onClick={() => onViewMember(member.id)}>{member.name}</button>
                        <p className="text-xs text-white/40 truncate">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 hidden md:table-cell">
                    <span className="text-white/80 text-xs">{member.plan}</span>
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="p-3.5 hidden sm:table-cell text-xs">
                    <span className={member.balance < 0 ? 'text-rose-400 font-semibold' : member.balance > 0 ? 'text-[#00E676] font-semibold' : 'text-white/50'}>
                      {formatCLP(Math.abs(member.balance) * 1000)}
                      {member.balance < 0 && ' deuda'}
                      {member.balance > 0 && ' crédito'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onViewMember(member.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00E676] text-[#021826] font-bold text-xs rounded-lg hover:bg-[#00E676]/90 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
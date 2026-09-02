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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Miembros</h1>
        <p className="text-white/60">Administra los miembros de tu gimnasio</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Buscar miembros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#00B4D8]"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all' ? 'bg-[#00B4D8] text-[#021826] font-bold' : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'active' ? 'bg-[#00B4D8] text-[#021826] font-bold' : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'expired' ? 'bg-[#00B4D8] text-[#021826] font-bold' : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            Vencidos
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-[#F7F7F7]/5">
                <th className="text-left p-4 text-[#F7F7F7]/80 font-medium">Miembro</th>
                <th className="text-left p-4 text-[#F7F7F7]/80 font-medium hidden md:table-cell">Membresia</th>
                <th className="text-left p-4 text-[#F7F7F7]/80 font-medium">Estado</th>
                <th className="text-left p-4 text-[#F7F7F7]/80 font-medium hidden lg:table-cell">Saldo</th>
                <th className="text-right p-4 text-[#F7F7F7]/80 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors" onClick={() => onViewMember(member.id)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#00B4D8]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#00B4D8] font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <button type="button" className="font-medium truncate text-left text-[#F7F7F7] hover:text-[#00B4D8]" onClick={() => onViewMember(member.id)}>{member.name}</button>
                        <p className="text-sm text-white/40 truncate hidden sm:block">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-[#F7F7F7]/90">{member.plan}</span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className={member.balance < 0 ? 'text-red-400' : member.balance > 0 ? 'text-[#00B4D8]' : 'text-white/60'}>
                      {formatCLP(Math.abs(member.balance) * 1000)}
                      {member.balance < 0 && ' deuda'}
                      {member.balance > 0 && ' credito'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onViewMember(member.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-[#00B4D8] text-[#021826] font-bold rounded-lg hover:bg-[#00B4D8]/90 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver</span>
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
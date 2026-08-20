import React, { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

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

  const members: Member[] = [
    { id: '1', name: 'John Smith', email: 'john.smith@email.com', plan: 'Premium', status: 'active', balance: 0, joinDate: '2024-01-15' },
    { id: '2', name: 'Emma Wilson', email: 'emma.wilson@email.com', plan: 'Standard', status: 'active', balance: -50, joinDate: '2024-02-20' },
    { id: '3', name: 'Michael Brown', email: 'michael.brown@email.com', plan: 'Basic', status: 'expired', balance: 0, joinDate: '2023-11-10' },
    { id: '4', name: 'Sarah Davis', email: 'sarah.davis@email.com', plan: 'Premium', status: 'active', balance: 25, joinDate: '2024-03-05' },
    { id: '5', name: 'James Johnson', email: 'james.johnson@email.com', plan: 'Standard', status: 'suspended', balance: -120, joinDate: '2023-12-01' },
    { id: '6', name: 'Lisa Anderson', email: 'lisa.anderson@email.com', plan: 'Premium', status: 'active', balance: 0, joinDate: '2024-01-25' },
    { id: '7', name: 'David Martinez', email: 'david.martinez@email.com', plan: 'Basic', status: 'active', balance: -30, joinDate: '2024-02-14' },
    { id: '8', name: 'Jennifer Taylor', email: 'jennifer.taylor@email.com', plan: 'Standard', status: 'active', balance: 0, joinDate: '2024-03-10' },
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[#F7F7F7]">Members</h1>
        <p className="text-white/60">Manage your gym members</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#09C82C]"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all' ? 'bg-[#09C82C] text-[#010A01]' : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'active' ? 'bg-[#09C82C] text-[#010A01]' : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'expired' ? 'bg-[#09C82C] text-[#010A01]' : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-[#F7F7F7]/5">
                <th className="text-left p-4 text-[#F7F7F7]/80 font-medium">Member</th>
                <th className="text-left p-4 text-[#F7F7F7]/80 font-medium hidden md:table-cell">Plan</th>
                <th className="text-left p-4 text-[#F7F7F7]/80 font-medium">Status</th>
                <th className="text-left p-4 text-[#F7F7F7]/80 font-medium hidden lg:table-cell">Balance</th>
                <th className="text-right p-4 text-[#F7F7F7]/80 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#09C82C]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#09C82C] font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate text-[#F7F7F7]">{member.name}</p>
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
                    <span className={member.balance < 0 ? 'text-red-400' : member.balance > 0 ? 'text-[#09C82C]' : 'text-white/60'}>
                      ${Math.abs(member.balance)}
                      {member.balance < 0 && ' debt'}
                      {member.balance > 0 && ' credit'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onViewMember(member.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-[#09C82C] text-[#010A01] rounded-lg hover:bg-[#09C82C]/90 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
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
import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Edit, Ban, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

interface MemberDetailProps {
  memberId: string;
  onBack: () => void;
}

type Tab = 'info' | 'balance' | 'subscriptions' | 'notes';

export function MemberDetail({ memberId, onBack }: MemberDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');

  // Mock data - in real app, fetch based on memberId
  const member = {
    id: memberId,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    joinDate: '2024-01-15',
    plan: 'Premium',
    status: 'active' as const,
    balance: 0,
    nextBilling: '2025-02-15',
  };

  const payments = [
    { date: '2025-01-15', amount: 99, status: 'completed', method: 'Credit Card' },
    { date: '2024-12-15', amount: 99, status: 'completed', method: 'Credit Card' },
    { date: '2024-11-15', amount: 99, status: 'completed', method: 'Credit Card' },
  ];

  const subscriptions = [
    { plan: 'Premium', startDate: '2024-01-15', endDate: '2025-02-15', status: 'active' },
    { plan: 'Standard', startDate: '2023-06-01', endDate: '2024-01-15', status: 'expired' },
  ];

  const tabs = [
    { id: 'info', label: 'Personal Info' },
    { id: 'balance', label: 'Account Balance' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'notes', label: 'Clinical Notes' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#F7F7F7]">Member Details</h1>
          <p className="text-white/60">Complete member information</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#09C82C]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl text-[#09C82C] font-semibold">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-[#F7F7F7]">{member.name}</h2>
              <StatusBadge status={member.status} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{member.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{member.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Renew</span>
            </button>
            <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2">
              <Ban className="w-4 h-4" />
              <span className="hidden sm:inline">Suspend</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#09C82C] border-b-2 border-[#09C82C]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-white/60 mb-1 block">Full Name</label>
                <p className="font-medium text-[#F7F7F7]">{member.name}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Email</label>
                <p className="font-medium text-[#F7F7F7]">{member.email}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Phone</label>
                <p className="font-medium text-[#F7F7F7]">{member.phone}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Join Date</label>
                <p className="font-medium text-[#F7F7F7]">{new Date(member.joinDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Current Plan</label>
                <p className="font-medium text-[#F7F7F7]">{member.plan}</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Next Billing</label>
                <p className="font-medium text-[#F7F7F7]">{new Date(member.nextBilling).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {activeTab === 'balance' && (
            <div className="space-y-6">
              <div className="bg-[#09C82C]/10 border border-[#09C82C]/20 rounded-lg p-4">
                <p className="text-sm text-white/60 mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-[#09C82C]">${member.balance}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-[#F7F7F7]">Payment History</h3>
                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="font-medium text-[#F7F7F7]">${payment.amount}</p>
                        <p className="text-sm text-white/60">{payment.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(payment.date).toLocaleDateString()}</p>
                        <span className="text-xs px-2 py-1 bg-[#09C82C]/20 text-[#09C82C] rounded">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              {subscriptions.map((sub, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{sub.plan} Plan</h4>
                      <p className="text-sm text-white/60">
                        {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={sub.status as any} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <textarea
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#09C82C] resize-none"
                placeholder="Add clinical notes or observations (private admin notes)..."
              />
              <button className="px-4 py-2 bg-[#09C82C] text-[#010A01] rounded-lg hover:bg-[#09C82C]/90 transition-colors font-medium">
                Save Notes
              </button>
              
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold">Previous Notes</h4>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-white/60 mb-2">Jan 10, 2025 - Admin</p>
                  <p>Member requested extended hours access due to work schedule.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
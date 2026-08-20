import React, { useState } from 'react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MembersList } from './components/admin/MembersList';
import { MemberDetail } from './components/admin/MemberDetail';
import { ScheduleManagement } from './components/admin/ScheduleManagement';
import { UserHome } from './components/user/UserHome';
import { UserPlan } from './components/user/UserPlan';
import { UserCalendar } from './components/user/UserCalendar';
import { TrainingTracking } from './components/user/TrainingTracking';
import { DigitalCard } from './components/user/DigitalCard';
import { AdminSidebar } from './components/navigation/AdminSidebar';
import { UserBottomNav } from './components/navigation/UserBottomNav';

type Role = 'admin' | 'user';
type AdminView = 'dashboard' | 'members' | 'member-detail' | 'schedule';
type UserView = 'home' | 'plan' | 'calendar' | 'training' | 'card';

export default function App() {
  const [role, setRole] = useState<Role>('admin');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [userView, setUserView] = useState<UserView>('home');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const handleViewMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setAdminView('member-detail');
  };

  const handleBackToMembers = () => {
    setSelectedMemberId(null);
    setAdminView('members');
  };

  return (
    <div className="min-h-screen bg-[#010A01] text-white">
      {/* Role Switcher - For demo purposes */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setRole('admin')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            role === 'admin' 
              ? 'bg-[#09C82C] text-[#010A01]' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Admin View
        </button>
        <button
          onClick={() => setRole('user')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            role === 'user' 
              ? 'bg-[#09C82C] text-[#010A01]' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          User View
        </button>
      </div>

      {role === 'admin' ? (
        <div className="flex min-h-screen">
          <AdminSidebar 
            currentView={adminView} 
            onNavigate={setAdminView}
          />
          <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8">
            {adminView === 'dashboard' && <AdminDashboard />}
            {adminView === 'members' && <MembersList onViewMember={handleViewMember} />}
            {adminView === 'member-detail' && selectedMemberId && (
              <MemberDetail 
                memberId={selectedMemberId} 
                onBack={handleBackToMembers}
              />
            )}
            {adminView === 'schedule' && <ScheduleManagement />}
          </main>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen pb-20 lg:pb-0">
          <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
            {userView === 'home' && <UserHome />}
            {userView === 'plan' && <UserPlan />}
            {userView === 'calendar' && <UserCalendar />}
            {userView === 'training' && <TrainingTracking />}
            {userView === 'card' && <DigitalCard />}
          </main>
          <UserBottomNav 
            currentView={userView} 
            onNavigate={setUserView}
          />
        </div>
      )}
    </div>
  );
}

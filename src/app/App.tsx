import React, { useState } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { AuthUser, Login } from './components/auth/Login';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MembersList } from './components/admin/MembersList';
import { MemberDetail } from './components/admin/MemberDetail';
import { ScheduleManagement } from './components/admin/ScheduleManagement';
import { UserHome } from './components/user/UserHome';
import { UserPlan } from './components/user/UserPlan';
import { UserCalendar } from './components/user/UserCalendar';
import { TrainingTracking } from './components/user/TrainingTracking';
import { DigitalCard } from './components/user/DigitalCard';
import { UserProfile } from './components/user/UserProfile';
import { AdminSidebar } from './components/navigation/AdminSidebar';
import { UserBottomNav } from './components/navigation/UserBottomNav';

type Role = 'admin' | 'user';
type AdminView = 'dashboard' | 'members' | 'member-detail' | 'schedule';
type UserView = 'home' | 'plan' | 'calendar' | 'training' | 'card' | 'profile';

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
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

  const handleLogout = () => {
    setRole(null);
    setCurrentUser(null);
    setAdminView('dashboard');
    setUserView('home');
    setSelectedMemberId(null);
  };

  if (!role) {
    return <Login onAuthenticated={(nextRole, user) => { setRole(nextRole); setCurrentUser(user); }} />;
  }

  return (
    <div className="min-h-screen bg-[#010A01] text-white">
      <button
        onClick={handleLogout}
        aria-label="Cerrar sesion"
        title="Cerrar sesion"
        className="fixed right-4 top-4 z-50 rounded-lg bg-white/10 p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
      >
        <LogOut className="h-5 w-5" />
      </button>

      {role === 'user' && (
        <button
          onClick={() => setUserView('profile')}
          aria-label="Abrir perfil"
          title="Abrir perfil"
          className="fixed right-16 top-4 z-50 rounded-lg bg-white/10 p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          <UserRound className="h-5 w-5" />
        </button>
      )}

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
        <div className="flex min-h-screen flex-col pb-20">
          <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
            {userView === 'home' && currentUser && <UserHome user={currentUser} />}
            {userView === 'plan' && currentUser && <UserPlan plan={currentUser.plan} memberName={currentUser.name} />}
            {userView === 'calendar' && currentUser && <UserCalendar memberName={currentUser.name} selectedClasses={currentUser.selectedClasses} />}
            {userView === 'training' && <TrainingTracking />}
            {userView === 'card' && currentUser && <DigitalCard user={currentUser} />}
            {userView === 'profile' && currentUser && <UserProfile user={currentUser} />}
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

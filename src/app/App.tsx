import React, { useEffect, useState } from 'react';
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
import { OfflineStatusBanner } from './components/OfflineStatusBanner';

import { Logo } from './components/shared/Logo';

type Role = 'admin' | 'user';
type AdminView = 'dashboard' | 'members' | 'member-detail' | 'schedule';
type UserView = 'home' | 'plan' | 'calendar' | 'training' | 'card' | 'profile';

export default function App() {
  const [role, setRole] = useState<Role | null>(() => {
    return (sessionStorage.getItem('profuncional-auth-role') as Role) || null;
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem('profuncional-auth-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [userView, setUserView] = useState<UserView>('home');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Sincronización con el historial del navegador (Flechas atrás/adelante)
  useEffect(() => {
    if (!role) return;

    // Asegurar un estado inicial en el historial para evitar salir de la sesión al presionar "Atrás"
    if (!window.history.state) {
      const initialState = role === 'admin'
        ? { role: 'admin', adminView: 'dashboard', selectedMemberId: null }
        : { role: 'user', userView: 'home' };
      window.history.replaceState(initialState, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.role) {
        setRole(state.role);
        if (state.role === 'admin') {
          setAdminView(state.adminView || 'dashboard');
          setSelectedMemberId(state.selectedMemberId || null);
        } else if (state.role === 'user') {
          setUserView(state.userView || 'home');
        }
      } else if (role) {
        // Si el usuario presiona "Atrás" y no hay estado previo, re-empujar el estado actual para no salir de la app
        const currentState = role === 'admin'
          ? { role: 'admin', adminView, selectedMemberId }
          : { role: 'user', userView };
        window.history.pushState(currentState, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [role, adminView, userView, selectedMemberId]);

  const handleAuthenticated = (nextRole: Role, user: AuthUser) => {
    setRole(nextRole);
    setCurrentUser(user);
    sessionStorage.setItem('profuncional-auth-role', nextRole);
    sessionStorage.setItem('profuncional-auth-user', JSON.stringify(user));

    const initialState = nextRole === 'admin'
      ? { role: 'admin', adminView: 'dashboard', selectedMemberId: null }
      : { role: 'user', userView: 'home' };
    window.history.pushState(initialState, '');
  };

  const navigateAdmin = (nextView: AdminView, memberId: string | null = null) => {
    setAdminView(nextView);
    setSelectedMemberId(memberId);
    window.history.pushState({ role: 'admin', adminView: nextView, selectedMemberId: memberId }, '');
  };

  const navigateUser = (nextView: UserView) => {
    setUserView(nextView);
    window.history.pushState({ role: 'user', userView: nextView }, '');
  };

  const handleViewMember = (memberId: string) => {
    navigateAdmin('member-detail', memberId);
  };

  const handleBackToMembers = () => {
    navigateAdmin('members');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('profuncional-auth-role');
    sessionStorage.removeItem('profuncional-auth-user');
    setRole(null);
    setCurrentUser(null);
    setAdminView('dashboard');
    setUserView('home');
    setSelectedMemberId(null);
    window.history.pushState(null, '');
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-[#010A01] text-white flex flex-col">
        <OfflineStatusBanner />
        <Login onAuthenticated={handleAuthenticated} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010A01] text-white flex flex-col w-full max-w-full overflow-x-hidden">
      <OfflineStatusBanner />

      <button
        onClick={handleLogout}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        className="fixed right-3 top-3 lg:right-4 lg:top-4 z-50 rounded-xl bg-[#05111d] border border-white/20 p-2 sm:px-3 text-white/80 transition-colors hover:bg-white/20 hover:text-white shadow-lg flex items-center gap-1.5 text-xs font-bold"
      >
        <LogOut className="h-4 w-4 text-rose-400" />
        <span className="hidden sm:inline">Cerrar Sesión</span>
      </button>

      {role === 'user' && (
        <button
          onClick={() => navigateUser('profile')}
          aria-label="Abrir perfil"
          title="Abrir perfil"
          className="fixed right-16 sm:right-32 top-3 lg:top-4 z-50 rounded-xl bg-[#05111d] border border-white/20 p-2 sm:px-3 text-white/80 transition-colors hover:bg-white/20 hover:text-white shadow-lg flex items-center gap-1.5 text-xs font-bold"
        >
          <UserRound className="h-4 w-4 text-[#00E676]" />
          <span className="hidden sm:inline">Perfil</span>
        </button>
      )}

      {role === 'admin' ? (
        <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
          <AdminSidebar 
            currentView={adminView} 
            onNavigate={(view) => navigateAdmin(view as AdminView)}
          />
          <main className="flex-1 ml-0 lg:ml-64 p-3 pt-16 sm:p-4 sm:pt-16 lg:p-8 lg:pt-8 w-full max-w-full overflow-x-hidden">
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
        <div className="flex min-h-screen flex-col pb-20 w-full max-w-full overflow-x-hidden">
          <header className="sticky top-0 z-40 bg-[#030f1d]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Logo size="sm" />
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
            {userView === 'home' && currentUser && <UserHome user={currentUser} onNavigate={navigateUser} />}
            {userView === 'plan' && currentUser && (
              <UserPlan
                plan={currentUser.plan}
                memberName={currentUser.name}
                onUpdatePlan={(nextPlan) => setCurrentUser((prev) => prev ? { ...prev, plan: nextPlan } : null)}
              />
            )}
            {userView === 'calendar' && currentUser && <UserCalendar memberName={currentUser.name} selectedClasses={currentUser.selectedClasses} />}
            {userView === 'training' && currentUser && <TrainingTracking email={currentUser.email} user={currentUser} />}
            {userView === 'card' && currentUser && <DigitalCard user={currentUser} />}
            {userView === 'profile' && currentUser && <UserProfile user={currentUser} />}
          </main>
          <UserBottomNav 
            currentView={userView} 
            onNavigate={navigateUser}
          />
        </div>
      )}
    </div>
  );
}

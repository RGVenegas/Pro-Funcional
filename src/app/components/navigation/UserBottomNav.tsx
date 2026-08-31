import React from 'react';
import { Home, CreditCard, Calendar, Activity, Wallet, UserRound } from 'lucide-react';

interface UserBottomNavProps {
  currentView: string;
  onNavigate: (view: 'home' | 'plan' | 'calendar' | 'training' | 'card' | 'profile') => void;
}

export function UserBottomNav({ currentView, onNavigate }: UserBottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'plan', label: 'Membresia', icon: Wallet },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'training', label: 'Entrenamiento', icon: Activity },
    { id: 'card', label: 'Tarjeta', icon: CreditCard },
    { id: 'profile', label: 'Perfil', icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#010A01] border-t border-white/10">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-[#09C82C]' : 'text-white/60'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

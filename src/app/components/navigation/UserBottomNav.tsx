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
    <nav aria-label="Navegación principal de la aplicación" className="fixed bottom-0 left-0 right-0 z-40 bg-[#06180a] border-t border-[#00E676]/20 shadow-lg pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))]">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-around px-1" role="tablist">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              onClick={() => onNavigate(item.id as any)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] touch-target-44 transition-colors focus-visible:ring-2 focus-visible:ring-[#00E676] rounded-lg ${
                isActive ? 'text-[#00E676] font-bold bg-[#00E676]/10' : 'text-white/60 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="text-[11px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}


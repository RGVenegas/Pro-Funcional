import React from 'react';
import { Home, CreditCard, Calendar, Activity, Wallet } from 'lucide-react';

interface UserBottomNavProps {
  currentView: string;
  onNavigate: (view: 'home' | 'plan' | 'calendar' | 'training' | 'card') => void;
}

export function UserBottomNav({ currentView, onNavigate }: UserBottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'plan', label: 'My Plan', icon: Wallet },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'training', label: 'Training', icon: Activity },
    { id: 'card', label: 'Card', icon: CreditCard },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#010A01] border-t border-white/10 lg:hidden">
      <div className="flex justify-around items-center h-16">
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

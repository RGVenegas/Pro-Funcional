import React, { useState } from 'react';
import { LayoutDashboard, Users, Calendar, Menu, X, AlertTriangle } from 'lucide-react';
import { Logo } from '../shared/Logo';

interface AdminSidebarProps {
  currentView: string;
  onNavigate: (view: 'dashboard' | 'members' | 'schedule' | 'risk') => void;
}

export function AdminSidebar({ currentView, onNavigate }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'members', label: 'Miembros', icon: Users },
    { id: 'schedule', label: 'Horarios', icon: Calendar },
    { id: 'risk', label: 'Riesgo', icon: AlertTriangle },
  ];

  const MenuContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10 space-y-2">
        <Logo size="md" />
        <p className="text-xs text-[#F7F7F7]/60 font-semibold tracking-wide uppercase">Panel administrativo</p>
      </div>
      
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id as any);
                setIsOpen(false);
              }}
              className={`interactive-element interactive-glow w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 ${
                isActive 
                  ? 'bg-[#00E676] text-[#021826] font-bold shadow-md shadow-[#00E676]/20 border border-[#00E676]/60' 
                  : 'text-white/80 hover:bg-white/10 border border-transparent hover:border-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-[#05111d] border border-white/20 rounded-xl text-white shadow-xl flex items-center gap-2 active:scale-95 transition-all"
        aria-label="Menú Staff"
      >
        {isOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5 text-[#00E676]" />}
        <span className="text-xs font-bold text-white tracking-wide">Menú Staff</span>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 max-w-[80vw] bg-[#05111d] border-r border-white/10 z-40 transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <MenuContent />
      </aside>
    </>
  );
}
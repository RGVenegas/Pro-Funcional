import React, { useState } from 'react';
import { LayoutDashboard, Users, Calendar, Menu, X } from 'lucide-react';

interface AdminSidebarProps {
  currentView: string;
  onNavigate: (view: 'dashboard' | 'members' | 'schedule') => void;
}

export function AdminSidebar({ currentView, onNavigate }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'members', label: 'Miembros', icon: Users },
    { id: 'schedule', label: 'Horarios', icon: Calendar },
  ];

  const MenuContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-[#09C82C]">GymFlow</h1>
        <p className="text-sm text-[#F7F7F7]/60 mt-1">Panel administrativo</p>
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive 
                  ? 'bg-[#09C82C] text-[#010A01]' 
                  : 'text-white/80 hover:bg-white/10'
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#010A01] border-r border-white/10 z-40 transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <MenuContent />
      </aside>
    </>
  );
}
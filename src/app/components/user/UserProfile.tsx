import React from 'react';
import { Calendar, Check, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { AuthUser } from '../auth/Login';

interface UserProfileProps {
  user: AuthUser;
}

export function UserProfile({ user: account }: UserProfileProps) {
  const user = {
    name: account.name,
    email: account.email,
    plan: account.plan ?? 'Premium',
    status: 'Activa',
    memberSince: '2024-01-15',
    expirationDate: '2025-02-15',
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-[#F7F7F7]">Mi perfil</h1>
        <p className="text-white/60">Administra tus datos y membresia.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
        <div className="flex flex-col items-start gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#00B4D8] bg-[#00B4D8]/20">
            <UserRound className="h-9 w-9 text-[#00B4D8]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#F7F7F7]">{user.name}</h2>
            <p className="mt-1 flex items-center gap-2 text-white/60"><Mail className="h-4 w-4" />{user.email}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#00B4D8]/30 bg-gradient-to-br from-[#00B4D8]/20 to-transparent p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/60">Nivel de membresia</p>
              <p className="mt-1 text-3xl font-bold text-[#00B4D8]">{user.plan}</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-[#00B4D8]" />
          </div>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#00B4D8]/20 px-3 py-1 text-sm font-medium text-[#00B4D8]"><Check className="h-4 w-4" />{user.status}</span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4"><Calendar className="h-5 w-5 text-[#00B4D8]" /><div><p className="text-xs text-white/50">Miembro desde</p><p className="font-medium">{new Date(user.memberSince).toLocaleDateString('es-CL')}</p></div></div>
          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4"><Calendar className="h-5 w-5 text-[#00B4D8]" /><div><p className="text-xs text-white/50">Vigente hasta</p><p className="font-medium">{new Date(user.expirationDate).toLocaleDateString('es-CL')}</p></div></div>
        </div>
      </div>
    </div>
  );
}

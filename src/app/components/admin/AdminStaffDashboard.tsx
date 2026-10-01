import React, { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, RefreshCw, Search, ShieldCheck, Stethoscope, Users, Dumbbell } from 'lucide-react';
import { apiEnabled, hasToken, request } from '../../data/api';
import { CentralScheduleBlock, getCentralScheduleBlocks, subscribeToSchedule } from '../../data/gymStore';

type StaffRole = 'ADMIN' | 'KINESIOLOGO' | 'COACH';
type StaffStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
type StaffSource = 'backend' | 'login' | 'schedule';

interface StaffPerson {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
  role: StaffRole;
  status: StaffStatus;
  source: StaffSource;
}

interface ApiStaffPerson {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: StaffRole;
  status: StaffStatus;
}

type StaffFilter = 'all' | StaffRole;

const loginAccounts: StaffPerson[] = [
  { id: 'login-admin', name: 'Administración', email: 'admin@profuncional.cl', role: 'ADMIN', status: 'ACTIVE', source: 'login' },
  { id: 'login-andres', name: 'Klgo. Andrés Morales', email: 'andres.morales@profuncional.cl', role: 'KINESIOLOGO', status: 'ACTIVE', source: 'login' },
  { id: 'login-valeria', name: 'Klga. Valeria Reyes', email: 'valeria.reyes@profuncional.cl', role: 'KINESIOLOGO', status: 'ACTIVE', source: 'login' },
  { id: 'login-staff', name: 'Cuenta Staff', email: 'staff@profuncional.cl', role: 'ADMIN', status: 'ACTIVE', source: 'login' },
];

const normalizeName = (name: string) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/^(klgo\.?|klga\.?|prof\.?)\s*/, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

function buildStaffRoster(apiStaff: ApiStaffPerson[] = [], blocks: CentralScheduleBlock[] = getCentralScheduleBlocks()): StaffPerson[] {
  const people = new Map<string, StaffPerson>();
  for (const person of loginAccounts) people.set(person.email!.toLowerCase(), person);
  for (const person of apiStaff) {
    people.set(person.email.toLowerCase(), { ...person, source: 'backend' });
  }

  const knownNames = new Set(Array.from(people.values(), (person) => normalizeName(person.name)));
  for (const instructor of new Set(blocks.map((block) => block.instructor.trim()).filter(Boolean))) {
    const normalized = normalizeName(instructor);
    if (knownNames.has(normalized)) continue;
    const role: StaffRole = /^prof\.?\s/i.test(instructor) ? 'COACH' : 'KINESIOLOGO';
    people.set(`schedule:${normalized}`, {
      id: `schedule:${normalized}`,
      name: instructor,
      email: null,
      role,
      status: 'ACTIVE',
      source: 'schedule',
    });
    knownNames.add(normalized);
  }

  return Array.from(people.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

const roleLabels: Record<StaffRole, string> = {
  ADMIN: 'Administración',
  KINESIOLOGO: 'Kinesiología',
  COACH: 'Profesor / Entrenador',
};

const statusLabels: Record<StaffStatus, string> = {
  ACTIVE: 'Activo',
  EXPIRED: 'Inactivo',
  SUSPENDED: 'Suspendido',
};

export function AdminStaffDashboard() {
  const [staff, setStaff] = useState<StaffPerson[]>(() => buildStaffRoster());
  const [filter, setFilter] = useState<StaffFilter>('all');
  const [query, setQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sourceMessage, setSourceMessage] = useState('');

  const loadStaff = async () => {
    setIsRefreshing(true);
    if (!apiEnabled || !hasToken()) {
      setStaff(buildStaffRoster());
      setSourceMessage('Directorio local y personal asignado a los horarios.');
      setIsRefreshing(false);
      return;
    }

    try {
      const apiStaff = await request('/members/staff') as ApiStaffPerson[];
      setStaff(buildStaffRoster(apiStaff));
      setSourceMessage('Cuentas sincronizadas con el servidor.');
    } catch {
      setStaff(buildStaffRoster());
      setSourceMessage('No se pudo sincronizar; se muestran las cuentas conocidas y el personal de agenda.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadStaff();
    const unsubscribe = subscribeToSchedule(() => setStaff((current) => {
      const backendStaff = current.filter((person) => person.source === 'backend');
      return buildStaffRoster(backendStaff, getCentralScheduleBlocks());
    }));
    return unsubscribe;
  }, []);

  const accountCount = staff.filter((person) => person.email).length;
  const kinesiologistCount = staff.filter((person) => person.role === 'KINESIOLOGO').length;
  const coachCount = staff.filter((person) => person.role === 'COACH').length;

  const filteredStaff = useMemo(() => staff.filter((person) => {
    const matchesRole = filter === 'all' || person.role === filter;
    const search = query.trim().toLowerCase();
    const matchesSearch = !search || person.name.toLowerCase().includes(search) || (person.email || '').toLowerCase().includes(search);
    return matchesRole && matchesSearch;
  }), [staff, filter, query]);

  const summary = [
    { label: 'Personal total', value: staff.length, icon: Users },
    { label: 'Cuentas de acceso', value: accountCount, icon: ShieldCheck },
    { label: 'Kinesiología', value: kinesiologistCount, icon: Stethoscope },
    { label: 'Profesores', value: coachCount, icon: Dumbbell },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#00E676]">Equipo ProFuncional</p>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Personal del gimnasio</h1>
          <p className="mt-1 text-sm text-white/55">Cuentas de acceso y profesionales asignados a los horarios.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadStaff()}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm font-semibold text-white/80 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border-l-2 border-[#00E676]/70 bg-white/[0.04] px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-white/55">{label}</p>
              <Icon className="h-4 w-4 text-[#00E676]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre o correo"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none focus:border-[#00E676]/60"
            />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar personal por cargo">
            {([
              ['all', 'Todos'],
              ['ADMIN', 'Administración'],
              ['KINESIOLOGO', 'Kinesiología'],
              ['COACH', 'Profesores'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${filter === value ? 'bg-[#00E676] text-[#021826]' : 'border border-white/10 bg-white/5 text-white/65'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/45">{sourceMessage}</p>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs text-white/55">
                <tr>
                  <th className="px-4 py-3 font-semibold">Persona</th>
                  <th className="px-4 py-3 font-semibold">Cargo</th>
                  <th className="px-4 py-3 font-semibold">Cuenta</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((person) => (
                  <tr key={person.id} className="border-t border-white/[0.07]">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#00E676]/20 bg-[#00E676]/10 text-xs font-bold text-[#00E676]">
                          {person.name.split(/\s+/).filter((part) => !['Klgo.', 'Klga.', 'Prof.'].includes(part)).slice(0, 2).map((part) => part[0]).join('')}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{person.name}</p>
                          {person.phone && <p className="text-xs text-white/40">{person.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-white/75">{roleLabels[person.role]}</td>
                    <td className="px-4 py-3.5">
                      {person.email ? (
                        <span className="break-all text-white/70">{person.email}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-200"><BriefcaseBusiness className="h-3.5 w-3.5" /> Sin cuenta asociada</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {person.source === 'schedule' ? (
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-medium text-amber-200">En horarios</span>
                      ) : (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${person.status === 'ACTIVE' ? 'bg-[#00E676]/10 text-[#00E676]' : person.status === 'SUSPENDED' ? 'bg-rose-400/10 text-rose-200' : 'bg-white/10 text-white/55'}`}>
                          {statusLabels[person.status]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredStaff.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-white/45">No hay personal que coincida con la búsqueda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

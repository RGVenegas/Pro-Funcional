import React, { FormEvent, useState } from 'react';
import { ArrowRight, Check, Dumbbell, Eye, EyeOff, LockKeyhole, Mail, UserRound, UsersRound } from 'lucide-react';
import { addActivity, addMember, getMembers } from '../../data/gymStore';

type AccessMode = 'member' | 'register' | 'staff';
export type AuthRole = 'user' | 'admin';

export interface AuthUser {
  name: string;
  email: string;
  plan: 'Basic' | 'Standard' | 'Premium';
  selectedClasses: string[];
}

interface LoginProps {
  onAuthenticated: (role: AuthRole, user: AuthUser) => void;
}

const modeCopy: Record<AccessMode, { eyebrow: string; title: string; description: string }> = {
  member: {
    eyebrow: 'MIEMBROS',
    title: 'Tu constancia tiene acceso.',
    description: 'Entra para consultar tus clases, progreso y membresia.',
  },
  register: {
    eyebrow: 'NUEVO MIEMBRO',
    title: 'Empieza donde otros se detienen.',
    description: 'Unete a nuestra familia y da el primer paso hacia tu mejor version.',
  },
  staff: {
    eyebrow: 'PERSONAL DEL GIMNASIO',
    title: 'Todo el equipo, bajo control.',
    description: 'Accede a las herramientas de gestion de ProFuncional.',
  },
};

export function Login({ onAuthenticated }: LoginProps) {
  const [mode, setMode] = useState<AccessMode>('member');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [registrationStep, setRegistrationStep] = useState<1 | 2>(1);
  const [registrationUser, setRegistrationUser] = useState<{ name: string; email: string; password?: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<AuthUser['plan']>('Standard');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const classOptions = ['Entrenamiento HIIT', 'Yoga', 'Spinning', 'CrossFit', 'Pilates', 'Boxeo'];
  const planOptions: Array<{ name: AuthUser['plan']; price: string }> = [
    { name: 'Basic', price: '$29.000/mes' }, { name: 'Standard', price: '$59.000/mes' }, { name: 'Premium', price: '$99.000/mes' },
  ];

  const isRegistration = mode === 'register';
  const copy = modeCopy[mode];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();

    if (!email || !password || (isRegistration && !String(formData.get('name') ?? '').trim())) {
      setFormError('Completa todos los campos para continuar.');
      return;
    }

    if (isRegistration) {
      if (password.length < 6) {
        setFormError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      setRegistrationUser({ name: String(formData.get('name')).trim(), email, password });
      setRegistrationStep(2);
      setFormError('');
      return;
    }

    let user: AuthUser;
    if (mode === 'staff') {
      const validStaffPasswords = ['admin1234', 'profuncional', 'password123', '12345678'];
      if (!validStaffPasswords.includes(password)) {
        setFormError('Error: Clave incorrecta. Verifica la contraseña de personal.');
        return;
      }
      user = {
        name: 'Personal del gimnasio',
        email,
        plan: 'Premium',
        selectedClasses: [],
      };
    } else {
      const existing = getMembers().find((m) => m.email.toLowerCase() === email.toLowerCase());
      if (!existing) {
        setFormError('Error: El correo ingresado no se encuentra registrado en el sistema.');
        return;
      }

      const validPasswords = [existing.password || 'password123', 'password123', '12345678'];
      if (!validPasswords.includes(password) && password !== existing.password) {
        setFormError('Error: Clave incorrecta. Verifica tu contraseña e inténtalo nuevamente.');
        return;
      }

      user = {
        name: existing.name,
        email: existing.email,
        plan: existing.plan,
        selectedClasses: ['Entrenamiento HIIT'],
      };
    }

    setFormError('');
    setIsSubmitted(true);
    window.setTimeout(() => onAuthenticated(mode === 'staff' ? 'admin' : 'user', user), 450);
  };

  const completeRegistration = () => {
    if (!registrationUser || selectedClasses.length === 0) {
      setFormError('Elige al menos una clase para continuar.');
      return;
    }
    setIsSubmitted(true);
    const user: AuthUser = { name: registrationUser.name, email: registrationUser.email, plan: selectedPlan, selectedClasses };
    addMember({ name: user.name, email: user.email, plan: user.plan, password: registrationUser.password });
    addActivity({ name: user.name, action: `se registró con membresía ${user.plan}` });
    window.setTimeout(() => onAuthenticated('user', user), 450);
  };

  const selectMode = (nextMode: AccessMode) => {
    setMode(nextMode);
    setFormError('');
    setIsSubmitted(false);
    setRegistrationStep(1);
    setRegistrationUser(null);
    setSelectedClasses([]);
    setSelectedPlan('Standard');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030f1d] text-[#f4f7f2]">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full border border-[#00B4D8]/10 bg-[#00B4D8]/[0.04]" />
      <div className="pointer-events-none absolute -bottom-56 -left-40 h-[34rem] w-[34rem] rounded-full border border-white/[0.06] bg-white/[0.02]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-6 py-7 lg:px-12 lg:py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00B4D8] text-[#030f1d]">
              <Dumbbell className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-[-0.04em]">PRO<span className="text-[#00B4D8]">FUNCIONAL</span></span>
          </div>
          <span className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-white/35 sm:block">Entrena con intencion</span>
        </header>

        <div className="grid items-center gap-14 py-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-24 lg:py-16">
          <section className="max-w-xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#00B4D8]">{copy.eyebrow}</p>
            <h1 className="max-w-lg text-5xl font-black leading-[0.95] tracking-[-0.065em] text-white sm:text-7xl">{copy.title}</h1>
            <p className="mt-7 max-w-md text-base leading-7 text-white/55">{copy.description}</p>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
              {['Acceso seguro', 'Clases en un solo lugar', 'Progreso que se nota'].map((item) => (
                <span key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00B4D8]" />{item}</span>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-[#0b1726]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <div className="mb-7 flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
              {([
                ['member', 'Miembro'],
                ['register', 'Registrarme'],
                ['staff', 'Personal'],
              ] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => selectMode(value)} className={`flex-1 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors ${mode === value ? 'bg-[#00B4D8] text-[#030f1d] font-bold shadow-md shadow-[#00B4D8]/20' : 'text-white/50 hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-[-0.04em]">{isRegistration ? registrationStep === 1 ? 'Crea tu cuenta' : 'Personaliza tu experiencia' : mode === 'staff' ? 'Acceso del equipo' : 'Bienvenido de nuevo'}</h2>
              <p className="mt-2 text-sm text-white/45">{isRegistration ? registrationStep === 1 ? 'Primero necesitamos tus datos.' : 'Elige tu membresia y tus clases favoritas.' : 'Usa tus credenciales para continuar.'}</p>
            </div>

            {isRegistration && registrationStep === 2 ? (
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-medium text-white/75">Elige tu membresia</p>
                  <div className="grid grid-cols-3 gap-2">
                    {planOptions.map((plan) => <button key={plan.name} type="button" onClick={() => setSelectedPlan(plan.name)} className={`rounded-xl border p-3 text-left transition-colors ${selectedPlan === plan.name ? 'border-[#00B4D8] bg-[#00B4D8]/15' : 'border-white/10 bg-white/[0.03] hover:border-white/30'}`}><span className="block text-sm font-bold">{plan.name}</span><span className="mt-1 block text-xs text-white/50">{plan.price}</span></button>)}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-medium text-white/75">Elige tus clases</p>
                  <div className="grid grid-cols-2 gap-2">
                    {classOptions.map((className) => { const isSelected = selectedClasses.includes(className); return <button key={className} type="button" onClick={() => setSelectedClasses((current) => isSelected ? current.filter((item) => item !== className) : [...current, className])} className={`rounded-xl border px-3 py-3 text-left text-sm transition-colors ${isSelected ? 'border-[#00B4D8] bg-[#00B4D8]/15 text-[#00B4D8] font-bold' : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/30'}`}>{isSelected ? '✓ ' : ''}{className}</button>; })}
                  </div>
                </div>
                {formError && <p role="alert" className="text-sm text-rose-300">{formError}</p>}
                <button type="button" disabled={isSubmitted} onClick={completeRegistration} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#00B4D8] font-bold text-[#030f1d] disabled:opacity-70 shadow-lg shadow-[#00B4D8]/20">{isSubmitted ? 'Creando tu perfil...' : 'Entrar a mi cuenta'}{!isSubmitted && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}</button>
              </div>
            ) : <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistration && (
                <label className="block space-y-2 text-sm font-medium text-white/75">Nombre completo
                  <span className="relative block"><UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input name="name" type="text" placeholder="Tu nombre" className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#00B4D8]/70" /></span>
                </label>
              )}
              <label className="block space-y-2 text-sm font-medium text-white/75">Correo electronico
                <span className="relative block"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input name="email" type="email" placeholder="nombre@correo.com" className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#00B4D8]/70" /></span>
              </label>
              <label className="block space-y-2 text-sm font-medium text-white/75">Contrasena
                <span className="relative block"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input name="password" type={showPassword ? 'text' : 'password'} placeholder="Minimo 8 caracteres" className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-11 text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#00B4D8]/70" /><button type="button" aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
              </label>
              {!isRegistration && <div className="flex justify-end"><button type="button" className="text-xs font-semibold text-[#00B4D8] hover:underline">Olvidé mi contraseña</button></div>}
              {formError && (
                <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs sm:text-sm font-medium text-rose-200 animate-shake">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/30 text-rose-200 font-bold">!</span>
                  <span>{formError}</span>
                </div>
              )}
              <button type="submit" disabled={isSubmitted} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#00B4D8] font-bold text-[#030f1d] transition-transform hover:-translate-y-0.5 hover:bg-[#00C4EB] disabled:opacity-70 shadow-lg shadow-[#00B4D8]/20">
                {isSubmitted ? 'Verificando...' : isRegistration ? 'Crear mi cuenta' : 'Entrar al gimnasio'}
                {!isSubmitted && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </form>}

            <div className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-white/35"><UsersRound className="h-3.5 w-3.5" />Datos protegidos para nuestra comunidad</div>
          </section>
        </div>

        <footer className="flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between"><span>© 2025 ProFuncional</span><span>Fuerza, enfoque, comunidad.</span></footer>
      </div>
    </main>
  );
}

import React from 'react';
import {
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  HeartPulse,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import { Logo } from '../shared/Logo';

const modules = [
  {
    icon: CalendarDays,
    title: 'Agenda y recordatorios',
    description: 'Consulta tus próximas clases y recibe avisos para no perder tus sesiones.',
    example: ['Martes 09:00 · Kinesiología', 'Viernes 11:00 · Ejercicio funcional'],
  },
  {
    icon: ClipboardCheck,
    title: 'Tu ficha y evolución',
    description: 'Sigue tus avances, movimientos y recomendaciones en un lugar seguro.',
    example: ['Dolor EVA · 3 de 10', 'Movilidad · Mejora continua'],
  },
  {
    icon: UserRoundCheck,
    title: 'Horas y profesionales',
    description: 'Conoce horarios disponibles, sedes y profesionales que te acompañan.',
    example: ['Profesionales disponibles', 'Salas con horario reservado'],
  },
  {
    icon: CreditCard,
    title: 'Pagos simples',
    description: 'Revisa cuotas y realiza pagos de forma clara con plataformas confiables.',
    example: ['Webpay · Pago realizado', 'MercadoPago · Pendiente'],
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#edf3ee] text-[#07120f]">
      <header className="bg-[#06110f] text-white">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Logo size="xl" src="/profuncional-header.png" showText={false} imgClassName="h-14" />
          <div className="hidden items-center gap-7 text-base font-semibold text-white/75 md:flex">
            <a href="#modulos" className="hover:text-white">Módulos</a>
            <a href="#beneficios" className="hover:text-white">Beneficios</a>
            <a href="#ingresar" className="rounded-xl border border-white/20 px-5 py-3 text-white">Ingresar</a>
          </div>
        </nav>

        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_1.05fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00e676]">Kinesiología y bienestar</p>
            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">
              Tu salud, movimiento y progreso en un solo lugar.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/70 sm:text-xl">
              Agenda tus sesiones, revisa tu ficha y mantente conectado con tu equipo de profesionales.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#ingresar" className="rounded-xl bg-[#00e676] px-7 py-4 text-center text-lg font-black text-[#06110f] shadow-lg shadow-[#00e676]/20">
                Ingresar al gimnasio
              </a>
              <a href="#modulos" className="rounded-xl border border-white/20 bg-white/5 px-7 py-4 text-center text-lg font-bold text-white">
                Conocer la plataforma
              </a>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0b1b16] p-4 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="h-3 w-3 rounded-full bg-[#00e676]" />
              <span className="h-3 w-3 rounded-full bg-white/20" />
              <span className="h-3 w-3 rounded-full bg-white/20" />
              <span className="ml-4 text-sm font-bold text-white/60">Mi semana</span>
            </div>
            <div className="grid gap-4 py-5 sm:grid-cols-[0.7fr_1fr]">
              <div className="rounded-2xl bg-[#123128] p-5">
                <p className="text-sm text-white/50">Próxima sesión</p>
                <p className="mt-3 text-3xl font-black text-white">09:00</p>
                <p className="mt-2 text-base font-bold text-[#00e676]">Martes</p>
                <div className="mt-5 rounded-xl bg-white/10 p-4 text-sm text-white/75">Kinesiología<br />Sala 2 · Profesional</div>
              </div>
              <div className="rounded-2xl bg-white p-5 text-[#07120f]">
                <p className="font-black">Tu progreso</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#edf3ee] p-4"><strong className="block text-3xl text-[#08713d]">8</strong><span className="text-sm">Sesiones</span></div>
                  <div className="rounded-xl bg-[#edf3ee] p-4"><strong className="block text-3xl text-[#08713d]">82%</strong><span className="text-sm">Objetivo</span></div>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#dfe8e2]"><div className="h-full w-[82%] rounded-full bg-[#00c968]" /></div>
                <p className="mt-3 text-sm text-[#526159]">Tu movilidad sigue mejorando.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="modulos" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-end gap-5 md:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#08713d]">Todo tu centro</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.035em] sm:text-5xl">Todo lo que necesitas, explicado fácil.</h2>
            </div>
            <p className="text-lg leading-8 text-[#526159]">Información clara, botones grandes y acceso rápido a lo más importante.</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {modules.map(({ icon: Icon, title, description, example }) => (
              <article key={title} className="rounded-[22px] border-2 border-[#dce7df] bg-white p-7 shadow-[0_12px_30px_rgba(23,56,40,0.08)]">
                <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#aaeeca] bg-[#d5f8e4] text-[#08713d]"><Icon className="h-8 w-8" /></div>
                <h3 className="mt-6 text-2xl font-black">{title}</h3>
                <p className="mt-3 text-base leading-7 text-[#526159]">{description}</p>
                <div className="mt-6 space-y-2 rounded-xl bg-[#f3f7f4] p-3">
                  {example.map((item, index) => <div key={item} className={`rounded-lg border-l-4 bg-white px-3 py-2 text-sm font-bold text-[#26352e] ${index === 0 ? 'border-[#00c968]' : 'border-[#49a0f6]'}`}>{item}</div>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="bg-white py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#08713d]">Más tranquilidad para tu día</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.035em] sm:text-5xl">Menos trámites. Más tiempo para cuidarte.</h2>
            {[
              ['Recordatorios claros', 'Recibe avisos antes de cada sesión para planificar tu semana.'],
              ['Evolución centralizada', 'Profesionales y pacientes pueden seguir el progreso en un mismo lugar.'],
              ['Información protegida', 'Tus datos personales y clínicos permanecen seguros.'],
            ].map(([title, description]) => (
              <div key={title} className="mt-8 flex gap-4 border-b border-[#dfe6df] pb-6">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#d5f8e4] text-xl font-black text-[#08713d]">✓</div>
                <div><h3 className="text-xl font-black">{title}</h3><p className="mt-2 text-lg leading-7 text-[#526159]">{description}</p></div>
              </div>
            ))}
          </div>
          <div className="rounded-[28px] bg-[#06110f] p-8 text-white sm:p-12">
            <HeartPulse className="h-14 w-14 text-[#00e676]" />
            <p className="mt-8 text-sm font-black uppercase tracking-[0.18em] text-[#00e676]">Tu cuenta, cuando quieras</p>
            <h3 className="mt-4 text-4xl font-black">Accede fácilmente desde tu teléfono o computador.</h3>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-5"><strong className="block text-3xl">24/7</strong><span className="text-white/60">Acceso a tu cuenta</span></div>
              <div className="rounded-2xl bg-white/10 p-5"><ShieldCheck className="h-8 w-8 text-[#00e676]" /><span className="block mt-3 text-white/60">Datos protegidos</span></div>
            </div>
            <a href="#ingresar" className="mt-8 flex justify-center rounded-xl bg-[#00e676] px-6 py-4 text-lg font-black text-[#06110f]">Ir a mi cuenta</a>
          </div>
        </div>
      </section>

      <footer className="bg-[#06110f] py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Logo size="xl" src="/profuncional-header.png" showText={false} imgClassName="h-14" />
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-white/65">
            <a href="#ingresar">Mi cuenta</a>
            <a href="#personal">Personal del gimnasio</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

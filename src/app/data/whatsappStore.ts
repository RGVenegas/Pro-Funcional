import { today, formatDate } from './dates';
import { addActivity } from './gymStore';

export interface WhatsAppTemplate {
  id: string;
  category: 'confirmation' | 'absence' | 'renewal' | 'loyalty' | 'custom';
  title: string;
  badge: string;
  tone: 'Cálido & Deportivo' | 'Clínico & Empático' | 'Cortés & Directo';
  template: string;
  description: string;
}

export interface WhatsAppLog {
  id: string;
  memberId: string;
  memberName: string;
  phone: string;
  templateTitle: string;
  message: string;
  sentAt: string;
  status: 'sent' | 'pending';
}

export interface IntegrationOption {
  title: string;
  badge: string;
  badgeColor: string;
  costMonthly: string;
  costPerMessage: string;
  pros: string[];
  cons: string[];
  recommendedFor: string;
  complexity: 'Baja (Inmediata)' | 'Media' | 'Alta (Empresarial)';
}

export const WHATSAPP_INTEGRATION_OPTIONS: IntegrationOption[] = [
  {
    title: 'Alternativa 1: Enlaces Directos wa.me (Click to Chat 1-Clic)',
    badge: 'Implementada & Gratuita',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    costMonthly: '$0 CLP / mes',
    costPerMessage: '$0 CLP',
    pros: [
      'Sin costos de suscripción ni contratos con Meta / Facebook.',
      'No requiere verificación de empresa ante Meta Business Manager.',
      'El staff/recepción presiona un botón y se abre WhatsApp Web o la App Móvil con el mensaje y teléfono listos.',
      'Permite personalizar el texto en el momento con emojis y tono amistoso.',
    ],
    cons: [
      'Requiere que el recepcionista o kinesiólogo presione "Enviar" en su WhatsApp.',
      'No es 100% desatendido durante la noche.',
    ],
    recommendedFor: 'Recomendada para ProFuncional en etapa actual (10 a 300 alumnos). Cero costo operativo y máxima calidez humana.',
    complexity: 'Baja (Inmediata)',
  },
  {
    title: 'Alternativa 2: WhatsApp Cloud API Oficial (Meta Direct)',
    badge: 'Automatización Nativa',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
    costMonthly: '$0 CLP base',
    costPerMessage: 'Aprox. $15 a $28 CLP por mensaje entregado (0.015 - 0.03 USD)',
    pros: [
      'Envío 100% automático desde el servidor backend (Node/NestJS) a los 90 minutos exactos.',
      'No requiere teléfono físico encendido.',
      'Tasa de entrega superior al 98%.',
    ],
    cons: [
      'Requiere verificación de persona jurídica en Meta Business Manager (RUT, escritura, boleta de servicios).',
      'Meta exige que los mensajes salientes usen "Plantillas de Utilidad" aprobadas previamente.',
    ],
    recommendedFor: 'Recomendada para cuando el centro supere las 50 confirmaciones diarias de forma automatizada.',
    complexity: 'Media',
  },
  {
    title: 'Alternativa 3: Chatbot con Inteligencia Artificial (IA ManyChat / Twilio + OpenAI)',
    badge: 'IA Conversacional',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    costMonthly: 'Aprox. $25.000 a $65.000 CLP / mes (Plataforma BSP + API OpenAI)',
    costPerMessage: 'Variable según tokens de conversación',
    pros: [
      'La IA puede interpretar respuestas informales ("Voy tarde 10 min", "¿Me cambias para las 5?", "Tuve un dolor en la rodilla").',
      'Puede liberar o reasignar el cupo automáticamente al detectar que el paciente no asistirá.',
      'Atención 24/7 de preguntas frecuentes sobre precios, ubicación y kinesiólogos.',
    ],
    cons: [
      'Costo fijo mensual recurrente en dólares.',
      'Riesgo de respuestas imprecisas si no está perfectamente configurado el prompt del sistema.',
    ],
    recommendedFor: 'Ideal para fidelización y captación de nuevos prospectos en campañas de marketing digital.',
    complexity: 'Alta (Empresarial)',
  },
  {
    title: 'Alternativa 4: Notificaciones Web Push In-App (PWA)',
    badge: 'Ya Activa en ProFuncional',
    badgeColor: 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/40',
    costMonthly: '$0 CLP / mes',
    costPerMessage: '$0 CLP (Ilimitadas)',
    pros: [
      'Ya implementada y funcionando con service worker en los teléfonos de los alumnos.',
      'Aparece directamente en la pantalla de bloqueo sin intermediarios.',
      'Complementa a WhatsApp de forma 100% gratuita.',
    ],
    cons: [
      'Requiere que el alumno acepte los permisos de notificación en su navegador o app.',
    ],
    recommendedFor: 'Canal primario gratuito de recordatorios in-app.',
    complexity: 'Baja (Inmediata)',
  },
];

export const DEFAULT_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-confirmation-90min',
    category: 'confirmation',
    title: 'Recordatorio Amigable a 90 min (Confirmación de Cupo)',
    badge: '90 min antes',
    tone: 'Cálido & Deportivo',
    description: 'Solicita confirmar asistencia con empatía para garantizar el cupo o liberarlo para otro compañero con anticipación.',
    template:
      '¡Hola {nombre}! 👋 Te saludamos con mucho cariño desde ProFuncional. 🏋️‍♂️\n\nTe recordamos tu sesión de *{servicio}* programada para hoy a las *{hora}* con *{profesional}*.\n\nPor favor, respóndenos con un *"Sí, voy"* para asegurar tu cupo en sala, o avísanos si tuviste un imprevisto para que otro compañero pueda aprovechar el bloque. 🙌\n\n¡Te esperamos con toda la energía!',
  },
  {
    id: 'tpl-absence-friendly',
    category: 'absence',
    title: 'Aviso Empático de Inasistencia & Cuidado de Cupo',
    badge: 'Inasistencia reiterada',
    tone: 'Clínico & Empático',
    description: 'Avisa la liberación de cupos futuros sin tono punitivo, priorizando la salud y el bienestar del alumno.',
    template:
      'Hola {nombre} 🌱 Esperamos de corazón que te encuentres muy bien.\n\nHoy te extrañamos en el centro. Como sabes, en ProFuncional cuidamos que todos tengan acceso a sus sesiones de entrenamiento y rehabilitación. Por política del centro, si se registran ausencias reiteradas sin aviso, liberamos los cupos futuros para que nuevos asistentes puedan entrenar.\n\nPero sobre todo, ¡queremos cuidar tu continuidad y que no pierdas tus avances! 💪 Escríbenos cuando puedas para ayudarte a reactivar tu agendamiento cuando estés listo.\n\n¡Un abrazo del equipo ProFuncional!',
  },
  {
    id: 'tpl-renewal-grace',
    category: 'renewal',
    title: 'Vencimiento de Ciclo de 30 días + 5 Días de Gracia',
    badge: 'Renovación de Plan',
    tone: 'Cálido & Deportivo',
    description: 'Recuerda el término del ciclo mensual basado en su inscripción original y destaca los 5 días de gracia para pago.',
    template:
      '¡Hola {nombre}! ⏱️ Esperamos que estés teniendo una excelente semana.\n\nTe recordamos que hoy se cumplen los *30 días de tu ciclo* en ProFuncional. Cuentas con *5 días de gracia* (hasta el *{gracia}*) para renovar tu paquete sin perder tu ritmo ni tus cupos preferentes.\n\nPuedes abonar de forma cómoda:\n💳 En recepción con tarjeta de débito/crédito (POS Point).\n🌐 Online en nuestra plataforma con opción de cuotas.\n\n¡Sigamos con todo en tu recuperación y rendimiento!',
  },
  {
    id: 'tpl-loyalty-pr',
    category: 'loyalty',
    title: 'Fidelización & Felicitaciones por Racha / Avance Físico',
    badge: 'Fidelización',
    tone: 'Cálido & Deportivo',
    description: 'Motiva al alumno destacando su constancia o sus mejoras en los 10 ejercicios base.',
    template:
      '¡Crack {nombre}! 🚀🔥\n\nQueríamos enviarte este saludo especial de felicitaciones. El equipo de profesores y kinesiólogos vio tu tremenda constancia y tus resultados en el último test físico.\n\n¡El compromiso con tu salud y tu cuerpo se nota en cada repetición! Nos llena de orgullo que formes parte de la comunidad ProFuncional.\n\n¡A seguir rompiéndola en tu próxima sesión!',
  },
  {
    id: 'tpl-custom',
    category: 'custom',
    title: 'Mensaje Personalizado Libre',
    badge: 'Libre',
    tone: 'Cortés & Directo',
    description: 'Mensaje libre con apertura directa a WhatsApp para coordinaciones específicas.',
    template:
      'Hola {nombre}, te contactamos desde ProFuncional para coordinar sobre tus sesiones.',
  },
];

const WHATSAPP_LOGS_KEY = 'profuncional-whatsapp-logs-v1';
const WHATSAPP_EVENT = 'profuncional-whatsapp-changed';

export function getAllWhatsAppLogs(): WhatsAppLog[] {
  try {
    const raw = localStorage.getItem(WHATSAPP_LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveWhatsAppLog(log: Omit<WhatsAppLog, 'id' | 'sentAt'>): WhatsAppLog {
  const all = getAllWhatsAppLogs();
  const created: WhatsAppLog = {
    ...log,
    id: `walog-${Date.now().toString(36)}`,
    sentAt: new Date().toISOString(),
  };
  all.unshift(created);
  localStorage.setItem(WHATSAPP_LOGS_KEY, JSON.stringify(all.slice(0, 50)));
  window.dispatchEvent(new Event(WHATSAPP_EVENT));

  addActivity({
    name: log.memberName || 'Staff',
    action: `envió recordatorio WhatsApp "${log.templateTitle}" al +${log.phone}`,
  });
  return created;
}

export function subscribeToWhatsAppLogs(cb: () => void) {
  window.addEventListener(WHATSAPP_EVENT, cb);
  return () => window.removeEventListener(WHATSAPP_EVENT, cb);
}

export function formatWhatsAppMessage(
  templateStr: string,
  variables: {
    nombre?: string;
    servicio?: string;
    fecha?: string;
    hora?: string;
    profesional?: string;
    vencimiento?: string;
    gracia?: string;
  }
): string {
  let res = templateStr;
  res = res.replace(/{nombre}/g, variables.nombre || 'estimado alumno');
  res = res.replace(/{servicio}/g, variables.servicio || 'Entrenamiento Funcional');
  res = res.replace(/{fecha}/g, variables.fecha || today());
  res = res.replace(/{hora}/g, variables.hora || '10:00');
  res = res.replace(/{profesional}/g, variables.profesional || 'Equipo ProFuncional');
  res = res.replace(/{vencimiento}/g, variables.vencimiento || formatDate(today()));
  res = res.replace(/{gracia}/g, variables.gracia || formatDate(today()));
  return res;
}

export function openWhatsAppDirect(phone: string, message: string): void {
  const cleanPhone = phone.replace(/\D/g, '');
  const finalPhone = cleanPhone.startsWith('56')
    ? cleanPhone
    : cleanPhone.length === 9
    ? `56${cleanPhone}`
    : cleanPhone;

  const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

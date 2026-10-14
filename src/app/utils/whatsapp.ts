/**
 * Utilidad de enlace directo con WhatsApp para soporte de pacientes y recepción
 */

const DEFAULT_WHATSAPP_PHONE = '56912345678'; // Número de recepción de ProFuncional

export const getWhatsAppUrl = (memberName?: string, customMessage?: string): string => {
  const baseMsg = customMessage || 
    `Hola ProFuncional, soy ${memberName || 'paciente del centro'}. Me comunico desde la App Móvil para consultar sobre mis sesiones de kinesiología / entrenamiento.`;

  return `https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(baseMsg)}`;
};

export const openWhatsApp = (memberName?: string, customMessage?: string): void => {
  const url = getWhatsAppUrl(memberName, customMessage);
  window.open(url, '_blank', 'noopener,noreferrer');
};

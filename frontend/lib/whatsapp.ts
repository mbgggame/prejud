/**
 * WHATSAPP CONFIGURATION
 * Serviço de WhatsApp para notificações do PreJud
 * Suporta: Evolution API, Twilio, ou outras APIs via configuração
 */

// Configurações via variáveis de ambiente
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || '';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || '';
const WHATSAPP_INSTANCE = process.env.WHATSAPP_INSTANCE || 'prejud';
const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === 'true';

// Templates de mensagens WhatsApp
export const WHATSAPP_TEMPLATES = {
  AGREEMENT_INVITATION: 'agreement_invitation',
  DEADLINE_EXTENSION: 'deadline_extension',
  CHARGE_CREATED: 'charge_created',
  NOTICE_SENT: 'notice_sent',
  AGREEMENT_CONFIRMED: 'agreement_confirmed',
  AGREEMENT_REJECTED: 'agreement_rejected',
  REMINDER: 'reminder'
} as const;

/**
 * Verifica se o serviço de WhatsApp está configurado e habilitado
 */
export function isWhatsAppEnabled(): boolean {
  return WHATSAPP_ENABLED && !!WHATSAPP_API_URL && !!WHATSAPP_API_KEY;
}

/**
 * Formata número de telefone para padrão internacional
 * Remove caracteres não numéricos e adiciona +55 se necessário
 */
export function formatPhoneNumber(phone: string): string {
  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, '');
  
  // Se já começa com 55 e tem 13 dígitos, retorna como está com +
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return `+${cleaned}`;
  }
  
  // Se tem 11 dígitos (DDD + número), adiciona 55
  if (cleaned.length === 11) {
    return `+55${cleaned}`;
  }
  
  // Se tem 10 dígitos (DDD + número sem 9), adiciona 55 e 9
  if (cleaned.length === 10) {
    return `+55${cleaned.substring(0, 2)}9${cleaned.substring(2)}`;
  }
  
  // Retorna com + se não tiver
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/**
 * Envia mensagem de texto simples via WhatsApp
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!isWhatsAppEnabled()) {
    console.warn('WhatsApp não está configurado. Mensagem não enviada.');
    return { success: false, error: 'WhatsApp not configured' };
  }

  try {
    const formattedPhone = formatPhoneNumber(to);
    
    // Evolution API format (mais comum no Brasil)
    const response = await fetch(`${WHATSAPP_API_URL}/message/sendText/${WHATSAPP_INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': WHATSAPP_API_KEY
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
        options: {
          delay: 1200, // Delay para simular digitação
          presence: 'composing'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    console.log('WhatsApp enviado com sucesso para:', formattedPhone);
    
    return { 
      success: true, 
      messageId: data?.key?.id || data?.messageId 
    };
    
  } catch (error) {
    console.error('Falha ao enviar WhatsApp:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Envia convite de acordo para o cliente via WhatsApp
 */
export async function sendAgreementInvitationWhatsApp(
  to: string,
  clientName: string,
  freelancerName: string,
  agreementTitle: string,
  confirmationLink: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const message = `*PreJud - Convite de Acordo*

Olá, ${clientName}! 👋

${freelancerName} convidou você para formalizar um acordo profissional.

*Projeto:* ${agreementTitle}

Para revisar e confirmar o acordo, acesse:
${confirmationLink}

⚠️ Este link é único e válido apenas para você.

_PreJud - Formalizando relações profissionais_`;

  return sendWhatsAppMessage(to, message);
}

/**
 * Notifica sobre nova cobrança via WhatsApp
 */
export async function sendChargeNotificationWhatsApp(
  to: string,
  clientName: string,
  amount: number,
  dueDate: string,
  paymentLink: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedDate = new Date(dueDate).toLocaleDateString('pt-BR');
  
  const message = `*PreJud - Nova Cobrança*

Olá, ${clientName}!

Uma nova cobrança foi gerada para você:

*Valor:* R$ ${amount.toFixed(2)}
*Vencimento:* ${formattedDate}

Para visualizar e pagar:
${paymentLink}

_PreJud_`;

  return sendWhatsAppMessage(to, message);
}

/**
 * Notifica sobre solicitação de prorrogação via WhatsApp
 */
export async function sendExtensionRequestWhatsApp(
  to: string,
  freelancerName: string,
  currentDeadline: string,
  requestedDeadline: string,
  reviewLink: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedCurrent = new Date(currentDeadline).toLocaleDateString('pt-BR');
  const formattedRequested = new Date(requestedDeadline).toLocaleDateString('pt-BR');
  
  const message = `*PreJud - Solicitação de Prorrogação*

${freelancerName} solicitou uma prorrogação de prazo.

*Prazo atual:* ${formattedCurrent}
*Novo prazo solicitado:* ${formattedRequested}

Para aceitar ou recusar:
${reviewLink}

_PreJud_`;

  return sendWhatsAppMessage(to, message);
}

/**
 * Envia lembrete de pagamento via WhatsApp
 */
export async function sendPaymentReminderWhatsApp(
  to: string,
  clientName: string,
  agreementTitle: string,
  amount: number,
  dueDate: string,
  paymentLink: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedDate = new Date(dueDate).toLocaleDateString('pt-BR');
  
  const message = `*PreJud - Lembrete de Pagamento*

Olá, ${clientName}!

Este é um lembrete sobre o pagamento pendente:

*Projeto:* ${agreementTitle}
*Valor:* R$ ${amount.toFixed(2)}
*Vencimento:* ${formattedDate}

Para pagar agora:
${paymentLink}

Caso já tenha pago, desconsidere esta mensagem.

_PreJud_`;

  return sendWhatsAppMessage(to, message);
}

/**
 * Envia notificação genérica do sistema via WhatsApp
 */
export async function sendSystemNotificationWhatsApp(
  to: string,
  title: string,
  message: string,
  actionLink?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  let fullMessage = `*PreJud - ${title}*

${message}`;

  if (actionLink) {
    fullMessage += `\n\nAcesse: ${actionLink}`;
  }

  fullMessage += `\n\n_PreJud_`;

  return sendWhatsAppMessage(to, fullMessage);
}
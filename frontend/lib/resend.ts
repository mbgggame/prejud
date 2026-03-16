/**
 * RESEND CONFIGURATION
 * Serviço de email para notificações do PreJud
 */

import { Resend } from 'resend';

// Inicializa o cliente Resend com a API key
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email padrão de envio (deve ser verificado no Resend)
export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@prejud.app';

// Templates de email
export const EMAIL_TEMPLATES = {
  AGREEMENT_INVITATION: 'agreement-invitation',
  DEADLINE_EXTENSION: 'deadline-extension',
  CHARGE_CREATED: 'charge-created',
  NOTICE_SENT: 'notice-sent',
  AGREEMENT_CONFIRMED: 'agreement-confirmed',
  AGREEMENT_REJECTED: 'agreement-rejected'
} as const;

/**
 * Envia convite de acordo para o cliente
 */
export async function sendAgreementInvitation(
  to: string,
  clientName: string,
  freelancerName: string,
  agreementTitle: string,
  confirmationLink: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Convite: ${agreementTitle} - PreJud`,
      html: `
        <h1>Olá, ${clientName}!</h1>
        <p>${freelancerName} convidou você para formalizar um acordo profissional.</p>
        <p><strong>Projeto:</strong> ${agreementTitle}</p>
        <p>Clique no link abaixo para revisar e confirmar o acordo:</p>
        <a href="${confirmationLink}" style="padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Revisar Acordo
        </a>
        <p style="margin-top: 24px; font-size: 12px; color: #666;">
          Este é um email automático do PreJud. Não responda este email.
        </p>
      `
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Falha no envio de email:', error);
    throw error;
  }
}

/**
 * Notifica sobre nova cobrança
 */
export async function sendChargeNotification(
  to: string,
  clientName: string,
  amount: number,
  dueDate: string,
  paymentLink: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Nova Cobrança - PreJud',
      html: `
        <h1>Olá, ${clientName}!</h1>
        <p>Uma nova cobrança foi gerada para você.</p>
        <p><strong>Valor:</strong> R$ ${amount.toFixed(2)}</p>
        <p><strong>Vencimento:</strong> ${new Date(dueDate).toLocaleDateString('pt-BR')}</p>
        <a href="${paymentLink}" style="padding: 12px 24px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px;">
          Ver Cobrança
        </a>
      `
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Falha ao enviar notificação de cobrança:', error);
    throw error;
  }
}

/**
 * Notifica sobre solicitação de prorrogação
 */
export async function sendExtensionRequestNotification(
  to: string,
  freelancerName: string,
  currentDeadline: string,
  requestedDeadline: string,
  reviewLink: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Solicitação de Prorrogação de Prazo - PreJud',
      html: `
        <h1>Solicitação de Prorrogação</h1>
        <p>${freelancerName} solicitou uma prorrogação de prazo.</p>
        <p><strong>Prazo atual:</strong> ${new Date(currentDeadline).toLocaleDateString('pt-BR')}</p>
        <p><strong>Novo prazo solicitado:</strong> ${new Date(requestedDeadline).toLocaleDateString('pt-BR')}</p>
        <a href="${reviewLink}" style="padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px;">
          Revisar Solicitação
        </a>
      `
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Falha ao enviar notificação de prorrogação:', error);
    throw error;
  }
}

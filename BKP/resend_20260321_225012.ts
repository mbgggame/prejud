/**
 * RESEND CONFIGURATION
 * Serviço de email para notificações do PreJud
 */

import { Resend } from 'resend';

// Inicializa o cliente Resend com a API key
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email padrão de envio (mantido como está no ambiente)
export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@prejud.app';

// Templates de email
export const EMAIL_TEMPLATES = {
  AGREEMENT_INVITATION: 'agreement-invitation',
  DEADLINE_EXTENSION: 'deadline-extension',
  CHARGE_CREATED: 'charge-created',
  NOTICE_SENT: 'notice-sent',
  AGREEMENT_CONFIRMED: 'agreement-confirmed',
  AGREEMENT_REJECTED: 'agreement-rejected',
  AGREEMENT_REVISION_REQUESTED: 'agreement-revision-requested',
  AGREEMENT_CLOSED: 'agreement-closed'
} as const;

function emailLayout(title: string, content: string) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background: #f8fafc; padding: 32px; color: #0f172a;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
        <div style="padding: 24px 28px; border-bottom: 1px solid #e2e8f0; background: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; line-height: 1.3; color: #0f172a;">${title}</h1>
          <p style="margin: 8px 0 0; font-size: 13px; color: #64748b;">PreJud • Registro e formalização de acordos</p>
        </div>

        <div style="padding: 28px;">
          ${content}
        </div>

        <div style="padding: 20px 28px; border-top: 1px solid #e2e8f0; background: #f8fafc;">
          <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #64748b;">
            Este é um e-mail automático do PreJud.<br />
            Para sua segurança, preserve este registro.
          </p>
        </div>
      </div>
    </div>
  `;
}

function actionButton(label: string, href: string, background = '#2563eb') {
  return `
    <div style="margin: 24px 0;">
      <a href="${href}" style="display: inline-block; padding: 12px 22px; background: ${background}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
        ${label}
      </a>
    </div>
  `;
}

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
    const html = emailLayout(
      'Convite para formalização de acordo',
      `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">Olá, ${clientName}!</p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          ${freelancerName} convidou você para revisar e formalizar um acordo profissional na plataforma PreJud.
        </p>

        <p style="margin: 0 0 10px; font-size: 15px; line-height: 1.7;">
          <strong>Acordo:</strong> ${agreementTitle}
        </p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          Acesse o link abaixo para analisar os termos e escolher entre aceitar, contestar ou solicitar revisão.
        </p>

        ${actionButton('Revisar acordo', confirmationLink)}

        <p style="margin: 18px 0 0; font-size: 13px; line-height: 1.7; color: #64748b;">
          Caso o botão não funcione, copie e cole este link no navegador:<br />
          <span style="word-break: break-all;">${confirmationLink}</span>
        </p>
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Convite para acordo: ${agreementTitle} - PreJud`,
      html
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
 * Notifica freelancer que o acordo foi confirmado pelo cliente
 */
export async function sendAgreementConfirmed(
  to: string,
  freelancerName: string,
  clientName: string,
  agreementTitle: string,
  agreementLink: string
) {
  try {
    const html = emailLayout(
      'Acordo confirmado pelo cliente',
      `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">Olá, ${freelancerName}!</p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          O cliente <strong>${clientName}</strong> confirmou o acordo abaixo:
        </p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          <strong>Acordo:</strong> ${agreementTitle}
        </p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          O registro foi atualizado com sucesso na timeline do PreJud.
        </p>

        ${actionButton('Abrir acordo', agreementLink, '#16a34a')}
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Acordo confirmado: ${agreementTitle} - PreJud`,
      html
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Falha ao enviar email de confirmação do acordo:', error);
    throw error;
  }
}

/**
 * Notifica freelancer que o cliente solicitou revisão
 */
export async function sendAgreementRevisionRequested(
  to: string,
  freelancerName: string,
  clientName: string,
  agreementTitle: string,
  revisionMessage: string,
  agreementLink: string
) {
  try {
    const html = emailLayout(
      'Solicitação de revisão no acordo',
      `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">Olá, ${freelancerName}!</p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          O cliente <strong>${clientName}</strong> solicitou uma revisão no acordo abaixo:
        </p>

        <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.7;">
          <strong>Acordo:</strong> ${agreementTitle}
        </p>

        <div style="margin: 18px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;"><strong>Mensagem do cliente:</strong></p>
          <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #0f172a;">${revisionMessage}</p>
        </div>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          Revise o conteúdo e escolha entre reenviar uma nova versão ou encerrar o convite.
        </p>

        ${actionButton('Abrir acordo', agreementLink, '#2563eb')}
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Revisão solicitada: ${agreementTitle} - PreJud`,
      html
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Falha ao enviar email de solicitação de revisão:', error);
    throw error;
  }
}

/**
 * Notifica freelancer que o cliente contestou/recusou o acordo
 */
export async function sendAgreementRejected(
  to: string,
  freelancerName: string,
  clientName: string,
  agreementTitle: string,
  agreementLink: string
) {
  try {
    const html = emailLayout(
      'Acordo não aprovado pelo cliente',
      `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">Olá, ${freelancerName}!</p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          O cliente <strong>${clientName}</strong> não aprovou o acordo abaixo:
        </p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          <strong>Acordo:</strong> ${agreementTitle}
        </p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          Você pode revisar os termos, ajustar sua proposta ou iniciar um novo convite.
        </p>

        ${actionButton('Abrir acordo', agreementLink, '#ea580c')}
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Acordo não aprovado: ${agreementTitle} - PreJud`,
      html
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Falha ao enviar email de rejeição do acordo:', error);
    throw error;
  }
}

/**
 * Notifica cliente que o convite foi encerrado pelo freelancer
 */
export async function sendAgreementClosed(
  to: string,
  clientName: string,
  agreementTitle: string
) {
  try {
    const html = emailLayout(
      'Convite encerrado',
      `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">Olá, ${clientName}!</p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          O convite referente ao acordo abaixo foi encerrado pelo profissional responsável:
        </p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          <strong>Acordo:</strong> ${agreementTitle}
        </p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          Caso ainda deseje seguir com a negociação, você pode responder este e-mail solicitando a abertura de um novo convite.
        </p>
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Convite encerrado: ${agreementTitle} - PreJud`,
      html
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Falha ao enviar email de encerramento do acordo:', error);
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
    const html = emailLayout(
      'Nova cobrança registrada',
      `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">Olá, ${clientName}!</p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          Uma nova cobrança foi registrada no PreJud.
        </p>

        <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.7;">
          <strong>Valor:</strong> R$ ${amount.toFixed(2)}
        </p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          <strong>Vencimento:</strong> ${new Date(dueDate).toLocaleDateString('pt-BR')}
        </p>

        ${actionButton('Ver cobrança', paymentLink, '#16a34a')}
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Nova cobrança - PreJud',
      html
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
    const html = emailLayout(
      'Solicitação de prorrogação de prazo',
      `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          ${freelancerName} solicitou uma prorrogação de prazo.
        </p>

        <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.7;">
          <strong>Prazo atual:</strong> ${new Date(currentDeadline).toLocaleDateString('pt-BR')}
        </p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          <strong>Novo prazo solicitado:</strong> ${new Date(requestedDeadline).toLocaleDateString('pt-BR')}
        </p>

        ${actionButton('Revisar solicitação', reviewLink, '#f59e0b')}
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Solicitação de prorrogação de prazo - PreJud',
      html
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Falha ao enviar notificação de prorrogação:', error);
    throw error;
  }
}
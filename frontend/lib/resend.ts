/**
 * RESEND CONFIGURATION
 * Serviço de email para notificações do PreJud
 * ATUALIZADO: Limite de 1 revisão - 22/03/2026
 */

import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
export const FROM_EMAIL = process.env.FROM_EMAIL || 'notificado@prejud.com';

export const EMAIL_TEMPLATES = {
  AGREEMENT_INVITATION: 'agreement-invitation',
  AGREEMENT_CONFIRMED: 'agreement-confirmed',
  AGREEMENT_REJECTED: 'agreement-rejected',
  AGREEMENT_REVISION_REQUESTED: 'agreement-revision-requested',
  AGREEMENT_FINAL_VERSION: 'agreement-final-version',  // ⭐ NOVO
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
        <div style="padding: 28px;">${content}</div>
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
      <a href="${href}" style="display: inline-block; padding: 12px 22px; background: ${background}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">${label}</a>
    </div>
  `;
}

function disabledButton(label: string) {
  return `
    <div style="margin: 24px 0;">
      <button disabled style="display: inline-block; padding: 12px 22px; background: #9ca3af; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; cursor: not-allowed; opacity: 0.6;">${label}</button>
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

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Falha ao enviar email de convite:', error);
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
    console.error('Falha ao enviar email de confirmação:', error);
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
  agreementId: string,
  protocol: string,
  hash: string,
  agreementLink?: string
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://prejud.app';
    const revisionUrl = agreementLink || 
      `${baseUrl}/dashboard/formalizar-acordo?agreementId=${agreementId}&mode=revision&originalAgreementId=${agreementId}&originalProtocol=${protocol}&originalHash=${hash}`;

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
        <div style="margin: 18px 0; padding: 16px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px;">
          <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">
            ⚠️ ATENÇÃO: Esta é a única revisão permitida. Após reenviar, o cliente não poderá solicitar mais ajustes.
          </p>
        </div>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          Revise o conteúdo e reenvie o acordo ajustado.
        </p>
        ${actionButton('Responder no PreJud', revisionUrl, '#2563eb')}
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
 * ⭐ NOVO: Envia versão final do acordo ao cliente (após revisão)
 * Botão de solicitar ajuste está DESATIVADO
 */
export async function sendAgreementFinalVersion(
  to: string,
  clientName: string,
  freelancerName: string,
  agreementTitle: string,
  agreementLink: string
) {
  try {
    const html = emailLayout(
      '📋 Versão Final do Acordo - Ação Necessária',
      `
        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">
            ⚠️ ESTA É A VERSÃO FINAL DO ACORDO
          </p>
        </div>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">Olá, ${clientName}!</p>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          O freelancer <strong>${freelancerName}</strong> ajustou o acordo conforme sua solicitação:
        </p>

        <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.7;">
          <strong>Acordo:</strong> ${agreementTitle}
        </p>

        <div style="margin: 18px 0; padding: 16px; background: #fee2e2; border: 2px solid #ef4444; border-radius: 10px;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #991b1b; font-weight: 600;">
            🚫 LIMITE DE REVISÕES ATINGIDO
          </p>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #7f1d1d;">
            Você já utilizou seu direito a <strong>1 revisão</strong>. Solicitações de ajuste não serão mais aceitas.
          </p>
        </div>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
          Você tem duas opções:
        </p>

        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 20px 0;">
          ${actionButton('✅ Aceitar Acordo', agreementLink, '#16a34a')}
        </div>

        <div style="margin: 20px 0; padding: 16px; background: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
            <strong>Opção de recusa:</strong>
          </p>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151;">
            Caso não aceite os termos, você pode recusar o acordo. Acesse o link acima e selecione "Recusar".
          </p>
        </div>

        <div style="margin: 24px 0; padding: 20px; background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 8px;">
          <p style="margin: 0 0 12px; font-size: 13px; color: #9ca3af; font-weight: 600;">
            SOLICITAR AJUSTE - INDISPONÍVEL
          </p>
          ${disabledButton('❌ Solicitar Ajuste (Limite Atingido)')}
          <p style="margin: 12px 0 0; font-size: 12px; color: #ef4444;">
            Você já utilizou seu limite de 1 revisão neste acordo.
          </p>
        </div>

        <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.7; color: #64748b;">
          <strong>Próximos passos:</strong> Após aceitar, o acordo será formalizado e ambas as partes receberão a confirmação.
        </p>
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `📋 VERSÃO FINAL: ${agreementTitle} - PreJud`,
      html
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Falha ao enviar email de versão final:', error);
    throw error;
  }
}

/**
 * Notifica freelancer que o cliente recusou o acordo
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
        ${actionButton('Responder no PreJud', agreementLink, '#ea580c')}
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
    console.error('Falha ao enviar email de rejeição:', error);
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
    console.error('Falha ao enviar email de encerramento:', error);
    throw error;
  }
}

// ==========================================
// WRAPPER UNIFICADO
// ==========================================

interface SendAgreementResponseEmailParams {
  type: 'confirmed' | 'rejected' | 'revision_requested' | 'final_version' | 'closed';
  freelancerEmail?: string;
  freelancerName?: string;
  clientEmail?: string;
  clientName?: string;
  agreementTitle?: string;
  agreementLink?: string;
  revisionMessage?: string;
  agreementId?: string;
  protocol?: string;
  hash?: string;
}

export async function sendAgreementResponseEmail({
  type,
  freelancerEmail,
  freelancerName,
  clientEmail,
  clientName,
  agreementTitle,
  agreementLink,
  revisionMessage,
  agreementId,
  protocol,
  hash
}: SendAgreementResponseEmailParams) {
  switch (type) {
    case 'confirmed':
      return await sendAgreementConfirmed(
        freelancerEmail!, freelancerName!, clientName!, agreementTitle!, agreementLink!
      );
    case 'rejected':
      return await sendAgreementRejected(
        freelancerEmail!, freelancerName!, clientName!, agreementTitle!, agreementLink!
      );
    case 'revision_requested':
      return await sendAgreementRevisionRequested(
        freelancerEmail!, freelancerName!, clientName!, agreementTitle!, revisionMessage!,
        agreementId!, protocol!, hash!, agreementLink
      );
    case 'final_version':
      return await sendAgreementFinalVersion(
        clientEmail!, clientName!, freelancerName!, agreementTitle!, agreementLink!
      );
    case 'closed':
      return await sendAgreementClosed(clientEmail!, clientName!, agreementTitle!);
    default:
      throw new Error(`Tipo de email desconhecido: ${type}`);
  }
}
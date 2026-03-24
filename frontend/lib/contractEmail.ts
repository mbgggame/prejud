// Servico de envio de contrato por e-mail
// Separado do resend.ts para evitar problemas de encoding

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContractEmail(
  to: string,
  clientName: string,
  freelancerName: string,
  agreementTitle: string,
  contractLink: string,
  protocol: string,
  hash: string,
  timeline: Array<{type: string; date: string; message?: string}>
) {
  try {
    const timelineHtml = timeline.map(event => 
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          ${event.date}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">
          <strong>${event.type}</strong><br/>
          ${event.message || ''}
        </td>
      </tr>`
    ).join('');

    const { data, error } = await resend.emails.send({
      from: 'PreJud Test <onboarding@resend.dev>',
      to: [to],
      subject: `Contrato de Prestacao de Servicos - ${agreementTitle}`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Contrato de Prestacao de Servicos</h1>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Ola <strong>${clientName}</strong>,</p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">O contrato referente ao acordo <strong>"${agreementTitle}"</strong> com <strong>${freelancerName}</strong> foi gerado.</p>
            <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #1e40af; font-weight: 600;">Protocolo do Acordo</p>
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #1e3a8a; font-family: monospace;">${protocol}</p>
            </div>
            <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #065f46; font-weight: 600;">Hash SHA-256 de Integridade</p>
              <p style="margin: 0; font-size: 11px; color: #047857; font-family: monospace; word-break: break-all;">${hash}</p>
            </div>
            <div style="margin: 24px 0;">
              <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px;">Historico do Acordo</h3>
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                <thead><tr style="background: #f3f4f6;"><th style="padding: 8px; text-align: left; font-size: 12px; color: #6b7280;">Data</th><th style="padding: 8px; text-align: left; font-size: 12px; color: #6b7280;">Evento</th></tr></thead>
                <tbody>${timelineHtml}</tbody>
              </table>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${contractLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Visualizar Contrato Completo</a>
            </div>
          </div>
        </div>`,
    });

    if (error) {
      console.error('Erro ao enviar contrato:', error);
      throw new Error('Falha ao enviar e-mail do contrato');
    }

    return { success: true, data };
  } catch (err) {
    console.error('Erro em sendContractEmail:', err);
    throw err;
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientEmail,
      clientName,
      freelancerName,
      agreementTitle,
      confirmationLink,
    } = body;

    // Validações
    if (!clientEmail || !clientEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Email do cliente é obrigatório.' },
        { status: 400 }
      );
    }

    if (!confirmationLink) {
      return NextResponse.json(
        { success: false, error: 'Link de confirmação é obrigatório.' },
        { status: 400 }
      );
    }

    const freelancerDisplayName = freelancerName || 'Um freelancer';
    const clientDisplayName = clientName || 'Cliente';

    // Enviar email via Resend
    const { data, error } = await resend.emails.send({
      from: 'PreJud <notificado@prejud.com>',
      to: clientEmail,
      subject: `${freelancerDisplayName} enviou um acordo para você formalizar`,
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Acordo - PreJud</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #5568d3; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
    .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Novo Acordo para Formalização</h1>
  </div>

  <div class="content">
    <p>Olá, <strong>${clientDisplayName}</strong>!</p>

    <p><strong>${freelancerDisplayName}</strong> enviou um acordo de prestação de serviços para você revisar e formalizar através da <strong>PreJud</strong>.</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">${agreementTitle || 'Acordo de Prestação de Serviços'}</h3>
      <p style="margin-bottom: 0; color: #6b7280;">Clique no botão abaixo para revisar todos os detalhes, termos e condições.</p>
    </div>

    <center>
      <a href="${confirmationLink}" class="button">📎 Revisar e Formalizar Acordo</a>
    </center>

    <p style="font-size: 14px; color: #6b7280;">Ou copie e cole este link no seu navegador:</p>
    <p style="font-size: 12px; word-break: break-all; color: #9ca3af;">${confirmationLink}</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 14px; color: #6b7280;">
      <strong>🔒 Segurança:</strong> Este link é exclusivo para você e contém um token de acesso. 
      Não compartilhe com terceiros.
    </p>

    <p style="font-size: 14px; color: #6b7280;">
      <strong>⏰ Validade:</strong> O link permanece ativo até que você responda ou o freelancer encerre o acordo.
    </p>
  </div>

  <div class="footer">
    <p>© 2024 PreJud - Formalização de Acordos entre Freelancers e Clientes</p>
    <p>Este é um email automático. Não responda diretamente.</p>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Erro ao enviar email de convite:', error);
      return NextResponse.json(
        { success: false, error: 'Falha ao enviar email de convite.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Email de convite enviado com sucesso.',
    });

  } catch (error) {
    console.error('Erro na API de envio de convite:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno ao enviar convite.',
      },
      { status: 500 }
    );
  }
}
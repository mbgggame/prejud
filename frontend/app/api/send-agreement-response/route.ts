import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type ResponseType = 'confirmed' | 'rejected' | 'revision_requested' | 'final_version' | 'closed';

interface EmailPayload {
  type: ResponseType;
  freelancerEmail?: string;
  freelancerName?: string;
  clientEmail?: string;
  clientName?: string;
  agreementTitle?: string;
  agreementLink?: string;
  revisionMessage?: string;
  agreementId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailPayload = await request.json();
    const {
      type,
      freelancerEmail,
      freelancerName,
      clientEmail,
      clientName,
      agreementTitle,
      agreementLink,
      revisionMessage,
      agreementId,
    } = body;

    // Validações baseadas no tipo
    if (type === 'confirmed' || type === 'rejected' || type === 'revision_requested') {
      if (!freelancerEmail || !freelancerEmail.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Email do freelancer é obrigatório.' },
          { status: 400 }
        );
      }
    }

    if (type === 'final_version') {
      if (!clientEmail || !clientEmail.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Email do cliente é obrigatório.' },
          { status: 400 }
        );
      }
    }

    let emailConfig: { to: string; subject: string; html: string } | null = null;

    const freelancerDisplay = freelancerName || 'Freelancer';
    const clientDisplay = clientName || 'Cliente';
    const title = agreementTitle || 'Acordo de Prestação de Serviços';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    switch (type) {
      case 'confirmed':
        emailConfig = {
          to: freelancerEmail!,
          subject: `✅ ${clientDisplay} aceitou seu acordo!`,
          html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acordo Aceito - PreJud</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
    .success-box { background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Acordo Formalizado!</h1>
  </div>

  <div class="content">
    <p>Olá, <strong>${freelancerDisplay}</strong>!</p>

    <div class="success-box">
      <h3 style="margin-top: 0; color: #059669;">✅ Cliente Aceitou o Acordo</h3>
      <p style="margin-bottom: 0;"><strong>${clientDisplay}</strong> aceitou o acordo <strong>"${title}"</strong> e ele está agora formalizado!</p>
    </div>

    <p>O acordo foi confirmado com sucesso e ambas as partes podem prosseguir com a execução do serviço.</p>

    <center>
      <a href="${agreementLink || baseUrl + '/dashboard'}" class="button">📋 Ver Acordo no Dashboard</a>
    </center>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      <strong>Próximos passos:</strong>
    </p>
    <ul style="font-size: 14px; color: #6b7280;">
      <li>Entre em contato com o cliente para alinhar detalhes de início</li>
      <li>Mantenha o registro de todas as interações na plataforma</li>
      <li>Utilize o sistema de cobranças quando necessário</li>
    </ul>
  </div>

  <div class="footer">
    <p>© 2024 PreJud - Formalização de Acordos</p>
  </div>
</body>
</html>
          `,
        };
        break;

      case 'rejected':
        emailConfig = {
          to: freelancerEmail!,
          subject: `❌ ${clientDisplay} recusou seu acordo`,
          html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acordo Recusado - PreJud</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
    .alert-box { background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚠️ Acordo Recusado</h1>
  </div>

  <div class="content">
    <p>Olá, <strong>${freelancerDisplay}</strong>!</p>

    <div class="alert-box">
      <h3 style="margin-top: 0; color: #dc2626;">❌ Cliente Recusou o Acordo</h3>
      <p style="margin-bottom: 0;"><strong>${clientDisplay}</strong> recusou o acordo <strong>"${title}"</strong>.</p>
    </div>

    <p>O acordo foi marcado como <strong>contestado</strong>. Você pode:</p>
    <ul>
      <li>Entrar em contato com o cliente para entender os motivos</li>
      <li>Criar um novo acordo com ajustes se houver interesse</li>
      <li>Encerrar este acordo se não houver possibilidade de acordo</li>
    </ul>

    <center>
      <a href="${agreementLink || baseUrl + '/dashboard'}" class="button">📋 Ver no Dashboard</a>
    </center>
  </div>

  <div class="footer">
    <p>© 2024 PreJud - Formalização de Acordos</p>
  </div>
</body>
</html>
          `,
        };
        break;

      case 'revision_requested':
        // ⭐ NOVO: Links diretos para o dashboard do freelancer (sem token)
        const dashboardReviewLink = `${baseUrl}/dashboard/revisar-acordo?agreementId=${agreementId}`;
        
        emailConfig = {
          to: freelancerEmail!,
          subject: `📝 ${clientDisplay} solicitou revisão no acordo`,
          html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Revisão Solicitada - PreJud</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
    .revision-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .message-box { background: white; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
    .btn { display: inline-block; color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
    .btn-adjust { background: #f59e0b; }
    .btn-reject { background: #dc2626; }
    .btn-secondary { background: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📝 Revisão Solicitada</h1>
  </div>

  <div class="content">
    <p>Olá, <strong>${freelancerDisplay}</strong>!</p>

    <div class="revision-box">
      <h3 style="margin-top: 0; color: #d97706;">⚠️ Cliente Solicitou Ajustes</h3>
      <p style="margin-bottom: 0;"><strong>${clientDisplay}</strong> solicitou revisão no acordo <strong>"${title}"</strong>.</p>
    </div>

    ${revisionMessage ? `
    <div class="message-box">
      <p style="margin: 0; font-weight: 600; color: #92400e;">Mensagem do cliente:</p>
      <p style="margin: 10px 0 0 0; color: #78350f; font-style: italic;">"${revisionMessage}"</p>
    </div>
    ` : ''}

    <p><strong>O que você deseja fazer?</strong></p>

    <ol>
      <li><strong>Aceitar e ajustar</strong> → editar o acordo e reenviar</li>
      <li><strong>Negar e encerrar</strong> → finalizar o acordo imediatamente</li>
    </ol>

    <center>
      <a href="${dashboardReviewLink}&action=adjust" class="btn btn-adjust">✏️ Aceitar e Ajustar</a>
      <a href="${dashboardReviewLink}&action=reject" class="btn btn-reject">⛔ Negar e Encerrar</a>
    </center>

    <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
      💡 <strong>Dica:</strong> O cliente tem direito a até 3 revisões.
    </p>
  </div>

  <div class="footer">
    <p>© 2024 PreJud - Formalização de Acordos</p>
  </div>
</body>
</html>
    `,
        };
        break;

      case 'final_version':
        emailConfig = {
          to: clientEmail!,
          subject: `📋 ${freelancerDisplay} reenviou o acordo com ajustes`,
          html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acordo Atualizado - PreJud</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
    .update-box { background: #e0e7ff; border: 1px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button-success { background: #10b981; }
    .button-reject { background: #ef4444; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Acordo Atualizado</h1>
  </div>

  <div class="content">
    <p>Olá, <strong>${clientDisplay}</strong>!</p>

    <div class="update-box">
      <h3 style="margin-top: 0; color: #5b21b6;">✏️ Ajustes Realizados</h3>
      <p style="margin-bottom: 0;"><strong>${freelancerDisplay}</strong> ajustou o acordo <strong>"${title}"</strong> conforme sua solicitação de revisão.</p>
    </div>

    <p><strong>O que você pode fazer agora:</strong></p>
    <ul>
      <li>✅ <strong>Aceitar o acordo</strong> - Formaliza o acordo e inicia o projeto</li>
      <li>❌ <strong>Recusar</strong> - Marca o acordo como contestado</li>
      <li>📝 <strong>Solicitar nova revisão</strong> - Se ainda tiver direito (máx. 3 revisões)</li>
    </ul>

    <center>
      <a href="${agreementLink}" class="button">📎 Revisar Acordo Atualizado</a>
    </center>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      <strong>⏰ Importante:</strong> Este é uma nova versão do acordo. As revisões utilizadas: verifique no link acima.
    </p>
  </div>

  <div class="footer">
    <p>© 2024 PreJud - Formalização de Acordos</p>
  </div>
</body>
</html>
          `,
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de resposta inválido.' },
          { status: 400 }
        );
    }

    if (!emailConfig) {
      return NextResponse.json(
        { success: false, error: 'Configuração de email não gerada.' },
        { status: 500 }
      );
    }

    // Enviar email via Resend
    const { data, error } = await resend.emails.send({
      from: 'PreJud <notificado@prejud.com>',
      to: emailConfig.to,
      subject: emailConfig.subject,
      html: emailConfig.html,
    });

    if (error) {
      console.error('Erro ao enviar email de resposta:', error);
      return NextResponse.json(
        { success: false, error: 'Falha ao enviar email de notificação.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      type,
      message: 'Email de notificação enviado com sucesso.',
    });

  } catch (error) {
    console.error('Erro na API de envio de resposta:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno ao enviar notificação.',
      },
      { status: 500 }
    );
  }
}
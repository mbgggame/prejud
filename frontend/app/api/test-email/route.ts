import { NextRequest, NextResponse } from 'next/server';
import { sendAgreementInvitation } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    let body: any = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const clientEmail =
      typeof body.clientEmail === 'string' && body.clientEmail.trim()
        ? body.clientEmail.trim()
        : 'fabio.laperriere@gmail.com';

    const clientName =
      typeof body.clientName === 'string' && body.clientName.trim()
        ? body.clientName.trim()
        : 'Cliente Teste';

    const freelancerName =
      typeof body.freelancerName === 'string' && body.freelancerName.trim()
        ? body.freelancerName.trim()
        : 'Freelancer Teste';

    const agreementTitle =
      typeof body.agreementTitle === 'string' && body.agreementTitle.trim()
        ? body.agreementTitle.trim()
        : 'Projeto Teste';

    const confirmationLink =
      typeof body.confirmationLink === 'string' && body.confirmationLink.trim()
        ? body.confirmationLink.trim()
        : 'http://localhost:3000/teste';

    const result = await sendAgreementInvitation(
      clientEmail,
      clientName,
      freelancerName,
      agreementTitle,
      confirmationLink
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno ao enviar email.',
      },
      { status: 500 }
    );
  }
}
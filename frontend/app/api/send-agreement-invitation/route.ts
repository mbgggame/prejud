import { NextRequest, NextResponse } from 'next/server';
import { sendAgreementInvitation } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientEmail,
      clientName,
      freelancerName,
      agreementTitle,
      confirmationLink
    } = body;

    if (!clientEmail || !clientName || !freelancerName || !agreementTitle || !confirmationLink) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendAgreementInvitation(
      clientEmail,
      clientName,
      freelancerName,
      agreementTitle,
      confirmationLink
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao enviar email de convite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

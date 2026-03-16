import { NextResponse } from 'next/server';
import { sendAgreementInvitation } from '@/lib/resend';

export async function POST() {
  try {
    const result = await sendAgreementInvitation(
      'fabio.laperriere@gmail.com',
      'Cliente Teste',
      'Freelancer Teste',
      'Projeto Teste',
      'http://localhost:3000/teste'
    );
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

// API Route para envio de contrato
// Roda no servidor - tem acesso as variaveis de ambiente

import { NextResponse } from 'next/server';
import { sendContractEmail } from '@/lib/contractEmail';
import { getAgreementById, getAgreementEvents } from '@/services/firebaseAgreementService';
import { generateHash } from '@/lib/crypto/hash';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agreementId, clientEmail } = body;

    if (!agreementId) {
      return NextResponse.json(
        { success: false, error: 'ID do acordo nao informado' },
        { status: 400 }
      );
    }

    const agreement = await getAgreementById(agreementId);
    if (!agreement) {
      return NextResponse.json(
        { success: false, error: 'Acordo nao encontrado' },
        { status: 404 }
      );
    }

    const events = await getAgreementEvents(agreementId);
    const timeline = (events || []).map(event => ({
      type: event.type,
      date: new Date((event as any).createdAt || (event as any).timestamp).toLocaleDateString('pt-BR'),
      message: event.metadata?.message || event.metadata?.description || ''
    }));

    const contractText = (agreement as any).contractText || '';
    const hash = contractText ? await generateHash(contractText) : 'Hash nao disponivel';

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = baseUrl + '/contrato?id=' + agreementId;
    const protocol = (agreement as any).protocol || 'N/A';

    await sendContractEmail(
      clientEmail || agreement.clientEmail,
      agreement.clientName,
      agreement.freelancerName,
      agreement.title,
      link,
      protocol,
      hash,
      timeline
    );

    return NextResponse.json({
      success: true,
      message: 'Contrato enviado com sucesso',
      link,
      hash,
      protocol
    });

  } catch (error: any) {
    console.error('Erro ao enviar contrato:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno' },
      { status: 500 }
    );
  }
}

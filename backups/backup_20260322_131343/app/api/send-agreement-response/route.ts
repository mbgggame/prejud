import { NextRequest, NextResponse } from 'next/server';
import {
  sendAgreementConfirmed,
  sendAgreementRejected,
  sendAgreementRevisionRequested,
  sendAgreementClosed
} from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      type,
      freelancerEmail,
      freelancerName,
      clientEmail,
      clientName,
      agreementTitle,
      agreementLink,
      revisionMessage,
      // NOVOS CAMPOS para revisão
      agreementId,
      protocol,
      hash
    } = body;

    if (!type || !agreementTitle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let result: unknown;

    if (type === 'confirmed') {
      if (!freelancerEmail || !freelancerName || !clientName || !agreementLink) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields for confirmed email' },
          { status: 400 }
        );
      }

      result = await sendAgreementConfirmed(
        freelancerEmail,
        freelancerName,
        clientName,
        agreementTitle,
        agreementLink
      );
    } else if (type === 'rejected') {
      if (!freelancerEmail || !freelancerName || !clientName || !agreementLink) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields for rejected email' },
          { status: 400 }
        );
      }

      result = await sendAgreementRejected(
        freelancerEmail,
        freelancerName,
        clientName,
        agreementTitle,
        agreementLink
      );
    } else if (type === 'revision_requested') {
      // AJUSTADO: Agora requer agreementId, protocol, hash para montar URL correta
      if (
        !freelancerEmail ||
        !freelancerName ||
        !clientName ||
        !revisionMessage ||
        !agreementId ||
        !protocol ||
        !hash
      ) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields for revision email. Required: agreementId, protocol, hash' },
          { status: 400 }
        );
      }

      result = await sendAgreementRevisionRequested(
        freelancerEmail,
        freelancerName,
        clientName,
        agreementTitle,
        revisionMessage,
        agreementId,    // NOVO: ID do acordo
        protocol,       // NOVO: Protocolo
        hash,           // NOVO: Hash de acesso
        agreementLink   // fallback (opcional)
      );
    } else if (type === 'closed') {
      if (!clientEmail || !clientName) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields for closed email' },
          { status: 400 }
        );
      }

      result = await sendAgreementClosed(
        clientEmail,
        clientName,
        agreementTitle
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid email type' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao enviar email de resposta do acordo RAW:', error);
    console.error(
      'Erro serializado:',
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    );

    return NextResponse.json(
      { success: false, error: 'Failed to send agreement response email' },
      { status: 500 }
    );
  }
}
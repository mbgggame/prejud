import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTIONS = {
  AGREEMENTS: 'agreements',
  AGREEMENT_EVENTS: 'agreement_events',
} as const;

type PublicAction = 'accept' | 'reject' | 'request_revision';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const agreementId = String(body?.agreementId || '').trim();
    const protocol = String(body?.protocol || '').trim();
    const token = String(body?.token || '').trim();
    const action = String(body?.action || '').trim() as PublicAction;
    const message = String(body?.message || '').trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token obrigatório.' },
        { status: 400 }
      );
    }

    if (!['accept', 'reject', 'request_revision'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Ação inválida.' },
        { status: 400 }
      );
    }

    let agreementSnap;

    if (agreementId) {
      agreementSnap = await getDoc(doc(db, COLLECTIONS.AGREEMENTS, agreementId));
    } else if (protocol) {
      const q = query(
        collection(db, COLLECTIONS.AGREEMENTS),
        where('protocol', '==', protocol)
      );
      const qs = await getDocs(q);

      if (qs.empty) {
        return NextResponse.json(
          { success: false, error: 'Acordo não encontrado.' },
          { status: 404 }
        );
      }

      agreementSnap = qs.docs[0];
    } else {
      return NextResponse.json(
        { success: false, error: 'agreementId ou protocol obrigatório.' },
        { status: 400 }
      );
    }

    if (!agreementSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Acordo não encontrado.' },
        { status: 404 }
      );
    }

    const agreementData = agreementSnap.data() as Record<string, any>;
    const resolvedAgreementId = agreementSnap.id;
    const agreementRef = doc(db, COLLECTIONS.AGREEMENTS, resolvedAgreementId);

    if (agreementData.clientAccessToken !== token) {
      return NextResponse.json(
        { success: false, error: 'Token inválido.' },
        { status: 403 }
      );
    }

    if (agreementData.status !== 'pending_client_confirmation') {
      return NextResponse.json(
        { success: false, error: 'Este acordo não pode mais ser processado.' },
        { status: 400 }
      );
    }

    let newStatus: 'confirmed' | 'contested' | 'in_adjustment';
    let eventType:
      | 'client_confirmed'
      | 'client_contested'
      | 'amendment_adjustment_requested';
    let title: string;
    let description: string;

    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (action === 'accept') {
      newStatus = 'confirmed';
      eventType = 'client_confirmed';
      title = 'Proposta Aceita';
      description = 'Cliente aceitou a proposta via link público.';
      updateData.status = newStatus;
      updateData.confirmedAt = serverTimestamp();
    } else if (action === 'reject') {
      newStatus = 'contested';
      eventType = 'client_contested';
      title = 'Proposta Recusada';
      description = 'Cliente recusou a proposta via link público.';
      updateData.status = newStatus;
      updateData.contestedAt = serverTimestamp();
    } else {
      if (!message) {
        return NextResponse.json(
          { success: false, error: 'Informe a mensagem da solicitação de revisão.' },
          { status: 400 }
        );
      }

      const currentRevisionCount =
        typeof agreementData.revisionCount === 'number'
          ? agreementData.revisionCount
          : 0;

      if (agreementData.revisionLimitReached || currentRevisionCount >= 1) {
        return NextResponse.json(
          { success: false, error: 'Limite de revisão atingido.' },
          { status: 400 }
        );
      }

      newStatus = 'in_adjustment';
      eventType = 'amendment_adjustment_requested';
      title = 'Revisão solicitada';
      description = `Cliente solicitou revisão via link público: ${message}`;

      updateData.status = newStatus;
      updateData.revisionRequestedAt = serverTimestamp();
      updateData.revisionCount = currentRevisionCount + 1;
      updateData.revisionLimitReached = true;
      updateData.lastRevisionMessage = message;
    }

    const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));

    const eventData = {
      agreementId: resolvedAgreementId,
      type: eventType,
      actorType: 'client',
      actorName: agreementData.clientName || 'Cliente',
      title,
      description,
      metadata: {
        action,
        source: 'public_link',
        message: action === 'request_revision' ? message : null,
        status: newStatus,
      },
      createdAt: serverTimestamp(),
    };

    const batch = writeBatch(db);
    batch.update(agreementRef, updateData);
    batch.set(eventRef, eventData);
    await batch.commit();

    return NextResponse.json({
      success: true,
      agreementId: resolvedAgreementId,
      status: newStatus,
    });
  } catch (error) {
    console.error('Erro na API pública de resposta do acordo:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno.',
      },
      { status: 500 }
    );
  }
}
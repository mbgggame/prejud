import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const COLLECTIONS = {
  AGREEMENTS: 'agreements',
  AGREEMENT_EVENTS: 'agreement_events',
} as const;

const MAX_REVISIONS = 1;

type PublicAction = 'accept' | 'reject' | 'request_revision';

export async function POST(request: NextRequest) {
  console.log('\n🚀 [API] public-agreement/respond chamada');
  
  try {
    const body = await request.json();

    const agreementId = String(body?.agreementId || '').trim();
    const protocol = String(body?.protocol || '').trim();
    const token = String(body?.token || '').trim();
    const action = String(body?.action || '').trim() as PublicAction;
    const message = String(body?.message || '').trim();

    console.log('📋 [API] Dados recebidos:', { agreementId, protocol, action });

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

    let resolvedAgreementId: string;
    let agreementData: Record<string, any>;

    if (agreementId) {
      const docRef = db.collection(COLLECTIONS.AGREEMENTS).doc(agreementId);
      const doc = await docRef.get();
      if (!doc.exists) {
        return NextResponse.json(
          { success: false, error: 'Acordo não encontrado.' },
          { status: 404 }
        );
      }
      resolvedAgreementId = agreementId;
      agreementData = doc.data() || {};
    } else if (protocol) {
      const q = db.collection(COLLECTIONS.AGREEMENTS).where('protocol', '==', protocol).limit(1);
      const qs = await q.get();

      if (qs.empty) {
        return NextResponse.json(
          { success: false, error: 'Acordo não encontrado.' },
          { status: 404 }
        );
      }

      resolvedAgreementId = qs.docs[0].id;
      agreementData = qs.docs[0].data() || {};
    } else {
      return NextResponse.json(
        { success: false, error: 'agreementId ou protocol obrigatório.' },
        { status: 400 }
      );
    }

    console.log('🔍 [API] Acordo encontrado:', {
      id: resolvedAgreementId,
      freelancerEmail: agreementData.freelancerEmail,
      freelancerName: agreementData.freelancerName,
      status: agreementData.status,
    });

    if (agreementData.clientAccessToken !== token) {
      return NextResponse.json(
        { success: false, error: 'Token inválido.' },
        { status: 403 }
      );
    }

    const validStatuses = ['pending_client_confirmation', 'in_adjustment'];
    if (!validStatuses.includes(agreementData.status)) {
      return NextResponse.json(
        { success: false, error: 'Este acordo não pode mais ser processado.' },
        { status: 400 }
      );
    }

    let newStatus: 'confirmed' | 'contested' | 'in_adjustment';
    let eventType: 'client_confirmed' | 'client_contested' | 'amendment_adjustment_requested';
    let title: string;
    let description: string;

    const updateData: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (action === 'accept') {
      newStatus = 'confirmed';
      eventType = 'client_confirmed';
      title = 'Proposta Aceita';
      description = 'Cliente aceitou a proposta via link público.';
      updateData.status = newStatus;
      updateData.confirmedAt = FieldValue.serverTimestamp();
    } else if (action === 'reject') {
      newStatus = 'contested';
      eventType = 'client_contested';
      title = 'Proposta Recusada';
      description = 'Cliente recusou a proposta via link público.';
      updateData.status = newStatus;
      updateData.contestedAt = FieldValue.serverTimestamp();
    } else {
      if (!message) {
        return NextResponse.json(
          { success: false, error: 'Informe a mensagem da solicitação de revisão.' },
          { status: 400 }
        );
      }

      const currentRevisionCount = typeof agreementData.revisionCount === 'number' ? agreementData.revisionCount : 0;

      if (currentRevisionCount >= MAX_REVISIONS) {
        return NextResponse.json(
          { success: false, error: 'Limite de revisões atingido.' },
          { status: 400 }
        );
      }

      newStatus = 'in_adjustment';
      eventType = 'amendment_adjustment_requested';
      title = 'Revisão solicitada';
      description = `Cliente solicitou revisão via link público: ${message}`;

      updateData.status = newStatus;
      updateData.revisionRequestedAt = FieldValue.serverTimestamp();
      updateData.revisionCount = currentRevisionCount + 1;
      updateData.lastRevisionMessage = message;
    }

    const eventRef = db.collection(COLLECTIONS.AGREEMENT_EVENTS).doc();

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
      createdAt: FieldValue.serverTimestamp(),
    };

    const batch = db.batch();
    const agreementRef = db.collection(COLLECTIONS.AGREEMENTS).doc(resolvedAgreementId);
    batch.update(agreementRef, updateData);
    batch.set(eventRef, eventData);
    await batch.commit();

    console.log('💾 [API] Acordo atualizado, status:', newStatus);

    // Notificar freelancer (não bloqueante)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      console.log('📧 [EMAIL] Verificando freelancerEmail:', agreementData.freelancerEmail);
      
      // ⭐ VERIFICAÇÃO CRÍTICA: freelancerEmail deve existir
      if (!agreementData.freelancerEmail || !agreementData.freelancerEmail.includes('@')) {
        console.error('❌ [EMAIL] freelancerEmail inválido ou ausente:', {
          agreementId: resolvedAgreementId,
          freelancerEmail: agreementData.freelancerEmail,
        });
      } else {
        const emailPayload = {
          type: action === 'accept' ? 'confirmed' : action === 'reject' ? 'rejected' : 'revision_requested',
          agreementId: resolvedAgreementId, // ⭐ NOVO: Passando agreementId
          freelancerEmail: agreementData.freelancerEmail,
          freelancerName: agreementData.freelancerName,
          clientEmail: agreementData.clientEmail,
          clientName: agreementData.clientName,
          agreementTitle: agreementData.title,
          agreementLink: `${baseUrl}/p/${agreementData.protocol || resolvedAgreementId}?t=${agreementData.clientAccessToken}`,
          revisionMessage: action === 'request_revision' ? message : undefined,
        };
        
        console.log('📧 [EMAIL] Enviando notificação:', {
          to: emailPayload.freelancerEmail,
          type: emailPayload.type,
          agreementId: emailPayload.agreementId,
        });
        
        const emailResponse = await fetch(`${baseUrl}/api/send-agreement-response`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailPayload),
        });
        
        console.log('📧 [EMAIL] Resposta da API de email:', emailResponse.status);
        
        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('❌ [EMAIL] Falha ao enviar:', {
            status: emailResponse.status,
            error: errorText,
          });
        } else {
          const emailResult = await emailResponse.json();
          console.log('✅ [EMAIL] Sucesso:', emailResult);
        }
      }
    } catch (emailError) {
      console.error('❌ [EMAIL] Erro crítico:', emailError);
    }

    return NextResponse.json({
      success: true,
      agreementId: resolvedAgreementId,
      status: newStatus,
    });
  } catch (error) {
    console.error('💥 [API] Erro geral:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno.',
      },
      { status: 500 }
    );
  }
}

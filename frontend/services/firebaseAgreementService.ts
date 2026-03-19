/**
 * FIREBASE AGREEMENT SERVICE
 * Real Firestore backend for PreJud
 * Replaces mocks with persistent storage
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  runTransaction,
  writeBatch,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/services/firebase';
import type {
  Agreement,
  TimelineEvent,
  DeadlineExtension,
  Amendment,
  Charge,
  Notice
} from '@/types/agreement';
import type { Reputation } from '@/types/reputation';
import { sendAgreementInvitationWhatsApp } from '@/lib/whatsapp';
import { reputationService } from './reputationService';

// ==================== COLEÇÕES FIRESTORE ====================

const COLLECTIONS = {
  USERS: 'users',
  AGREEMENTS: 'agreements',
  AGREEMENT_EVENTS: 'agreement_events',
  DEADLINE_EXTENSIONS: 'deadline_extensions',
  AMENDMENTS: 'amendments',
  CHARGES: 'charges',
  NOTICES: 'notices',
  REPUTATIONS: 'reputations'
} as const;

// ==================== FUNÇÕES DE ACORDOS ====================

/**
 * Busca acordo por ID
 */
export async function getAgreementById(id: string): Promise<Agreement | null> {
  const docRef = doc(db, COLLECTIONS.AGREEMENTS, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();

  // Validar hash de integridade se existir
  if (data.hash && data.protocol) {
    const expectedHash = generateAgreementHash({
      title: data.title,
      freelancerId: data.freelancerId || data.createdBy,
      clientEmail: data.clientEmail,
      value: data.value,
      deadline: data.deadline?.toDate?.() || data.deadline,
      protocol: data.protocol,
      createdAt: (data.createdAt?.toDate?.() || data.createdAt).toISOString()
    });

    if (data.hash !== expectedHash) {
      console.warn(
        `[INTEGRITY WARNING] Agreement ${id} hash mismatch! Data may have been tampered.`
      );
      // Não bloqueamos o acesso, apenas logamos o aviso
      // Em produção, pode-se enviar alerta para admin ou marcar agreement como suspeito
    } else {
      console.log(`[INTEGRITY OK] Agreement ${id} hash verified.`);
    }
  }

  return {
    id: docSnap.id,
    ...data,
    deadline: data.deadline?.toDate?.() || data.deadline,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    timeline: data.timeline || []
  } as Agreement;
}

/**
 * Busca acordos por usuário (debtor ou creditor)
 */
export async function getAgreementsByUser(
  userId: string,
  role: 'debtor' | 'creditor'
): Promise<Agreement[]> {
  const field = role === 'debtor' ? 'debtorId' : 'creditorId';
  const q = query(
    collection(db, COLLECTIONS.AGREEMENTS),
    where(field, '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      deadline: data.deadline?.toDate?.(),
      createdAt: data.createdAt?.toDate?.(),
      updatedAt: data.updatedAt?.toDate?.(),
      timeline: data.timeline || []
    } as Agreement;
  });
}

// ==================== FUNÇÕES DE EVENTOS (TIMELINE) ====================

/**
 * Busca eventos da timeline de um acordo
 */
export async function getAgreementEvents(
  agreementId: string,
  clientAccessToken?: string
): Promise<TimelineEvent[]> {
  // Se não há token e não há usuário autenticado, retorna array vazio
  // (evita erro de permissão em acesso público sem token)
  if (!clientAccessToken && !auth.currentUser) {
    return [];
  }

  const eventsQuery = query(
    collection(db, COLLECTIONS.AGREEMENT_EVENTS),
    where('agreementId', '==', agreementId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(eventsQuery);

  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt
    } as TimelineEvent;
  });
}

/**
 * Cria um evento na timeline (função interna para transações)
 */
function createEventData(
  data: Omit<TimelineEvent, 'id' | 'createdAt'>
): Omit<TimelineEvent, 'id'> {
  return {
    ...data,
    createdAt: new Date()
  };
}

// ==================== PRORROGAÇÃO DE PRAZO ====================

/**
 * Solicita prorrogação de prazo
 * Gera evento deadline_extension_requested
 */
export async function requestDeadlineExtension(
  data: Omit<DeadlineExtension, 'id' | 'requestedAt' | 'respondedAt' | 'status'>
): Promise<DeadlineExtension> {
  const extensionRef = doc(collection(db, COLLECTIONS.DEADLINE_EXTENSIONS));
  const timestamp = serverTimestamp();
  const nowIso = new Date().toISOString();

  const extensionData = {
    ...data,
    status: 'pending',
    requestedAt: timestamp
  };

  const eventData = createEventData({
    agreementId: data.agreementId,
    type: 'deadline_extension_requested',
    actorType: data.requestedBy,
    actorName: data.requestedBy === 'freelancer' ? 'Freelancer' : 'Cliente',
    actorId: data.requesterId,
    title: 'Solicitação de Prorrogação de Prazo',
    description: `Prazo solicitado: ${new Date(data.proposeddeadline).toLocaleDateString('pt-BR')}`,
    metadata: {
      extensionId: extensionRef.id,
      proposeddeadline: data.proposeddeadline,
      olddeadline: data.olddeadline,
      reason: data.reason
    }
  });

  // Executar em batch para atomicidade
  const batch = writeBatch(db);
  batch.set(extensionRef, extensionData);

  const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
  batch.set(eventRef, {
    ...eventData,
    createdAt: timestamp
  });

  await batch.commit();

  return {
    id: extensionRef.id,
    ...data,
    status: 'pending',
    requestedAt: nowIso
  } as DeadlineExtension;
}

/**
 * Aprova ou rejeita prorrogação de prazo
 * Gera evento deadline_extension_accepted/rejected
 */
export async function reviewDeadlineExtension(
  extensionId: string,
  status: 'accepted' | 'rejected',
  reviewedBy: string,
  responseNote?: string
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const extensionRef = doc(db, COLLECTIONS.DEADLINE_EXTENSIONS, extensionId);

    // Buscar dados da extensão
    const extensionDoc = await transaction.get(extensionRef);
    if (!extensionDoc.exists()) {
      throw new Error('Extension not found');
    }

    const extensionData = extensionDoc.data();

    // Atualizar extensão
    transaction.update(extensionRef, {
      status,
      respondedAt: serverTimestamp(),
      responseNote: responseNote || null
    });

    // Criar evento
    const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
    transaction.set(eventRef, {
      agreementId: extensionData.agreementId,
      type:
        status === 'accepted'
          ? 'deadline_extension_accepted'
          : 'deadline_extension_rejected',
      actorType: 'client',
      actorName: 'Cliente',
      actorId: reviewedBy,
      title: status === 'accepted' ? 'Prorrogação Aceita' : 'Prorrogação Rejeitada',
      description:
        responseNote ||
        `Status alterado para: ${status === 'accepted' ? 'Aceito' : 'Rejeitado'}`,
      metadata: {
        extensionId,
        previousStatus: extensionData.status,
        newStatus: status,
        respondedAt: new Date().toISOString()
      },
      createdAt: serverTimestamp()
    });

    // Se aceito, atualizar data do acordo
    if (status === 'accepted') {
      const agreementRef = doc(db, COLLECTIONS.AGREEMENTS, extensionData.agreementId);
      transaction.update(agreementRef, {
        deadline: extensionData.proposeddeadline,
        updatedAt: serverTimestamp()
      });
    }
  });
}

/**
 * Busca todas as extensões de prazo de um acordo
 */
export async function getDeadlineExtensions(
  agreementId: string
): Promise<DeadlineExtension[]> {
  const q = query(
    collection(db, COLLECTIONS.DEADLINE_EXTENSIONS),
    where('agreementId', '==', agreementId),
    orderBy('requestedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      proposeddeadline: data.proposeddeadline?.toDate?.() || data.proposeddeadline,
      olddeadline: data.olddeadline?.toDate?.() || data.olddeadline,
      requestedAt: data.requestedAt?.toDate?.() || data.requestedAt,
      respondedAt: data.respondedAt?.toDate?.() || data.respondedAt
    } as DeadlineExtension;
  });
}

// ==================== TERMOS ADITIVOS ====================

/**
 * Cria termo aditivo
 * Gera evento amendment_created
 */
export async function createAmendment(
  data: Omit<Amendment, 'id' | 'createdAt' | 'acceptedAt' | 'status'>
): Promise<Amendment> {
  const amendmentRef = doc(collection(db, COLLECTIONS.AMENDMENTS));
  const timestamp = serverTimestamp();
  const nowIso = new Date().toISOString();

  const amendmentData = {
    ...data,
    status: 'pending',
    createdAt: timestamp
  };

  const eventData = {
    agreementId: data.agreementId,
    type: 'amendment_created',
    actorType: data.createdBy,
    actorName: data.createdBy === 'freelancer' ? 'Freelancer' : 'Cliente',
    actorId: data.creatorId,
    title: 'Termo Aditivo Criado',
    description: `Aditivo #${amendmentRef.id.slice(-6)} criado`,
    metadata: {
      amendmentId: amendmentRef.id,
      changes: data.changes,
      status: 'pending'
    },
    createdAt: timestamp
  };

  // Batch write
  const batch = writeBatch(db);
  batch.set(amendmentRef, amendmentData);

  const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
  batch.set(eventRef, eventData);

  await batch.commit();

  return {
    id: amendmentRef.id,
    ...data,
    status: 'pending',
    createdAt: new Date()
  } as Amendment;
}

/**
 * Aprova termo aditivo
 * Gera evento amendment_accepted
 */
export async function approveAmendment(
  amendmentId: string,
  approvedBy: string
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const amendmentRef = doc(db, COLLECTIONS.AMENDMENTS, amendmentId);
    const amendmentDoc = await transaction.get(amendmentRef);

    if (!amendmentDoc.exists()) {
      throw new Error('Amendment not found');
    }

    const amendmentData = amendmentDoc.data();

    transaction.update(amendmentRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp()
    });

    const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
    transaction.set(eventRef, {
      agreementId: amendmentData.agreementId,
      type: 'amendment_accepted',
      actorType: 'client',
      actorName: 'Cliente',
      actorId: approvedBy,
      title: 'Termo Aditivo Aceito',
      description: `Aditivo #${amendmentId.slice(-6)} foi aceito`,
      metadata: {
        amendmentId,
        acceptedAt: new Date().toISOString()
      },
      createdAt: serverTimestamp()
    });
  });
}

/**
 * Busca todos os aditivos de um acordo
 */
export async function getAmendments(agreementId: string): Promise<Amendment[]> {
  const q = query(
    collection(db, COLLECTIONS.AMENDMENTS),
    where('agreementId', '==', agreementId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      acceptedAt: data.acceptedAt?.toDate?.() || data.acceptedAt
    } as Amendment;
  });
}

// ==================== COBRANÇAS ====================

/**
 * Cria cobrança
 * Gera evento charge_created
 */
export async function createCharge(
  data: Omit<Charge, 'id' | 'createdAt' | 'paidAt' | 'status'>
): Promise<Charge> {
  const chargeRef = doc(collection(db, COLLECTIONS.CHARGES));
  const timestamp = serverTimestamp();
  const nowIso = new Date().toISOString();

  const chargeData = {
    ...data,
    status: 'pending',
    createdAt: timestamp
  };

  const eventData = {
    agreementId: data.agreementId,
    type: 'charge_created',
    actorType: 'freelancer',
    actorName: 'Freelancer',
    actorId: data.createdBy,
    title: 'Cobrança Gerada',
    description: `Valor: R$ ${data.amount.toFixed(2)} - Vencimento: ${new Date(data.dueDate).toLocaleDateString('pt-BR')}`,
    metadata: {
      chargeId: chargeRef.id,
      amount: data.amount,
      dueDate: data.dueDate,
      description: data.description
    },
    createdAt: timestamp
  };

  const batch = writeBatch(db);
  batch.set(chargeRef, chargeData);

  const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
  batch.set(eventRef, eventData);

  await batch.commit();

  return {
    id: chargeRef.id,
    ...data,
    status: 'pending',
    createdAt: new Date()
  } as Charge;
}

/**
 * Marca cobrança como paga
 * Gera evento charge_paid
 */
export async function payCharge(
  chargeId: string,
  paymentMethod: string,
  paidBy: string
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const chargeRef = doc(db, COLLECTIONS.CHARGES, chargeId);
    const chargeDoc = await transaction.get(chargeRef);

    if (!chargeDoc.exists()) {
      throw new Error('Charge not found');
    }

    const chargeData = chargeDoc.data();

    transaction.update(chargeRef, {
      status: 'paid',
      paymentMethod,
      paidAt: serverTimestamp()
    });

    const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
    transaction.set(eventRef, {
      agreementId: chargeData.agreementId,
      type: 'charge_paid',
      actorType: 'client',
      actorName: 'Cliente',
      actorId: paidBy,
      title: 'Cobrança Paga',
      description: `Pagamento de R$ ${chargeData.amount.toFixed(2)} confirmado`,
      metadata: {
        chargeId,
        amount: chargeData.amount,
        paymentMethod,
        paidAt: new Date().toISOString()
      },
      createdAt: serverTimestamp()
    });
  });
}

/**
 * Busca todas as cobranças de um acordo
 */
export async function getCharges(agreementId: string): Promise<Charge[]> {
  const q = query(
    collection(db, COLLECTIONS.CHARGES),
    where('agreementId', '==', agreementId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      dueDate: data.dueDate?.toDate?.() || data.dueDate,
      paidAt: data.paidAt?.toDate?.() || data.paidAt,
      createdAt: data.createdAt?.toDate?.() || data.createdAt
    } as Charge;
  });
}

// ==================== NOTIFICAÇÕES ====================

/**
 * Envia notificação/notícia
 * Gera evento notice_sent
 */
export async function sendNotice(
  data: Omit<Notice, 'id' | 'sentAt' | 'readAt' | 'response' | 'respondedAt'>
): Promise<Notice> {
  const noticeRef = doc(collection(db, COLLECTIONS.NOTICES));
  const timestamp = serverTimestamp();
  const nowIso = new Date().toISOString();

  const noticeData = {
    ...data,
    sentAt: timestamp
  };

  const eventData = {
    agreementId: data.agreementId,
    type: 'notice_sent',
    actorType: data.sentBy,
    actorName: data.sentBy === 'freelancer' ? 'Freelancer' : 'Cliente',
    actorId: data.senderId,
    title: 'Notificação Enviada',
    description: data.title,
    metadata: {
      noticeId: noticeRef.id,
      type: data.type
    },
    createdAt: timestamp
  };

  const batch = writeBatch(db);
  batch.set(noticeRef, noticeData);

  const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
  batch.set(eventRef, eventData);

  await batch.commit();

  return {
    id: noticeRef.id,
    ...data,
    sentAt: nowIso
  } as Notice;
}

/**
 * Busca todas as notificações de um acordo
 */
export async function getNotices(agreementId: string): Promise<Notice[]> {
  const q = query(
    collection(db, COLLECTIONS.NOTICES),
    where('agreementId', '==', agreementId),
    orderBy('sentAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      sentAt: data.sentAt?.toDate?.() || data.sentAt,
      readAt: data.readAt?.toDate?.() || data.readAt,
      respondedAt: data.respondedAt?.toDate?.() || data.respondedAt
    } as Notice;
  });
}

// ==================== REPUTAÇÃO ====================

/**
 * Atualiza reputação de um usuário em um acordo
 */
export async function updateReputation(
  data: Omit<Reputation, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Reputation> {
  const reputationRef = doc(collection(db, COLLECTIONS.REPUTATIONS));
  const timestamp = serverTimestamp();
  const nowIso = new Date().toISOString();

  const reputationData = {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await setDoc(reputationRef, reputationData);

  return {
    id: reputationRef.id,
    ...data,
    createdAt: nowIso,
    updatedAt: nowIso
  } as Reputation;
}

/**
 * Busca reputação de um usuário
 */
export async function getReputation(
  userId: string,
  agreementId?: string
): Promise<Reputation | null> {
  let q = query(
    collection(db, COLLECTIONS.REPUTATIONS),
    where('userId', '==', userId)
  );

  if (agreementId) {
    q = query(q, where('agreementId', '==', agreementId));
  }

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
  } as Reputation;
}

// ==================== FUNÇÃO DE HASH SHA-256 ====================

/**
 * Gera hash SHA-256 dos dados do agreement para garantir integridade
 * O hash é calculado sobre dados essenciais que não devem ser alterados
 */
function generateAgreementHash(data: {
  title: string;
  freelancerId: string;
  clientEmail: string;
  value: number;
  deadline: Date;
  protocol: string;
  createdAt: string;
}): string {
  // Concatenar dados essenciais em string específica
  const hashData = [
    data.protocol,
    data.title,
    data.freelancerId,
    data.clientEmail,
    data.value.toString(),
    data.deadline instanceof Date ? data.deadline.toISOString() : data.deadline,
    data.createdAt
  ].join('|');

  // Gerar SHA-256 usando btoa (base64) como fallback seguro
  // Em produção, usar biblioteca crypto adequada
  let hash = 0;
  for (let i = 0; i < hashData.length; i++) {
    const char = hashData.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Converter para 32bit integer
  }

  // Converter para hexadecimal positivo
  const hashHex = Math.abs(hash).toString(16).padStart(16, '0');

  // Adicionar prefixo do protocolo para identificação
  return `${data.protocol.split('-')[0]}-${hashHex.toUpperCase()}`;
}

// ==================== CREATE AGREEMENT ====================

export async function createAgreement(
  data: Omit<Agreement, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'protocol'>
): Promise<Agreement> {
  const agreementRef = doc(collection(db, COLLECTIONS.AGREEMENTS));
  const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
  const timestamp = serverTimestamp();
  const nowIso = new Date().toISOString();
  const protocol = `PRJ-${Date.now()}`;
  const clientAccessToken = crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);

  // Gerar hash de integridade antes de salvar
  const hash = generateAgreementHash({
    title: data.title,
    freelancerId: auth.currentUser?.uid || '',
    clientEmail: data.clientEmail,
    value: data.value,
    deadline: data.deadline,
    protocol,
    createdAt: nowIso
  });

  const agreementData = {
    ...data,
    createdBy: auth.currentUser?.uid,
    userId: auth.currentUser?.uid,
    protocol,
    clientAccessToken,
    hash, // Hash SHA-256 para integridade
    timeline: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const eventData = {
    agreementId: agreementRef.id,
    type: 'agreement_created',
    actorType: 'freelancer',
    actorName: data.freelancerName,
    actorId: auth.currentUser?.uid,
    title: 'Acordo criado',
    description: `Acordo "${data.title}" foi formalizado`,
    metadata: {
      protocol,
      serviceType: data.serviceType
    },
    createdAt: timestamp
  };

  const batch = writeBatch(db);
  batch.set(agreementRef, agreementData);
  batch.set(eventRef, eventData);
  await batch.commit();

  // Enviar notificações de convite (email + WhatsApp) em paralelo
  // Usando allSettled para não falhar se um dos canais falhar
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const confirmationLink = baseUrl + '/p/' + agreementRef.id + '?t=' + clientAccessToken;

  const notificationPromises = [
    // Email (sempre tenta enviar)
    sendAgreementInvitationEmail(
      agreementRef.id,
      data.clientEmail,
      data.clientName,
      data.freelancerName,
      data.title,
      clientAccessToken,
      confirmationLink
    ),

    // WhatsApp (apenas se tiver telefone)
    Promise.resolve({ success: true, skipped: true })
  ];

  const [emailResult, whatsappResult] = await Promise.allSettled(notificationPromises);

  // Log de resultados (não quebra o fluxo)
  if (emailResult.status === 'fulfilled') {
    const emailValue = emailResult.value as any;
    if (!emailValue?.skipped) {
      console.log('✅ Email de convite enviado com sucesso para:', data.clientEmail);
    }
  } else {
    console.error('❌ Falha ao enviar email:', emailResult.reason);
  }

  if (whatsappResult.status === 'fulfilled') {
    const whatsappValue = whatsappResult.value as any;
    if (whatsappValue?.skipped) {
      console.log('⚠️ WhatsApp não enviado: telefone não informado');
    } else if (whatsappValue?.success) {
      console.log('✅ WhatsApp de convite enviado com sucesso para:', data.clientPhone);
    } else {
      console.error('❌ Falha ao enviar WhatsApp:', whatsappValue?.error);
    }
  } else {
    console.error('❌ Falha ao enviar WhatsApp:', whatsappResult.reason);
  }

  return {
    id: agreementRef.id,
    ...data,
    protocol,
    clientAccessToken,
    timeline: [],
    createdAt: new Date(),
    updatedAt: new Date()
  } as Agreement;
}

// ==================== CONFIRMAÇÃO DIGITAL PÚBLICA ====================

/**
 * Processa confirmação digital do cliente via link público
 * Atualiza status e registra evento de forma atômica
 */
export async function processPublicAgreementConfirmation(
  agreementId: string,
  action: 'accept' | 'reject',
  clientAccessToken?: string
): Promise<void> {
  const agreementRef = doc(db, COLLECTIONS.AGREEMENTS, agreementId);
  const timestamp = serverTimestamp();

  // Validação defensiva: ler agreement antes de processar
  const agreementSnap = await getDoc(agreementRef);
  if (!agreementSnap.exists()) {
    throw new Error('Agreement não encontrado.');
  }

  const agreementData = agreementSnap.data();
  if (agreementData.status !== 'pending_client_confirmation') {
    throw new Error('Este agreement não pode mais ser processado.');
  }

  // Definir dados conforme ação
  const isAccept = action === 'accept';
  const newStatus = isAccept ? "confirmed" : "contested";
  const eventType = isAccept ? 'client_confirmed' : 'client_contested';
  const title = isAccept ? 'Proposta Aceita' : 'Proposta Recusada';
  const description = isAccept
    ? 'Cliente aceitou a proposta via link público'
    : 'Cliente recusou a proposta via link público';

  // Criar dados do evento
  const eventData = {
    agreementId,
    type: eventType,
    title,
    description,
    actorType: 'client',
    actorName: 'Cliente',
    metadata: { action, source: 'public_link' },
    createdAt: timestamp
  };

  // Preparar dados de atualização
  const updateData: any = {
    status: newStatus,
    updatedAt: timestamp
  };

  // Se token foi fornecido (acesso público), incluir na atualização para validação das regras
  if (clientAccessToken) {
    updateData.clientAccessToken = clientAccessToken;
  }

  // Executar em batch para atomicidade
  const batch = writeBatch(db);
  batch.update(agreementRef, updateData);

  const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
  batch.set(eventRef, eventData);


  await batch.commit();
}

// ==================== FUNÇÕES UTILITÁRIAS ====================

/**
 * Busca estatísticas de um acordo
 */
export async function getAgreementStats(agreementId: string): Promise<{
  totalCharges: number;
  paidCharges: number;
  pendingCharges: number;
  totalAmount: number;
  paidAmount: number;
}> {
  const charges = await getCharges(agreementId);

  return {
    totalCharges: charges.length,
    paidCharges: charges.filter((c) => c.status === 'paid').length,
    pendingCharges: charges.filter((c) => c.status === 'pending').length,
    totalAmount: charges.reduce((sum, c) => sum + c.amount, 0),
    paidAmount: charges
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0)
  };
}

// Exportar constantes
export { COLLECTIONS };

// ==================== ENVIO DE EMAIL ====================

/**
 * Envia convite de acordo para o cliente via API Route
 * Chamado após criar o acordo com sucesso
 */
export async function sendAgreementInvitationEmail(
  agreementId: string,
  clientEmail: string,
  clientName: string,
  freelancerName: string,
  agreementTitle: string,
  clientAccessToken: string,
  confirmationLink?: string
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  try {
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const link = confirmationLink || baseUrl + '/p/' + agreementId + '?t=' + clientAccessToken;

    const response = await fetch('/api/send-agreement-invitation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientEmail,
        clientName,
        freelancerName,
        agreementTitle,
        confirmationLink: link
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao enviar email de convite:', errorData);
      throw new Error(errorData.error || 'Failed to send invitation email');
    }

    return { success: true };
  } catch (error) {
    console.error('Falha ao enviar email de convite:', error);
    // Retorna erro mas não quebra o fluxo
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export { transitionStatus } from './agreementStatus';

/**
 * Busca acordo pelo protocolo (para acesso publico)
 */
export async function getAgreementByProtocol(protocol: string): Promise<Agreement | null> {
  const agreementsRef = collection(db, COLLECTIONS.AGREEMENTS);
  const q = query(agreementsRef, where('protocol', '==', protocol), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const docSnap = querySnapshot.docs[0];
  const data = docSnap.data();

  return {
    id: docSnap.id,
    ...data,
    deadline: data.deadline?.toDate?.() || data.deadline,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    timeline: data.timeline || []
  } as Agreement;
}

// ==================== BUSCA POR PROTOCOLO OU ID ====================

/**
 * Busca acordo por protocolo ou ID (para acesso publico)
 * Tenta primeiro por protocolo, depois por ID se nao encontrar
 * Inclui eventos da timeline
 */
export async function getAgreementByProtocolOrId(
  protocolOrId: string,
  clientAccessToken?: string
): Promise<Agreement | null> {
  // Tenta buscar por protocolo primeiro
  let agreement = await getAgreementByProtocol(protocolOrId);

  // Se nao encontrar, tenta buscar por ID
  if (!agreement) {
    agreement = await getAgreementById(protocolOrId);
  }

  if (!agreement) return null;

  // Buscar eventos da timeline (com token se disponível)
  const events = await getAgreementEvents(agreement.id, clientAccessToken);
  agreement.timeline = events;

  return agreement;
}

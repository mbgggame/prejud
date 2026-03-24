import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  runTransaction,
  serverTimestamp,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
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
  try {
    const docRef = doc(db, COLLECTIONS.AGREEMENTS, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn("[getAgreementById] Acordo não encontrado:", id);
      return null;
    }

    const data = docSnap.data();

    return {
      id: docSnap.id,

      // 🔹 Dados principais
      title: data.title || "",
      freelancerId: data.freelancerId || "",
      freelancerName: data.freelancerName || "",
      clientName: data.clientName || "",
      clientEmail: data.clientEmail || "",
      serviceType: data.serviceType || "",
      description: data.description || "",
      value: data.value || 0,
      deadline: data.deadline || null,

      // 🔹 Status e controle
      status: data.status || "draft",
      terms: data.terms || "",

      // 🔹 Segurança / integridade
      hash: data.hash || "",
      protocol: data.protocol || "",

      // 🔹 Token de acesso (ESSENCIAL pro e-mail funcionar)
      clientAccessToken: data.clientAccessToken || "",

      // 🔹 Datas
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,

      // 🔹 Revisão (importante pro seu fluxo novo)
      revisionMode: data.revisionMode || false,
      revisionStatus: data.revisionStatus || null,
      originalAgreementId: data.originalAgreementId || null,
      revisedAgreementId: data.revisedAgreementId || null,

      // 🔹 Fallback para qualquer outro campo existente
      ...data,
    } as Agreement;

  } catch (error) {
    console.error("[getAgreementById] Erro ao buscar acordo:", error);
    return null;
  }
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
    const extensionDoc = await transaction.get(extensionRef);
    if (!extensionDoc.exists()) {
      throw new Error('Extension not found');
    }

    const extensionData = extensionDoc.data();

    transaction.update(extensionRef, {
      status,
      respondedAt: serverTimestamp(),
      responseNote: responseNote || null
    });

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
  const hashData = [
    data.protocol,
    data.title,
    data.freelancerId,
    data.clientEmail,
    data.value.toString(),
    data.deadline instanceof Date ? data.deadline.toISOString() : data.deadline,
    data.createdAt
  ].join('|');

  let hash = 0;
  for (let i = 0; i < hashData.length; i++) {
    const char = hashData.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const hashHex = Math.abs(hash).toString(16).padStart(16, '0');
  return `${data.protocol.split('-')[0]}-${hashHex.toUpperCase()}`;
}

// ==================== HELPERS DE EMAIL DE RESPOSTA ====================

function getBaseAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function buildPublicAgreementLink(protocolOrId: string, clientAccessToken?: string): string {
  const baseUrl = getBaseAppUrl();
  return clientAccessToken
    ? `${baseUrl}/p/${protocolOrId}?t=${clientAccessToken}`
    : `${baseUrl}/p/${protocolOrId}`;
}

async function sendAgreementResponseEmail(payload: {
  type: 'confirmed' | 'rejected' | 'revision_requested' | 'closed';
  freelancerEmail?: string;
  freelancerName?: string;
  clientEmail?: string;
  clientName?: string;
  agreementTitle?: string;
  agreementLink?: string;
  revisionMessage?: string;
  agreementId?: string;
  protocol?: string;
  hash?: string;
}) {
  try {
    if (!payload.freelancerEmail && payload.type !== 'closed') {
      console.warn('⚠️ Email do freelancer não encontrado. Disparo de resposta ignorado.');
      return { success: false, skipped: true, error: 'Missing freelancer email' };
    }

    const response = await fetch('/api/send-agreement-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('❌ Falha na rota de resposta do acordo:', errorData || response.statusText);
      return {
        success: false,
        error: errorData?.error || 'Failed to send agreement response email'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao disparar email de resposta do acordo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
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

  const currentUserId = auth.currentUser?.uid || '';
  const currentUserEmail = auth.currentUser?.email || '';

  // Gerar hash de integridade antes de salvar
  const hash = generateAgreementHash({
    title: data.title,
    freelancerId: currentUserId,
    clientEmail: data.clientEmail,
    value: data.value,
    deadline: data.deadline,
    protocol,
    createdAt: nowIso
  });

  const agreementData = {
    ...data,
    creditorId: currentUserId,
    debtorId: data.clientEmail,
    createdBy: currentUserId,
    userId: currentUserId,
    freelancerId: currentUserId,
    freelancerEmail: currentUserEmail,
    protocol,
    clientAccessToken,
    hash,
    timeline: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const eventData = {
    agreementId: agreementRef.id,
    type: 'agreement_created',
    actorType: 'freelancer',
    actorName: data.freelancerName,
    actorId: currentUserId,
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

  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const confirmationLink = baseUrl + '/p/' + agreementRef.id + '?t=' + clientAccessToken;

  const notificationPromises = [
    sendAgreementInvitationEmail(
      agreementRef.id,
      data.clientEmail,
      data.clientName,
      data.freelancerName,
      data.title,
      clientAccessToken,
      confirmationLink
    ),
    Promise.resolve({ success: true, skipped: true })
  ];

  const [emailResult, whatsappResult] = await Promise.allSettled(notificationPromises);

  if (emailResult.status === 'fulfilled') {
    const emailValue = emailResult.value as any;
    if (!emailValue?.skipped) {
      console.log('✅ Email de convite enviado com sucesso para:', data.clientEmail);
    }
  } else {
    console.error('❌ Falha ao enviar email:', emailResult.reason);
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
 */
export async function processPublicAgreementConfirmation(
  agreementId: string,
  action: 'accept' | 'reject' | 'request_revision',
  clientAccessToken?: string,
  message?: string
): Promise<void> {
  const agreementRef = doc(db, COLLECTIONS.AGREEMENTS, agreementId);
  const timestamp = serverTimestamp();

  const agreementSnap = await getDoc(agreementRef);
  if (!agreementSnap.exists()) {
    throw new Error('Agreement não encontrado.');
  }

  const agreementData = agreementSnap.data();
  if (agreementData.status !== 'pending_client_confirmation') {
    throw new Error('Este agreement não pode mais ser processado.');
  }

  let newStatus: 'confirmed' | 'contested' | 'in_adjustment';
  let eventType: 'client_confirmed' | 'client_contested' | 'amendment_adjustment_requested';
  let title: string;
  let description: string;

  if (action === 'accept') {
    newStatus = 'confirmed';
    eventType = 'client_confirmed';
    title = 'Proposta Aceita';
    description = 'Cliente aceitou a proposta via link público';
  } else if (action === 'reject') {
    newStatus = 'contested';
    eventType = 'client_contested';
    title = 'Proposta Recusada';
    description = 'Cliente recusou a proposta via link público';
  } else {
    if (!message || !message.trim()) {
      throw new Error('Informe a mensagem da solicitação de revisão.');
    }

    newStatus = 'in_adjustment';
    eventType = 'amendment_adjustment_requested';
    title = 'Revisão solicitada';
    description = `Cliente solicitou revisão via link público: ${message.trim()}`;
  }

  const eventData = {
    agreementId,
    type: eventType,
    title,
    description,
    actorType: 'client',
    actorName: 'Cliente',
    metadata: {
      action,
      source: 'public_link',
      ...(message?.trim() ? { message: message.trim() } : {})
    },
    createdAt: timestamp
  };

  const updateData: any = {
    status: newStatus,
    updatedAt: timestamp
  };

  if (clientAccessToken) {
    updateData.clientAccessToken = clientAccessToken;
  }

  const batch = writeBatch(db);
  batch.update(agreementRef, updateData);

  const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
  batch.set(eventRef, eventData);

  await batch.commit();

  // Disparo de email para o freela após resposta do cliente
  try {
    const agreementLink = buildPublicAgreementLink(
      agreementData.protocol || agreementId,
      agreementData.clientAccessToken || clientAccessToken
    );

    if (action === 'accept') {
      await sendAgreementResponseEmail({
        type: 'confirmed',
        freelancerEmail: agreementData.freelancerEmail,
        freelancerName: agreementData.freelancerName,
        clientEmail: agreementData.clientEmail,
        clientName: agreementData.clientName,
        agreementTitle: agreementData.title,
        agreementLink
      });
    }

    if (action === 'reject') {
      await sendAgreementResponseEmail({
        type: 'rejected',
        freelancerEmail: agreementData.freelancerEmail,
        freelancerName: agreementData.freelancerName,
        clientEmail: agreementData.clientEmail,
        clientName: agreementData.clientName,
        agreementTitle: agreementData.title,
        agreementLink
      });
    }

    if (action === 'request_revision') {
  await sendAgreementResponseEmail({
    type: 'revision_requested',
    freelancerEmail: agreementData.freelancerEmail,
    freelancerName: agreementData.freelancerName,
    clientEmail: agreementData.clientEmail,
    clientName: agreementData.clientName,
    agreementTitle: agreementData.title,
    revisionMessage: message?.trim(),
    // NOVOS CAMPOS para montar URL correta do dashboard:
    agreementId: agreementId,
    protocol: agreementData.protocol,
    hash: agreementData.hash
    // agreementLink removido - não é mais necessário
  });
}
  } catch (emailError) {
    console.error('⚠️ Resposta do cliente registrada, mas o email ao freela falhou:', emailError);
  }
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
 */
export async function getAgreementByProtocolOrId(
  protocolOrId: string,
  clientAccessToken?: string
): Promise<Agreement | null> {
  let agreement = await getAgreementByProtocol(protocolOrId);

  if (!agreement) {
    agreement = await getAgreementById(protocolOrId);
  }

  if (!agreement) return null;

  const events = await getAgreementEvents(agreement.id, clientAccessToken);
  agreement.timeline = events;

  return agreement;
}
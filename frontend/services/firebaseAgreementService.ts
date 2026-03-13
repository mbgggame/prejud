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
import { db } from '@/lib/firebase';
import type {
  Agreement,
  AgreementEvent,
  DeadlineExtensionRequest,
  Amendment,
  Charge,
  Notice,
  Reputation
} from '@/types/agreement';

// ==================== COLEï¿½ï¿½ES FIRESTORE ====================

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

// ==================== FUNï¿½ï¿½ES DE ACORDOS ====================

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
  return {
    id: docSnap.id,
    ...data,
    startDate: data.startDate?.toDate?.() || data.startDate,
    endDate: data.endDate?.toDate?.() || data.endDate,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
  } as Agreement;
}

/**
 * Busca acordos por usuï¿½rio (debtor ou creditor)
 */
export async function getAgreementsByUser(userId: string, role: 'debtor' | 'creditor'): Promise<Agreement[]> {
  const field = role === 'debtor' ? 'debtorId' : 'creditorId';
  const q = query(
    collection(db, COLLECTIONS.AGREEMENTS),
    where(field, '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startDate: data.startDate?.toDate?.(),
      endDate: data.endDate?.toDate?.(),
      createdAt: data.createdAt?.toDate?.(),
      updatedAt: data.updatedAt?.toDate?.()
    } as Agreement;
  });
}

// ==================== FUNï¿½ï¿½ES DE EVENTOS (TIMELINE) ====================

/**
 * Busca eventos da timeline de um acordo
 */
export async function getAgreementEvents(agreementId: string): Promise<AgreementEvent[]> {
  const eventsQuery = query(
    collection(db, COLLECTIONS.AGREEMENT_EVENTS),
    where('agreementId', '==', agreementId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(eventsQuery);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt
    } as AgreementEvent;
  });
}

/**
 * Cria um evento na timeline (funï¿½ï¿½o interna para transaï¿½ï¿½es)
 */
function createEventData(
  data: Omit<AgreementEvent, 'id' | 'createdAt'>
): Omit<AgreementEvent, 'id'> {
  return {
    ...data,
    createdAt: new Date()
  };
}

// ==================== PRORROGAï¿½ï¿½O DE PRAZO ====================

/**
 * Solicita prorrogaï¿½ï¿½o de prazo
 * Gera evento DEADLINE_EXTENSION_REQUESTED
 */
export async function requestDeadlineExtension(
  data: Omit<DeadlineExtensionRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<DeadlineExtensionRequest> {
  const extensionRef = doc(collection(db, COLLECTIONS.DEADLINE_EXTENSIONS));
  const timestamp = serverTimestamp();
  
  const extensionData = {
    ...data,
    status: 'pending',
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  const eventData = createEventData({
    agreementId: data.agreementId,
    type: 'DEADLINE_EXTENSION_REQUESTED',
    title: 'Solicitaï¿½ï¿½o de Prorrogaï¿½ï¿½o de Prazo',
    description: `Prazo solicitado: ${new Date(data.requestedDeadline).toLocaleDateString('pt-BR')}`,
    actorId: data.requestedBy,
    actorType: data.requesterType,
    metadata: {
      extensionId: extensionRef.id,
      requestedDeadline: data.requestedDeadline,
      currentDeadline: data.currentDeadline,
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
    ...extensionData,
    createdAt: new Date(),
    updatedAt: new Date()
  } as DeadlineExtensionRequest;
}

/**
 * Aprova ou rejeita prorrogaï¿½ï¿½o de prazo
 * Gera evento DEADLINE_EXTENSION_APPROVED/REJECTED
 */
export async function reviewDeadlineExtension(
  extensionId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  reviewNotes?: string
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const extensionRef = doc(db, COLLECTIONS.DEADLINE_EXTENSIONS, extensionId);
    
    // Buscar dados da extensï¿½o
    const extensionDoc = await transaction.get(extensionRef);
    if (!extensionDoc.exists()) {
      throw new Error('Extension not found');
    }
    
    const extensionData = extensionDoc.data();
    
    // Atualizar extensï¿½o
    transaction.update(extensionRef, {
      status,
      reviewedBy,
      reviewNotes: reviewNotes || null,
      updatedAt: serverTimestamp()
    });
    
    // Criar evento
    const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
    transaction.set(eventRef, {
      agreementId: extensionData.agreementId,
      type: status === 'approved' ? 'DEADLINE_EXTENSION_APPROVED' : 'DEADLINE_EXTENSION_REJECTED',
      title: status === 'approved' ? 'Prorrogaï¿½ï¿½o Aprovada' : 'Prorrogaï¿½ï¿½o Rejeitada',
      description: reviewNotes || `Status alterado para: ${status === 'approved' ? 'Aprovado' : 'Rejeitado'}`,
      actorId: reviewedBy,
      actorType: 'creditor',
      metadata: {
        extensionId,
        previousStatus: extensionData.status,
        newStatus: status,
        reviewedAt: new Date().toISOString()
      },
      createdAt: serverTimestamp()
    });
    
    // Se aprovado, atualizar data do acordo
    if (status === 'approved') {
      const agreementRef = doc(db, COLLECTIONS.AGREEMENTS, extensionData.agreementId);
      transaction.update(agreementRef, {
        endDate: Timestamp.fromDate(new Date(extensionData.requestedDeadline)),
        updatedAt: serverTimestamp()
      });
    }
  });
}

/**
 * Busca todas as extensï¿½es de prazo de um acordo
 */
export async function getDeadlineExtensions(agreementId: string): Promise<DeadlineExtensionRequest[]> {
  const q = query(
    collection(db, COLLECTIONS.DEADLINE_EXTENSIONS),
    where('agreementId', '==', agreementId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      requestedDeadline: data.requestedDeadline?.toDate?.() || data.requestedDeadline,
      currentDeadline: data.currentDeadline?.toDate?.() || data.currentDeadline,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
    } as DeadlineExtensionRequest;
  });
}

// ==================== TERMOS ADITIVOS ====================

/**
 * Cria termo aditivo
 * Gera evento AMENDMENT_CREATED
 */
export async function createAmendment(
  data: Omit<Amendment, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Amendment> {
  const amendmentRef = doc(collection(db, COLLECTIONS.AMENDMENTS));
  const timestamp = serverTimestamp();
  
  const amendmentData = {
    ...data,
    status: 'draft',
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  const eventData = {
    agreementId: data.agreementId,
    type: 'AMENDMENT_CREATED',
    title: 'Termo Aditivo Criado',
    description: `Aditivo #${amendmentRef.id.slice(-6)} criado - ${data.title}`,
    actorId: data.createdBy,
    actorType: 'creditor',
    metadata: {
      amendmentId: amendmentRef.id,
      changes: data.changes,
      status: 'draft'
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
    ...amendmentData,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Amendment;
}

/**
 * Aprova termo aditivo
 * Gera evento AMENDMENT_APPROVED
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
      status: 'approved',
      approvedBy,
      updatedAt: serverTimestamp()
    });
    
    const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
    transaction.set(eventRef, {
      agreementId: amendmentData.agreementId,
      type: 'AMENDMENT_APPROVED',
      title: 'Termo Aditivo Aprovado',
      description: `Aditivo #${amendmentId.slice(-6)} foi aprovado`,
      actorId: approvedBy,
      actorType: 'debtor',
      metadata: {
        amendmentId,
        approvedAt: new Date().toISOString()
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
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
    } as Amendment;
  });
}

// ==================== COBRANï¿½AS ====================

/**
 * Cria cobranï¿½a
 * Gera evento CHARGE_CREATED
 */
export async function createCharge(
  data: Omit<Charge, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Charge> {
  const chargeRef = doc(collection(db, COLLECTIONS.CHARGES));
  const timestamp = serverTimestamp();
  
  const chargeData = {
    ...data,
    status: 'pending',
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  const eventData = {
    agreementId: data.agreementId,
    type: 'CHARGE_CREATED',
    title: 'Cobranï¿½a Gerada',
    description: `Valor: R$ ${data.amount.toFixed(2)} - Vencimento: ${new Date(data.dueDate).toLocaleDateString('pt-BR')}`,
    actorId: data.createdBy,
    actorType: 'creditor',
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
    ...chargeData,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Charge;
}

/**
 * Marca cobranï¿½a como paga
 * Gera evento CHARGE_PAID
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
      paidBy,
      paidAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const eventRef = doc(collection(db, COLLECTIONS.AGREEMENT_EVENTS));
    transaction.set(eventRef, {
      agreementId: chargeData.agreementId,
      type: 'CHARGE_PAID',
      title: 'Cobranï¿½a Paga',
      description: `Pagamento de R$ ${chargeData.amount.toFixed(2)} confirmado`,
      actorId: paidBy,
      actorType: 'debtor',
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
 * Busca todas as cobranï¿½as de um acordo
 */
export async function getCharges(agreementId: string): Promise<Charge[]> {
  const q = query(
    collection(db, COLLECTIONS.CHARGES),
    where('agreementId', '==', agreementId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      dueDate: data.dueDate?.toDate?.() || data.dueDate,
      paidAt: data.paidAt?.toDate?.() || data.paidAt,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
    } as Charge;
  });
}

// ==================== NOTIFICAï¿½ï¿½ES ====================

/**
 * Envia notificaï¿½ï¿½o/notï¿½cia
 * Gera evento NOTICE_SENT
 */
export async function sendNotice(
  data: Omit<Notice, 'id' | 'createdAt' | 'sentAt' | 'status'>
): Promise<Notice> {
  const noticeRef = doc(collection(db, COLLECTIONS.NOTICES));
  const timestamp = serverTimestamp();
  
  const noticeData = {
    ...data,
    status: 'sent',
    createdAt: timestamp,
    sentAt: timestamp
  };
  
  const eventData = {
    agreementId: data.agreementId,
    type: 'NOTICE_SENT',
    title: 'Notificaï¿½ï¿½o Enviada',
    description: data.subject,
    actorId: data.sentBy,
    actorType: data.senderType,
    metadata: {
      noticeId: noticeRef.id,
      noticeType: data.noticeType,
      channel: data.channel,
      recipientId: data.recipientId
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
    ...noticeData,
    createdAt: new Date(),
    sentAt: new Date()
  } as Notice;
}

/**
 * Busca todas as notificaï¿½ï¿½es de um acordo
 */
export async function getNotices(agreementId: string): Promise<Notice[]> {
  const q = query(
    collection(db, COLLECTIONS.NOTICES),
    where('agreementId', '==', agreementId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      sentAt: data.sentAt?.toDate?.() || data.sentAt
    } as Notice;
  });
}

// ==================== REPUTAï¿½ï¿½O ====================

/**
 * Atualiza reputaï¿½ï¿½o de um usuï¿½rio em um acordo
 */
export async function updateReputation(
  data: Omit<Reputation, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Reputation> {
  const reputationRef = doc(collection(db, COLLECTIONS.REPUTATIONS));
  const timestamp = serverTimestamp();
  
  const reputationData = {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await setDoc(reputationRef, reputationData);
  
  return {
    id: reputationRef.id,
    ...reputationData,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Reputation;
}

/**
 * Busca reputaï¿½ï¿½o de um usuï¿½rio
 */
export async function getReputation(userId: string, agreementId?: string): Promise<Reputation | null> {
  let q = query(
    collection(db, COLLECTIONS.REPUTATIONS),
    where('userId', '==', userId)
  );
  
  if (agreementId) {
    q = query(q, where('agreementId', '==', agreementId));
  }
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
  } as Reputation;
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
  const clientAccessToken = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);

  const agreementData = {
    ...data,
    protocol,
    clientAccessToken,
    timeline: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const eventData = {
    agreementId: agreementRef.id,
    type: 'agreement_created',
    actorType: 'freelancer',
    actorName: data.freelancerName,
    actorId: data.freelancerId,
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

  return {
    id: agreementRef.id,
    ...data,
    protocol,
    clientAccessToken,
    timeline: [],
    createdAt: nowIso,
    updatedAt: nowIso
  } as Agreement;
}

// ==================== FUNï¿½ï¿½ES UTILITï¿½RIAS ====================

/**
 * Busca estatï¿½sticas de um acordo
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
    paidCharges: charges.filter(c => c.status === 'paid').length,
    pendingCharges: charges.filter(c => c.status === 'pending').length,
    totalAmount: charges.reduce((sum, c) => sum + c.amount, 0),
    paidAmount: charges.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0)
  };
}

// Exportar constantes
export { COLLECTIONS };

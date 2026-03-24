/**
 * DASHBOARD SERVICE
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Agreement, Charge, Notice } from '@/types/agreement';

const COLLECTIONS = {
  AGREEMENTS: 'agreements',
  CHARGES: 'charges',
  NOTICES: 'notices',
} as const;

const DASHBOARD_LIMIT = 50;

export interface FreelancerDashboardData {
  agreements: Agreement[];
  recentCharges: Charge[];
  recentNotices: Notice[];
  stats: {
    totalAgreements: number;
    activeAgreements: number;
    pendingConfirmation: number;
    inDispute: number;
    completed: number;
    totalValue: number;
    pendingValue: number;
    paidValue: number;
  };
}

function convertTimestamp(timestamp: unknown): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if ((timestamp as Timestamp).toDate) return (timestamp as Timestamp).toDate();
  return new Date(timestamp as string | number);
}

export async function getFreelancerAgreements(
  freelancerId: string
): Promise<Agreement[]> {
  const q = query(
    collection(db, COLLECTIONS.AGREEMENTS),
    where('freelancerId', '==', freelancerId),
    orderBy('createdAt', 'desc'),
    limit(DASHBOARD_LIMIT)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      deadline: convertTimestamp(data.deadline),
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      timeline: data.timeline || []
    } as Agreement;
  });
}

export async function getChargesByAgreementIds(
  agreementIds: string[]
): Promise<Charge[]> {
  if (agreementIds.length === 0) return [];

  const batches: string[][] = [];
  for (let i = 0; i < agreementIds.length; i += 10) {
    batches.push(agreementIds.slice(i, i + 10));
  }

  const allCharges: Charge[] = [];

  for (const batch of batches) {
    const q = query(
      collection(db, COLLECTIONS.CHARGES),
      where('agreementId', 'in', batch),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    
    const charges = snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        dueDate: convertTimestamp(data.dueDate),
        paidAt: convertTimestamp(data.paidAt),
        createdAt: convertTimestamp(data.createdAt)
          } as unknown as Charge;
    });

    allCharges.push(...charges);
  }

  return allCharges;
}

export async function getNoticesByAgreementIds(
  agreementIds: string[]
): Promise<Notice[]> {
  if (agreementIds.length === 0) return [];

  const batches: string[][] = [];
  for (let i = 0; i < agreementIds.length; i += 10) {
    batches.push(agreementIds.slice(i, i + 10));
  }

  const allNotices: Notice[] = [];

  for (const batch of batches) {
    const q = query(
      collection(db, COLLECTIONS.NOTICES),
      where('agreementId', 'in', batch),
      orderBy('sentAt', 'desc')
    );

    const snapshot = await getDocs(q);
    
    const notices = snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        sentAt: convertTimestamp(data.sentAt),
        readAt: convertTimestamp(data.readAt),
        respondedAt: convertTimestamp(data.respondedAt)
          } as unknown as Notice;
    });

    allNotices.push(...notices);
  }

  return allNotices;
}

export async function getFreelancerDashboardData(
  freelancerId: string
): Promise<FreelancerDashboardData> {
  const agreements = await getFreelancerAgreements(freelancerId);
  const agreementIds = agreements.map((a: Agreement) => a.id);

  const [charges, notices] = await Promise.all([
    getChargesByAgreementIds(agreementIds),
    getNoticesByAgreementIds(agreementIds)
  ]);

  const activeStatuses = ['confirmed', 'charge_open', 'deadline_extension_pending', 'amendment_pending', 'notice_sent'];
  const pendingStatuses = ['pending_client_confirmation'];
  const disputeStatuses = ['in_dispute', 'contested', 'charge_contested'];
  const completedStatuses = ['closed', 'completed'];

  const totalValue = agreements.reduce((sum, a) => sum + (a.value || 0), 0);
  const pendingValue = charges.filter((c: Charge) => c.status === 'pending').reduce((sum, c) => sum + (c.amount || 0), 0);
  const paidValue = charges.filter((c: Charge) => c.status === 'paid').reduce((sum, c) => sum + (c.amount || 0), 0);

  return {
    agreements,
    recentCharges: charges.slice(0, 5),
    recentNotices: notices.slice(0, 5),
    stats: {
      totalAgreements: agreements.length,
      activeAgreements: agreements.filter((a: Agreement) => activeStatuses.includes(a.status)).length,
      pendingConfirmation: agreements.filter((a: Agreement) => pendingStatuses.includes(a.status)).length,
      inDispute: agreements.filter((a: Agreement) => disputeStatuses.includes(a.status)).length,
      completed: agreements.filter((a: Agreement) => completedStatuses.includes(a.status)).length,
      totalValue,
      pendingValue,
      paidValue
    }
  };
}

export function subscribeFreelancerAgreements(
  freelancerId: string,
  onData: (agreements: Agreement[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.AGREEMENTS),
    where('freelancerId', '==', freelancerId),
    orderBy('createdAt', 'desc'),
    limit(DASHBOARD_LIMIT)
  );

  return onSnapshot(
    q,
    (snapshot: { docs: QueryDocumentSnapshot<DocumentData>[] }) => {
      const agreements = snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          deadline: convertTimestamp(data.deadline),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          timeline: data.timeline || []
        } as Agreement;
      });
      onData(agreements);
    },
    (error: Error) => {
      console.error('[DashboardService] Subscribe error:', error);
      onError?.(error);
    }
  );
}
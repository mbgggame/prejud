// Serviço de armazenamento de contrato - PreJud
// Salva contrato + registra evento na timeline

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addContractGeneratedEvent } from '@/services/firebaseAgreementService';

export async function saveContractToAgreement(
  agreementId: string,
  contractText: string,
  userId?: string
) {
  try {
    const ref = doc(db, 'agreements', agreementId);

    await updateDoc(ref, {
      contractText: contractText,
      contractGeneratedAt: serverTimestamp(),
    });

    // 🔥 REGISTRAR EVENTO NA TIMELINE
    if (userId) {
      await addContractGeneratedEvent(agreementId, userId);
    }

    return true;
  } catch (err) {
    console.error('Erro ao salvar contrato:', err);
    throw new Error('Erro ao salvar contrato');
  }
}
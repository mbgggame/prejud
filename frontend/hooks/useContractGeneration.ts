'use client';

import { useState } from 'react';
import { saveContractToAgreement } from '@/services/contractStorageService';

export function useContractGeneration() {
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateContract(data: any, agreementId?: string) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/contracts/generate-from-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Erro ao gerar contrato');
      }

      const generatedContract = json.data.contract;

      setContract(generatedContract);

      // 🔥 SALVAR NO FIRESTORE (NOVO)
      if (agreementId) {
    await saveContractToAgreement(agreementId, generatedContract);
      }

    } catch (err: any) {
      console.error('Erro ao gerar contrato:', err);
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    contract,
    error,
    generateContract,
  };
}
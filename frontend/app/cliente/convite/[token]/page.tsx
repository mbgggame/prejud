'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAgreementById, processPublicAgreementConfirmation } from '@/services/firebaseAgreementService';
import { Agreement } from '@/types/agreement';

export default function ConvitePage() {
  const params = useParams();
  const token = params.token as string;
  
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadAgreement();
  }, [token]);

  const loadAgreement = async () => {
    try {
      setLoading(true);
      const data = await getAgreementById(token);
      if (!data) {
        setError('Convite invalido ou expirado');
        return;
      }
      if (data.clientAccessToken !== token) {
        setError('Token de acesso invalido');
        return;
      }
      setAgreement(data);
    } catch (err) {
      setError('Erro ao carregar convite');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!agreement) return;
    setProcessing(true);
    try {
      await processPublicAgreementConfirmation(agreement.id, 'accept');
      window.location.href = `/cliente/acordos/${agreement.id}`;
    } catch (err) {
      setError('Erro ao confirmar acordo');
      setProcessing(false);
    }
  };

  const handleContest = async () => {
    if (!agreement) return;
    setProcessing(true);
    try {
      await processPublicAgreementConfirmation(agreement.id, 'reject');
      window.location.href = `/cliente/acordos/${agreement.id}`;
    } catch (err) {
      setError('Erro ao contestar acordo');
      setProcessing(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!agreement) return <div>Acordo nao encontrado</div>;

  return (
    <div className="convite-container">
      <h1>Convite para Acordo Profissional</h1>
      <div className="agreement-details">
        <h2>{agreement.title}</h2>
        <p>{agreement.description}</p>
        <p>Valor: R$ {agreement.value}</p>
        <p>Prazo: {new Date(agreement.deadline).toLocaleDateString()}</p>
        <p>Freelancer: {agreement.freelancerName}</p>
      </div>
      
      <div className="actions">
        <button 
          onClick={handleConfirm} 
          disabled={processing || agreement.status !== 'pending_client_confirmation'}
        >
          {processing ? 'Processando...' : 'Confirmar Acordo'}
        </button>
        <button 
          onClick={handleContest}
          disabled={processing}
        >
          Contestar
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  getAgreementById,
  getAgreementEvents,
  closeAgreement,
} from '@/services/firebaseAgreementService';
import type { Agreement, TimelineEvent } from '@/types/agreement';
import { useContractGeneration } from '@/hooks/useContractGeneration';
import ContractPreview from '@/components/contracts/ContractPreview';
import { mapAgreementToContractInput } from '@/lib/contracts/map-agreement-to-contract';

export default function RevisarAcordoPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const agreementId = searchParams?.get('agreementId') ?? null;
  const action = searchParams?.get('action') ?? null;

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const {
    loading: contractLoading,
    contract,
    error: contractError,
    generateContract,
  } = useContractGeneration();

  useEffect(() => {
    // Não executar enquanto o auth está carregando
    if (authLoading) return;

    async function loadData() {
      if (!agreementId) {
        setError('ID do acordo não fornecido');
        setLoading(false);
        return;
      }

      if (!user) {
        setError('Você precisa estar logado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getAgreementById(agreementId);

        if (!data) {
          setError('Acordo não encontrado');
          return;
        }

        // DEBUG: Verificar IDs
        console.log('🔍 DEBUG - User UID:', user.uid);
        console.log('🔍 DEBUG - Agreement freelancerId:', data.freelancerId);
        console.log('🔍 DEBUG - São iguais?:', data.freelancerId === user.uid);
        console.log('🔍 DEBUG - User Email:', user.email);
        console.log('🔍 DEBUG - Agreement freelancerEmail:', data.freelancerEmail);

        // Verificar se o usuário é o freelancer dono do acordo
        if (data.freelancerId !== user.uid) {
          console.error('❌ PERMISSÃO NEGADA - IDs não coincidem');
          setError('Você não tem permissão para acessar este acordo');
          return;
        }

        // Verificar se o acordo está em ajuste
        if (data.status !== 'in_adjustment') {
          setError('Este acordo não está em revisão');
          return;
        }

        setAgreement(data);

        // Buscar eventos para encontrar a mensagem de revisão
        const timelineEvents = await getAgreementEvents(agreementId);
        setEvents(timelineEvents || []);
      } catch (err) {
        console.error('Erro ao carregar acordo:', err);
        setError('Erro ao carregar dados do acordo');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [agreementId, user, authLoading]);

  // Encontrar a mensagem de revisão mais recente
  const revisionEvent = events.find(
    (e) => e.type === 'amendment_adjustment_requested'
  );
  const revisionMessage = revisionEvent?.metadata?.message || 'Nenhuma mensagem detalhada';

  const handleAcceptAndAdjust = () => {
    if (!agreementId) return;
    // Redireciona para o formalizar-acordo em modo revisão
    router.push(`/dashboard/formalizar-acordo?agreementId=${agreementId}&mode=revision`);
  };

  const handleRejectAndClose = async () => {
    if (!agreementId || !user) return;

    const confirmed = window.confirm(
      'Tem certeza que deseja NEGAR a revisão e ENCERRAR o acordo?\n\nEsta ação não pode ser desfeita.'
    );

    if (!confirmed) return;

    try {
      setProcessing(true);
      await closeAgreement(agreementId, user.uid, 'Freelancer recusou a revisão solicitada');
      alert('✅ Acordo encerrado com sucesso');
      router.push('/dashboard');
    } catch (err) {
      console.error('Erro ao encerrar acordo:', err);
      alert('❌ Erro ao encerrar acordo. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReviewDetails = () => {
    if (!agreementId) return;
    router.push(`/dashboard/formalizar-acordo?agreementId=${agreementId}&mode=revision`);
  };

  const handleGenerateContract = async () => {
    if (!agreement) return;

    try {
      const contractInput = mapAgreementToContractInput(agreement);
      await generateContract(contractInput, agreement.id);
    } catch (err) {
      console.error('Erro ao gerar contrato:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FB] dark:bg-[#020817]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <p className="mt-4 text-slate-600 dark:text-slate-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FB] dark:bg-[#020817] p-4">
        <div className="bg-white dark:bg-[#04112A] rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-slate-200 dark:border-slate-800">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Erro</h1>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FB] dark:bg-[#020817]">
        <p className="text-slate-600 dark:text-slate-400">Acordo não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-900 dark:bg-[#020817] dark:text-white">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 mb-4">
            📝 Revisão Solicitada
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            O cliente solicitou ajustes no acordo
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Revise a solicitação e escolha como deseja prosseguir
          </p>
        </div>

        {/* Card do Acordo */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#04112A] mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Protocolo: {agreement.protocol}
              </p>
              <h2 className="text-2xl font-bold">{agreement.title}</h2>
            </div>
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              Em Revisão
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-[#0F172A]">
              <p className="text-slate-500 dark:text-slate-400">Cliente</p>
              <p className="font-semibold text-lg">{agreement.clientName}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-[#0F172A]">
              <p className="text-slate-500 dark:text-slate-400">Valor</p>
              <p className="font-semibold text-lg">R$ {agreement.value?.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-[#0F172A]">
              <p className="text-slate-500 dark:text-slate-400">Revisões</p>
              <p className="font-semibold text-lg">{agreement.revisionCount || 0} de 1</p>
            </div>
          </div>
        </div>

        {/* Mensagem do Cliente */}
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 mb-6 dark:border-amber-900/40 dark:bg-amber-950/20">
          <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-3">
            💬 Mensagem do Cliente
          </h3>
          <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-[#0F172A]">
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 italic">
              "{revisionMessage}"
            </p>
          </div>
        </div>

        {/* Aviso Importante */}
        <div className="rounded-[28px] border border-blue-200 bg-blue-50 p-5 mb-6 dark:border-blue-900/40 dark:bg-blue-950/20">
          <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2">
            ⚠️ Importante
          </h3>
          <p className="text-blue-700 dark:text-blue-400">
            O cliente tem direito a <strong>1 revisão</strong>. Após você reenviar o acordo ajustado,
            o cliente poderá aceitar, recusar ou solicitar nova revisão (se ainda houver direito).
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#04112A]">
          <h3 className="text-xl font-bold mb-6 text-center">O que você deseja fazer?</h3>

          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            {/* Aceitar e Ajustar */}
            <button
              onClick={handleAcceptAndAdjust}
              disabled={processing}
              className="group relative flex flex-col items-center justify-center rounded-2xl bg-amber-500 p-6 text-white transition hover:bg-amber-600 disabled:opacity-50"
            >
              <span className="text-4xl mb-3">✏️</span>
              <span className="text-xl font-bold mb-2">Aceitar e Ajustar</span>
              <span className="text-sm text-amber-100 text-center">
                Editar o acordo conforme solicitado e reenviar ao cliente
              </span>
            </button>

            {/* Negar e Encerrar */}
            <button
              onClick={handleRejectAndClose}
              disabled={processing}
              className="group relative flex flex-col items-center justify-center rounded-2xl bg-red-600 p-6 text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              <span className="text-4xl mb-3">⛔</span>
              <span className="text-xl font-bold mb-2">Negar e Encerrar</span>
              <span className="text-sm text-red-100 text-center">
                Recusar a revisão e finalizar o acordo imediatamente
              </span>
            </button>
          </div>

          {/* Ações auxiliares */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <button
              onClick={handleGenerateContract}
              disabled={processing || contractLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {contractLoading ? 'Gerando contrato...' : '📄 Gerar contrato'}
            </button>

            <button
              onClick={handleReviewDetails}
              disabled={processing}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline text-sm"
            >
              Quero revisar os detalhes do acordo primeiro
            </button>
          </div>

          {contractError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              {contractError}
            </div>
          )}
        </div>

        {/* Prévia do contrato */}
        {contract && (
          <div className="mt-6">
            <ContractPreview contract={contract} />
          </div>
        )}

        {/* Botão Voltar */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700/50 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:bg-slate-900"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
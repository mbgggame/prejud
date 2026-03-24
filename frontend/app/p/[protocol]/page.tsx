'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useContractGeneration } from '@/hooks/useContractGeneration';
import { generateHash } from '@/lib/crypto/hash';
import { mapAgreementToContractInput } from '@/lib/contracts/map-agreement-to-contract';
import { saveContractToAgreement } from '@/services/contractStorageService';
import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { getAgreementByProtocolOrId, getAgreementEvents } from '@/services/firebaseAgreementService';
import ReputationScore from '@/components/agreement/ReputationScore';
import type { Agreement, TimelineEvent } from '@/types/agreement';

// ⭐ NOVO: Função para formatar data no padrão DD/MM/AAAA
function formatDateBR(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

// ⭐ NOVO: Função para obter label do evento
function getEventLabel(type?: string): string {
  const labels: Record<string, string> = {
    created: "Acordo criado",
    pending_client_confirmation: "Aguardando cliente",
    amendment_adjustment_requested: "Revisão solicitada",
    amended: "Acordo ajustado",
    resent_after_revision: "Reenviado após revisão",
    confirmed: "Aprovado",
    contested: "Contestado",
    rejected: "Rejeitado",
    closed: "Encerrado",
    notice_sent: "Notificação emitida",
    charge_open: "Cobrança aberta",
    charge_contested: "Cobrança contestada",
    contract_generated: "Contrato gerado",
    contract_sent: "Contrato enviado",
  };
  return labels[type || ""] || type || "Evento";
}

// Componente principal
export default function PublicAgreementPage() {
  const params = useParams();
  const protocol = typeof params?.protocol === 'string' ? params.protocol : '';

  const searchParams = useSearchParams();
  const token = searchParams?.get('t') ?? null;
  const actionParam = searchParams?.get('action') ?? null;

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [canRequestRevision, setCanRequestRevision] = useState(true);
  const [revisionMessage, setRevisionMessage] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // 🔥 NOVO: estado de envio
  const [sendingContract, setSendingContract] = useState(false);

  // Hooks de autenticação e geração de contrato
  const { user } = useAuth();
  const { loading: generatingContract, contract: generatedContract, error: contractError, generateContract } = useContractGeneration();
  const [contractHash, setContractHash] = useState<string | null>(null);

  // Função gerar contrato com hash SHA-256 e timeline
  const handleGenerateContract = async () => {
    if (!agreement || !user) return;

    // Verificar se usuário é o freelancer dono do acordo
    if (user.uid !== agreement.freelancerId) {
      alert('Apenas o freelancer dono do acordo pode gerar o contrato.');
      return;
    }

    try {
      const contractInput = mapAgreementToContractInput(agreement);
      await generateContract(contractInput, agreement.id);

      // Calcular hash SHA-256 do contrato gerado
      if (generatedContract) {
        const hash = await generateHash(generatedContract);
        setContractHash(hash);

        // Salvar contrato com hash e registrar na timeline
        await saveContractToAgreement(agreement.id, generatedContract, user.uid);

        alert('✅ Contrato gerado com sucesso e registrado na timeline!');
        await refreshAgreement();
      }
    } catch (err) {
      console.error('Erro ao gerar contrato:', err);
      alert('❌ Erro ao gerar contrato. Tente novamente.');
    }
  };

  // 🔥 NOVO: função enviar contrato
  const handleSendContract = async () => {
    if (!agreement) return;

    try {
      setSendingContract(true);

      const { sendContractToClient } = await import('@/services/contractSendService');

      const res = await sendContractToClient(
        agreement.id,
        agreement.clientEmail
      );

      alert('Contrato enviado!\n\nLink:\n' + res.link);
    } catch (err) {
      console.error('Erro ao enviar contrato:', err);
      alert('Erro ao enviar contrato');
    } finally {
      setSendingContract(false);
    }
  };

  useEffect(() => {
    if (!protocol) return;

    async function loadAgreement() {
      try {
        setLoading(true);
        setError('');

        const data = await getAgreementByProtocolOrId(protocol, token || undefined);

        if (data) {
          setAgreement(data);

          // ⭐ NOVO: Carregar timeline do acordo
          try {
            const events = await getAgreementEvents(data.id);
            setTimeline(events || []);
          } catch (err) {
            console.error('Erro ao carregar timeline:', err);
            setTimeline([]);
          }

          const limitReached =
            (data.revisionCount || 0) >= 1 ||
            Boolean((data as any).revisionLimitReached) ||
            Boolean((data as any).finalVersion);

          setCanRequestRevision(!limitReached);
        } else {
          setError('Acordo não encontrado ou link inválido');
        }
      } catch (err) {
        console.error('Erro ao carregar acordo:', err);
        setError('Erro ao carregar acordo. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }

    loadAgreement();
  }, [protocol, token]);

  useEffect(() => {
    if (!agreement || !actionParam) return;

    if (actionParam === 'adjust') {
      if (canRequestRevision) {
        setShowRevisionForm(true);
      }
      return;
    }

    if (actionParam === 'reject-close') {
      setShowRevisionForm(false);
    }
  }, [agreement, actionParam, canRequestRevision]);

  async function parseResponse(response: Response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return await response.json().catch(() => null);
    }

    const text = await response.text().catch(() => '');
    return text ? { error: text } : null;
  }

  async function refreshAgreement() {
    if (!protocol) return;

    const updated = await getAgreementByProtocolOrId(protocol, token || undefined);
    if (updated) {
      setAgreement(updated);

      // ⭐ NOVO: Recarregar timeline
      try {
        const events = await getAgreementEvents(updated.id);
        setTimeline(events || []);
      } catch (err) {
        console.error('Erro ao recarregar timeline:', err);
      }

      const limitReached =
        (updated.revisionCount || 0) >= 1 ||
        Boolean((updated as any).revisionLimitReached) ||
        Boolean((updated as any).finalVersion);

      setCanRequestRevision(!limitReached);
    }
  }

  async function handleAccept() {
    if (!agreement || !token || !protocol) return;

    try {
      setActionLoading(true);

      const response = await fetch('/api/public-agreement/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agreementId: agreement.id,
          protocol,
          token,
          action: 'accept',
        }),
      });

      const result = await parseResponse(response);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Falha ao aceitar acordo.');
      }

      alert('✅ Acordo aceito com sucesso!');
      await refreshAgreement();
    } catch (err: any) {
      console.error('Erro ao aceitar acordo:', err);
      alert('❌ Erro ao aceitar acordo: ' + (err?.message || 'Tente novamente'));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectAgreement() {
    if (!agreement || !token || !protocol) return;

    const confirmReject = window.confirm('Tem certeza que deseja recusar este acordo?');
    if (!confirmReject) return;

    try {
      setActionLoading(true);

      const response = await fetch('/api/public-agreement/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementId: agreement.id,
          protocol,
          token,
          action: 'reject',
        }),
      });

      const result = await parseResponse(response);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Falha ao recusar acordo.');
      }

      alert('❌ Acordo recusado.');
      await refreshAgreement();
    } catch (err: any) {
      console.error('Erro ao recusar acordo:', err);
      alert(`❌ ${err?.message || 'Erro ao recusar acordo.'}`);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRequestRevision() {
    if (!agreement || !revisionMessage.trim() || !token || !protocol) return;

    if (!canRequestRevision || (agreement.revisionCount || 0) >= 1) {
      alert('🚫 Você já utilizou seu direito de revisão neste acordo.');
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch('/api/public-agreement/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agreementId: agreement.id,
          protocol,
          token,
          action: 'request_revision',
          message: revisionMessage.trim(),
        }),
      });

      const result = await parseResponse(response);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Falha ao solicitar revisão.');
      }

      alert('✅ Revisão solicitada com sucesso!');
      setShowRevisionForm(false);
      setCanRequestRevision(false);
      setRevisionMessage('');

      await refreshAgreement();
    } catch (err: any) {
      console.error('Erro ao solicitar revisão:', err);

      if (
        err?.message?.includes('Limite de revisões') ||
        err?.message?.includes('1 revisão')
      ) {
        alert('🚫 ' + err.message);
        setCanRequestRevision(false);
      } else {
        alert('❌ Erro ao solicitar revisão: ' + (err?.message || 'Tente novamente'));
      }
    } finally {
      setActionLoading(false);
    }
  }

  if (!protocol) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando acordo...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando acordo...</p>
        </div>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Erro</h1>
          <p className="text-gray-600">{error || 'Acordo não encontrado'}</p>
        </div>
      </div>
    );
  }

  const isPending = agreement.status === 'pending_client_confirmation';
  const isInAdjustment = agreement.status === 'in_adjustment';
  const isConfirmed = agreement.status === 'confirmed';
  const revisionCount = agreement.revisionCount || 0;
  const finalVersion = Boolean((agreement as any).finalVersion);

  const publicReputationScore =
    typeof (agreement as any).reputationScore === 'number'
      ? (agreement as any).reputationScore
      : typeof (agreement as any).reputation?.score === 'number'
        ? (agreement as any).reputation.score
        : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Protocolo: {agreement.protocol}</p>
              <h1 className="text-2xl font-bold text-gray-800">{agreement.title}</h1>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isPending
                  ? 'bg-yellow-100 text-yellow-800'
                  : isInAdjustment
                    ? 'bg-blue-100 text-blue-800'
                    : isConfirmed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isPending
                ? 'Aguardando sua resposta'
                : isInAdjustment
                  ? 'Em revisão'
                  : isConfirmed
                    ? 'Confirmado'
                    : agreement.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Freelancer</p>
              <p className="font-semibold">{agreement.freelancerName}</p>
              {/* ⭐ NOVO: CPF/CNPJ do freelancer */}
              <p className="text-xs text-gray-400 mt-1">
                CPF/CNPJ: {(agreement as any).freelancerDocument || 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Valor</p>
              <p className="font-semibold">R$ {agreement.value?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Cliente</p>
              <p className="font-semibold">{agreement.clientName}</p>
              {/* ⭐ NOVO: CPF/CNPJ do cliente */}
              <p className="text-xs text-gray-400 mt-1">
                CPF/CNPJ: {(agreement as any).clientDocument || 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Prazo de entrega</p>
              <p className="font-semibold">{formatDateBR(agreement.deadline)}</p>
            </div>
          </div>

          {/* ⭐ NOVO: Hash SHA-256 do acordo */}
          {(agreement as any)?.hash && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">
                🔐 Hash SHA-256 de Integridade
              </p>
              <p className="text-xs text-emerald-700 font-mono mt-1 break-all">
                {(agreement as any).hash}
              </p>
            </div>
          )}

          {publicReputationScore !== null && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Reputação do profissional
              </h2>
              <ReputationScore score={publicReputationScore} />
            </div>
          )}
        </div>

        {finalVersion && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-bold text-orange-800 text-lg">Versão Final do Acordo</h3>
                <p className="text-orange-700 text-sm mt-1">
                  Esta é a versão ajustada pelo freelancer após sua revisão.
                  Você já utilizou seu direito a <strong>1 revisão</strong>.
                </p>
                <p className="text-orange-600 text-sm mt-2 font-semibold">
                  Opções disponíveis: ✅ Aceitar ou ❌ Recusar
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Detalhes do Acordo</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{agreement.description}</p>
          </div>

          {agreement.terms && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Termos e Condições</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{agreement.terms}</p>
            </div>
          )}
        </div>

        {/* ⭐ NOVO: Timeline do acordo */}
        {timeline.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">📋 Histórico do Acordo</h2>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-semibold text-sm">{getEventLabel(event.type)}</p>
                  <p className="text-xs text-gray-500">
                    {formatDateBR((event as any).createdAt || (event as any).timestamp)}
                  </p>
                  {(event as any).metadata?.message && (
                    <p className="text-sm text-gray-600 mt-1">
                      {(event as any).metadata.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Revisões utilizadas:</strong> {revisionCount} de 1
            {revisionCount >= 1 && (
              <span className="text-red-600 font-semibold ml-2">(Limite atingido)</span>
            )}
          </p>
        </div>

        {isPending && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">O que você deseja fazer?</h2>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 flex-1 min-w-[200px]"
              >
                {actionLoading ? 'Processando...' : '✅ Aceitar Acordo'}
              </button>

              <button
                onClick={handleRejectAgreement}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 flex-1 min-w-[200px]"
              >
                ❌ Recusar
              </button>

              {canRequestRevision && !finalVersion && revisionCount < 1 ? (
                <button
                  onClick={() => setShowRevisionForm(true)}
                  disabled={actionLoading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 w-full"
                >
                  📝 Solicitar Revisão
                </button>
              ) : (
                <div className="w-full bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center">
                  <p className="text-gray-700 font-semibold mb-2">
                    🚫 Limite de Revisão Atingido
                  </p>
                  <p className="text-gray-600 text-sm">
                    Você já utilizou seu direito a <strong>1 revisão</strong>.
                  </p>
                  <button
                    disabled
                    className="mt-3 bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed opacity-60"
                  >
                    ❌ Solicitar Revisão (Indisponível)
                  </button>
                </div>
              )}
            </div>

            {showRevisionForm && canRequestRevision && (
              <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-3">📝 Solicitar Revisão</h4>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">
                    ⚠️ <strong>Atenção:</strong> Você tem direito a <strong>1 revisão</strong>.
                    Após o freelancer reenviar, não será possível solicitar novos ajustes neste acordo.
                  </p>
                </div>

                <textarea
                  value={revisionMessage}
                  onChange={(e) => setRevisionMessage(e.target.value)}
                  placeholder="Descreva os ajustes necessários..."
                  className="w-full p-3 border border-yellow-300 rounded-lg mb-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={4}
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleRequestRevision}
                    disabled={actionLoading || !revisionMessage.trim()}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {actionLoading ? 'Enviando...' : 'Confirmar Solicitação'}
                  </button>

                  <button
                    onClick={() => {
                      setShowRevisionForm(false);
                      setRevisionMessage('');
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isInAdjustment && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800">
              <strong>⏳ Aguardando revisão do freelancer</strong>
              <br />
              Você solicitou ajustes neste acordo. O freelancer foi notificado e está preparando a nova versão.
            </p>
          </div>
        )}

        {isConfirmed && (
          <>
            {/* Botão Gerar Contrato - apenas para freelancer quando contrato ainda não existe */}
            {user?.uid === agreement?.freelancerId && !agreement?.contractText && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6 border-2 border-blue-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">
                  📄 Gerar Contrato Formal
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Gere o contrato de prestação de serviços com base nos dados deste acordo.
                  O contrato será carimbado com hash SHA-256 e registrado na timeline.
                </p>
                <button
                  onClick={handleGenerateContract}
                  disabled={generatingContract}
                  className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingContract ? 'Gerando contrato com IA...' : '📄 Gerar Contrato Agora'}
                </button>
                {contractError && (
                  <p className="mt-3 text-sm text-red-600">
                    ⚠️ Erro: {contractError}
                  </p>
                )}
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-800">
                <strong>✅ Acordo Confirmado!</strong>
                <br />
                Este acordo foi formalizado com sucesso.
              </p>
            </div>

            {agreement?.contractText && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4">📄 Contrato Gerado</h2>

                {/* Hash SHA-256 do contrato */}
                {contractHash && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">
                      🔐 Hash SHA-256 de Integridade
                    </p>
                    <p className="text-xs text-emerald-700 font-mono mt-1 break-all">
                      {contractHash}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Registrado na timeline do acordo
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 border max-h-[500px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {agreement.contractText}
                  </pre>
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleSendContract}
                    disabled={sendingContract}
                    className="w-full rounded-2xl bg-green-600 text-white py-3 font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {sendingContract ? 'Enviando...' : '📤 Enviar contrato para o cliente'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAgreementByProtocol, processPublicAgreementConfirmation } from "@/services/firebaseAgreementService";
import { Agreement } from "@/types/agreement";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle, XCircle, Shield, FileText, User, Mail, DollarSign, Calendar } from "lucide-react";

export default function PublicAgreementPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const protocol = params.protocol as string;
  const token = searchParams.get("t");

  useEffect(() => {
    if (!protocol) return;

    const loadAgreement = async () => {
      try {
        setLoading(true);
        // Busca acordo pelo protocolo
        const data = await getAgreementByProtocol(protocol);
        if (!data) {
          setError("Acordo nao encontrado ou link invalido");
          return;
        }
        // Verifica se o token eh valido
        if (data.clientAccessToken !== token) {
          setError("Token de acesso invalido");
          return;
        }
        setAgreement(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar acordo");
      } finally {
        setLoading(false);
      }
    };

    loadAgreement();
  }, [protocol, token]);

  const handleConfirm = async () => {
    if (!agreement) return;
    setActionLoading(true);
    try {
      await processPublicAgreementConfirmation(agreement.id, "accept");
      setAgreement({ ...agreement, status: "confirmed" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao confirmar acordo");
    } finally {
      setActionLoading(false);
    }
  };

  const handleContest = async () => {
    if (!agreement) return;
    setActionLoading(true);
    try {
      await processPublicAgreementConfirmation(agreement.id, "reject");
      setAgreement({ ...agreement, status: "contested" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao contestar acordo");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white mb-4">{error}</p>
          <Link href="/" className="text-emerald-500 hover:underline">
            Voltar para o inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!agreement) return null;

  const isPending = agreement.status === "pending_client_confirmation";
  const isActive = agreement.status === "confirmed";
  const isDisputed = agreement.status === "contested";

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-white">
              PreJud
            </Link>
            <div className="text-sm text-gray-400">
              Protocolo: <span className="font-mono text-emerald-500">{agreement.protocol}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1A1A1D] rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-emerald-500" />
                Proposta de Acordo
              </h1>
              <p className="text-gray-400 mt-2">
                Voce recebeu uma proposta de acordo profissional. Revise os detalhes abaixo.
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                  <FileText className="w-5 h-5" />
                  {agreement.title}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-500 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profissional
                  </label>
                  <p className="text-white bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3">
                    {agreement.freelancerName}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email do Profissional
                  </label>
                  <p className="text-white bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3">
                    {agreement.freelancerId}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-500 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Valor
                  </label>
                  <p className="text-white bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3">
                    R$ {agreement.value?.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Prazo de Entrega
                  </label>
                  <p className="text-white bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3">
                    {agreement.deadline ? new Date(agreement.deadline).toLocaleDateString("pt-BR") : "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-500">Descricao do Servico</label>
                <p className="text-gray-300 bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 min-h-[100px]">
                  {agreement.description}
                </p>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Status da Proposta</h3>
                
                {isPending && (
                  <div className="space-y-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <p className="text-yellow-500 text-center">
                        Aguardando sua confirmacao
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handleConfirm}
                        disabled={actionLoading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        Confirmar Acordo
                      </button>
                      <button
                        onClick={handleContest}
                        disabled={actionLoading}
                        className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        Contestar
                      </button>
                    </div>
                  </div>
                )}

                {isActive && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-emerald-500 justify-center">
                      <CheckCircle className="w-5 h-5" />
                      Acordo confirmado com sucesso!
                    </div>
                  </div>
                )}

                {isDisputed && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-500 justify-center">
                      <XCircle className="w-5 h-5" />
                      Acordo em disputa
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

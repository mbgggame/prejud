
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Clock4,
  Edit3,
  Send,
} from "lucide-react";

import { useAgreement } from "@/lib/hooks/useAgreement";
import { useFreelancerPermissions } from "@/lib/agreement/permissions";
import { AgreementStatusBadge } from "@/components/agreement/AgreementStatusBadge";
import { BlockedActionsList } from "@/components/agreement/BlockedActionsList";
import { Timeline } from "@/components/timeline";
import {
  ProrrogacaoModal,
  AditivoModal,
  CobrancaModal,
  NotificacaoModal,
} from "@/components/modals";
import {
  CreateDeadlineExtensionDTO,
  CreateAmendmentDTO,
  CreateChargeDTO,
  CreateNoticeDTO,
} from "@/types/agreement";

export default function AcordoDetalhePage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams();
  const agreementId = params.id as string;

  const {
    agreement,
    events,
    loading,
    error,
    requestDeadlineExtension,
    createAmendment,
    createCharge,
    sendNotice,
  } = useAgreement(agreementId);

  const permissions = useFreelancerPermissions(agreement?.status ?? "draft");

  const [showProrrogacao, setShowProrrogacao] = React.useState(false);
  const [showAditivo, setShowAditivo] = React.useState(false);
  const [showCobranca, setShowCobranca] = React.useState(false);
  const [showNotificacao, setShowNotificacao] = React.useState(false);

  const handleProrrogacao = async (data: { novoPrazo: string; motivo: string }) => {
    try {
      const payload: CreateDeadlineExtensionDTO = {
        agreementId,
        proposedDeadline: data.novoPrazo,
        reason: data.motivo,
      };
      await requestDeadlineExtension(payload);
      setShowProrrogacao(false);
    } catch (err) {
      alert("Erro ao solicitar prorrogacao: " + (err as Error).message);
    }
  };

  const handleAditivo = async (data: any) => {
    try {
      const payload: CreateAmendmentDTO = {
        agreementId,
        description: data.titulo || data.descricao || "Aditivo gerado",
        changes: {
          value: data.valor,
          deadline: data.prazo,
          terms: data.termos,
        },
      };
      await createAmendment(payload);
      setShowAditivo(false);
    } catch (err) {
      alert("Erro ao criar aditivo: " + (err as Error).message);
    }
  };

  const handleCobranca = async (data: any) => {
    try {
      const payload: CreateChargeDTO = {
        agreementId,
        amount: parseFloat(data.valor?.replace(/[^\d,]/g, "").replace(",", ".")) || 0,
        description: data.descricao || "Cobranca gerada",
        dueDate: data.dataVencimento,
      };
      await createCharge(payload);
      setShowCobranca(false);
    } catch (err) {
      alert("Erro ao criar cobranca: " + (err as Error).message);
    }
  };

  const handleNotificacao = async (data: any) => {
    try {
      const payload: CreateNoticeDTO = {
        agreementId,
        type: "general",
        title: data.assunto || "Notificacao formal",
        content: data.conteudo || data.mensagem || "",
      };
      await sendNotice(payload);
      setShowNotificacao(false);
    } catch (err) {
      alert("Erro ao enviar notificacao: " + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="text-red-400">{error || "Acordo nao encontrado"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Voltar ao dashboard</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">PreJud</span>
            </div>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <AgreementStatusBadge status={agreement.status} />
                <span className="text-xs text-gray-500 font-mono">{agreement.protocol}</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{agreement.title}</h1>
              <p className="text-gray-400">{agreement.serviceType}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Hash</p>
              <code className="text-xs text-emerald-400 font-mono">{agreement.hash}</code>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="text-white text-sm">{agreement.clientName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Valor</p>
                <p className="text-white text-sm">{agreement.value}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Prazo</p>
                <p className="text-white text-sm">{agreement.deadline}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tipo</p>
                <p className="text-white text-sm">{agreement.serviceType}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Acoes do caso</h2>

          <div className="flex flex-wrap gap-3 mb-4">
            {permissions.canRequestExtension && (
              <button
                onClick={() => setShowProrrogacao(true)}
                className="flex items-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-all"
              >
                <Clock4 className="w-4 h-4" />
                Prorrogar prazo
              </button>
            )}

            {permissions.canCreateAmendment && (
              <button
                onClick={() => setShowAditivo(true)}
                className="flex items-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Gerar aditivo
              </button>
            )}

            {permissions.canCreateCharge && (
              <button
                onClick={() => setShowCobranca(true)}
                className="flex items-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition-all"
              >
                <DollarSign className="w-4 h-4" />
                Criar cobranca
              </button>
            )}

            {permissions.canSendNotice && (
              <button
                onClick={() => setShowNotificacao(true)}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
              >
                <Send className="w-4 h-4" />
                Emitir notificacao
              </button>
            )}
          </div>

          <BlockedActionsList status={agreement.status} />
        </div>

        <Timeline events={events} title="Historico do caso" />
      </main>

      <ProrrogacaoModal
        isOpen={showProrrogacao}
        onClose={() => setShowProrrogacao(false)}
        onSubmit={handleProrrogacao}
        currentDeadline={agreement.deadline}
      />

      <AditivoModal
        isOpen={showAditivo}
        onClose={() => setShowAditivo(false)}
        onSubmit={handleAditivo}
      />

      <CobrancaModal
        isOpen={showCobranca}
        onClose={() => setShowCobranca(false)}
        onSubmit={handleCobranca}
        defaultValue={agreement.value}
      />

      <NotificacaoModal
        isOpen={showNotificacao}
        onClose={() => setShowNotificacao(false)}
        onSubmit={handleNotificacao}
      />
    </div>
  );
}
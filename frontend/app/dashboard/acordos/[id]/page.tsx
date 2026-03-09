﻿"use client";

import React from 'react';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Hash,
  Clock4,
  Edit3,
  Send,
} from "lucide-react";
import { AgreementStatus, TimelineEvent } from "@/types/agreement";
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

// ==========================================
// MOCK DE DADOS
// ==========================================

const mockAgreement = {
  id: "agr_123",
  title: "Desenvolvimento de Landing Page",
  freelancerId: "freelancer_1",
  freelancerName: "João Silva",
  clientName: "Maria Oliveira",
  clientEmail: "maria@empresa.com",
  clientDocument: "123.456.789-00",
  serviceType: "Desenvolvimento de site",
  description: "Criação de landing page institucional responsiva",
  value: "R$ 3.500,00",
  deadline: "15/04/2024",
  terms: "Entrega em 15 dias úteis. Inclui 2 revisões.",
  status: "confirmed" as AgreementStatus,
  protocol: "PRC-2024-001234",
  hash: "a3f5c8e9d2b1f4e7...",
  createdAt: "2024-03-01T10:00:00Z",
  updatedAt: "2024-03-01T10:00:00Z",
};

const mockTimeline: TimelineEvent[] = [
  {
    id: "evt_1",
    type: "agreement_created",
    actorType: "freelancer",
    actorName: "João Silva",
    createdAt: "2024-03-01T10:00:00Z",
    title: "Acordo criado",
    description: "O acordo foi registrado na plataforma.",
  },
  {
    id: "evt_2",
    type: "invitation_sent",
    actorType: "system",
    actorName: "PreJud",
    createdAt: "2024-03-01T10:05:00Z",
    title: "Convite enviado",
    description: "Um convite foi enviado ao cliente para confirmação.",
  },
  {
    id: "evt_3",
    type: "client_confirmed",
    actorType: "client",
    actorName: "Maria Oliveira",
    createdAt: "2024-03-02T14:30:00Z",
    title: "Acordo confirmado",
    description: "O cliente confirmou o acordo.",
  },
];

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function AcordoDetalhePage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams();
  const [showProrrogacao, setShowProrrogacao] = useState(false);
  const [showAditivo, setShowAditivo] = useState(false);
  const [showCobranca, setShowCobranca] = useState(false);
  const [showNotificacao, setShowNotificacao] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(mockTimeline);

  const permissions = useFreelancerPermissions(mockAgreement.status);

  const handleProrrogacao = (data: { novoPrazo: string; motivo: string }) => {
    const newEvent: TimelineEvent = {
      id: `evt_${Date.now()}`,
      type: "deadline_extension_requested",
      actorType: "freelancer",
      actorName: "João Silva",
      createdAt: new Date().toISOString(),
      title: "Prorrogação solicitada",
      description: `Novo prazo proposto: ${data.novoPrazo}. Motivo: ${data.motivo}`,
    };
    setTimeline([...timeline, newEvent]);
    setShowProrrogacao(false);
  };

  const handleAditivo = (data: any) => {
    const newEvent: TimelineEvent = {
      id: `evt_${Date.now()}`,
      type: "amendment_created",
      actorType: "freelancer",
      actorName: "João Silva",
      createdAt: new Date().toISOString(),
      title: "Aditivo gerado",
      description: data.titulo,
    };
    setTimeline([...timeline, newEvent]);
    setShowAditivo(false);
  };

  const handleCobranca = (data: any) => {
    const newEvent: TimelineEvent = {
      id: `evt_${Date.now()}`,
      type: "charge_created",
      actorType: "freelancer",
      actorName: "João Silva",
      createdAt: new Date().toISOString(),
      title: "Cobrança criada",
      description: `Valor: ${data.valor} - Vencimento: ${data.dataVencimento}`,
    };
    setTimeline([...timeline, newEvent]);
    setShowCobranca(false);
  };

  const handleNotificacao = (data: any) => {
    const newEvent: TimelineEvent = {
      id: `evt_${Date.now()}`,
      type: "notice_sent",
      actorType: "freelancer",
      actorName: "João Silva",
      createdAt: new Date().toISOString(),
      title: "Notificação enviada",
      description: data.assunto,
    };
    setTimeline([...timeline, newEvent]);
    setShowNotificacao(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      {/* HEADER */}
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

      {/* MAIN */}
      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* RESUMO DO CASO */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <AgreementStatusBadge status={mockAgreement.status} />
                <span className="text-xs text-gray-500 font-mono">{mockAgreement.protocol}</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{mockAgreement.title}</h1>
              <p className="text-gray-400">{mockAgreement.serviceType}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Hash</p>
              <code className="text-xs text-emerald-400 font-mono">{mockAgreement.hash}</code>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="text-white text-sm">{mockAgreement.clientName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Valor</p>
                <p className="text-white text-sm">{mockAgreement.value}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Prazo</p>
                <p className="text-white text-sm">{mockAgreement.deadline}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tipo</p>
                <p className="text-white text-sm">{mockAgreement.serviceType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Ações do caso</h2>

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
                Criar cobrança
              </button>
            )}

            {permissions.canSendNotice && (
              <button
                onClick={() => setShowNotificacao(true)}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
              >
                <Send className="w-4 h-4" />
                Emitir notificação
              </button>
            )}
          </div>

          <BlockedActionsList status={mockAgreement.status} />
        </div>

        {/* TIMELINE */}
        <Timeline events={timeline} title="Histórico do caso" />
      </main>

      {/* MODAIS */}
      <ProrrogacaoModal
        isOpen={showProrrogacao}
        onClose={() => setShowProrrogacao(false)}
        onSubmit={handleProrrogacao}
        currentDeadline={mockAgreement.deadline}
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
        defaultValue={mockAgreement.value}
      />

      <NotificacaoModal
        isOpen={showNotificacao}
        onClose={() => setShowNotificacao(false)}
        onSubmit={handleNotificacao}
      />
    </div>
  );
}

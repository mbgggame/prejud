"use client";

import React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  LogOut,
  User,
  Settings,
  ChevronDown,
  Clock,
  FileText,
  DollarSign,
  Bell,
  CheckCircle,
  Eye,
  History,
  ArrowRight,
  Sparkles,
  PlusCircle,
  Send,
  FileSignature,
  Wallet,
  Loader2,
} from "lucide-react";
import { useFreelancerDashboard } from "@/hooks/useFreelancerDashboard";
import type { AgreementStatus, Charge, Notice, Agreement } from "@/types/agreement";
// ==========================================
// TIPOS DA UI (preservados)
// ==========================================

type AcordoStatusUI =
  | "rascunho"
  | "aguardando_cliente"
  | "ativo"
  | "prorrogacao_pendente"
  | "aditivo_pendente"
  | "cobranca_pendente"
  | "disputa";

interface AcaoRapida {
  id: string;
  titulo: string;
  descricao: string;
  href?: string;
  onClick?: () => void;
  icon: "novo" | "convite" | "cobranca" | "notificacao";
}

interface AcordoFreela {
  id: string;
  titulo: string;
  cliente: string;
  valor?: string;
  prazo?: string;
  status: AcordoStatusUI;
  data: string;
}

interface CobrancaFreela {
  id: string;
  cliente: string;
  servico: string;
  valor: string;
  vencimento: string;
  status: "pendente" | "paga" | "contestada";
}

interface HistoricoItem {
  acao: string;
  data: string;
}

// ==========================================
// MAPEAMENTO DE STATUS
// ==========================================

function mapStatusToUI(backendStatus: AgreementStatus): AcordoStatusUI {
  const mapping: Record<AgreementStatus, AcordoStatusUI> = {
    draft: "rascunho",
    pending_client_confirmation: "aguardando_cliente",
    confirmed: "ativo",
    rejected: "disputa",
    contested: "disputa",
    in_adjustment: "aditivo_pendente",
    deadline_extension_pending: "prorrogacao_pendente",
    amendment_pending: "aditivo_pendente",
    charge_open: "cobranca_pendente",
    charge_contested: "disputa",
    notice_sent: "ativo",
    in_dispute: "disputa",
    closed: "ativo",
  };
  return mapping[backendStatus] || "rascunho";
}

function mapChargeStatusToUI(status: Charge["status"]): CobrancaFreela["status"] {
  switch (status) {
    case "paid":
      return "paga";
    case "contested":
      return "contestada";
    default:
      return "pendente";
  }
}

// ==========================================
// FORMATAÇÃO
// =========================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

// ==========================================
// COMPONENTES AUXILIARES (preservados)
// ==========================================

function BrazilClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm">
      <Clock size={12} className="text-slate-500" />
      <span className="font-medium">{time}</span>
      <span className="text-[10px] uppercase tracking-wide text-slate-400">
        BRT
      </span>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  description,
  tone = "slate",
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  description: string;
  tone?: "amber" | "emerald" | "orange" | "blue" | "slate";
}) {
  const toneMap = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneMap[tone]}`}
        >
          {icon}
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function FreelancerDashboardPage(): React.JSX.Element {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  // HOOK REAL — integração com Firestore
  const { data, loading, error, refresh } = useFreelancerDashboard(user?.uid);

  // MAPEAR DADOS REAIS PARA FORMATO DA UI
  const stats = useMemo(() => {
    if (loading || error) {
      // Fallback para mocks enquanto carrega
      return {
        rascunhos: 0,
        aguardandoCliente: 0,
        ativos: 0,
        cobrancasPendentes: 0,
      };
    }

    return {
      rascunhos: data.stats.totalAgreements - data.stats.activeAgreements - data.stats.pendingConfirmation,
      aguardandoCliente: data.stats.pendingConfirmation,
      ativos: data.stats.activeAgreements,
      cobrancasPendentes: data.stats.pendingValue > 0 ? 1 : 0, // Simplificado
    };
  }, [data, loading, error]);

  // MAPEAR ACORDOS
  const acordos: AcordoFreela[] = useMemo(() => {
    if (loading || error) return [];
    
      return data.agreements.slice(0, 5).map((agreement: Agreement) => ({
      id: agreement.id,
      titulo: agreement.title,
      cliente: agreement.clientName,
      valor: formatCurrency(agreement.value),
      prazo: formatDate(agreement.deadline),
      status: mapStatusToUI(agreement.status),
      data: formatDate(agreement.createdAt),
    }));
  }, [data.agreements, loading, error]);

  // MAPEAR COBRANÇAS
  const cobrancas: CobrancaFreela[] = useMemo(() => {
    if (loading || error) return [];

    return data.recentCharges.map((charge: Charge) => ({
      id: charge.id,
      cliente: "Cliente", // TODO: buscar nome do agreement
      servico: charge.description || "Serviço",
      valor: formatCurrency(charge.amount),
      vencimento: formatDate(charge.dueDate),
      status: mapChargeStatusToUI(charge.status),
    }));
  }, [data.recentCharges, loading, error]);

  // AÇÕES RÁPIDAS (preservadas)
  const acoesRapidas: AcaoRapida[] = [
    {
      id: "1",
      titulo: "Criar novo acordo",
      descricao: "Formalize um novo serviço com trilha verificável.",
      href: "/dashboard/formalizar-acordo",
      icon: "novo",
    },
    {
      id: "2",
      titulo: "Enviar convite ao cliente",
      descricao: "Compartilhe o acordo para aceite ou contestação.",
      href: "/dashboard/formalizar-acordo",
      icon: "convite",
    },
    {
      id: "3",
      titulo: "Gerar cobrança",
      descricao: "Crie uma cobrança vinculada a um acordo ativo.",
      onClick: () => console.log("Gerar cobrança"),
      icon: "cobranca",
    },
    {
      id: "4",
      titulo: "Emitir notificação",
      descricao: "Envie uma notificação formal registrada na timeline.",
      onClick: () => console.log("Emitir notificação"),
      icon: "notificacao",
    },
  ];

  // HISTÓRICO (mock por enquanto — pode vir de notices depois)
  const historico: HistoricoItem[] = useMemo(() => {
    if (loading || error || data.recentNotices.length === 0) {
      return [
        { acao: "Carregando histórico...", data: formatDate(new Date()) },
      ];
    }

    return data.recentNotices.slice(0, 5).map((notice: Notice) => ({
      acao: notice.title,
      data: formatDate(notice.sentAt),
    }));
  }, [data.recentNotices, loading, error]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getAcordoStatusColor = (status: AcordoStatusUI) => {
    switch (status) {
      case "rascunho":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "aguardando_cliente":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "ativo":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "prorrogacao_pendente":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "aditivo_pendente":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cobranca_pendente":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "disputa":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getAcordoStatusLabel = (status: AcordoStatusUI) => {
    switch (status) {
      case "rascunho":
        return "Rascunho";
      case "aguardando_cliente":
        return "Aguardando cliente";
      case "ativo":
        return "Ativo";
      case "prorrogacao_pendente":
        return "Prorrogação pendente";
      case "aditivo_pendente":
        return "Aditivo pendente";
      case "cobranca_pendente":
        return "Cobrança pendente";
      case "disputa":
        return "Em disputa";
      default:
        return status;
    }
  };

  const getCobrancaStatusColor = (status: CobrancaFreela["status"]) => {
    switch (status) {
      case "pendente":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "paga":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "contestada":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getAcaoIcon = (icon: AcaoRapida["icon"]) => {
    switch (icon) {
      case "novo":
        return <PlusCircle className="h-5 w-5 text-slate-700" />;
      case "convite":
        return <Send className="h-5 w-5 text-slate-700" />;
      case "cobranca":
        return <Wallet className="h-5 w-5 text-slate-700" />;
      case "notificacao":
        return <Bell className="h-5 w-5 text-slate-700" />;
      default:
        return <FileText className="h-5 w-5 text-slate-700" />;
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          <p className="text-sm text-slate-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-800">Erro ao carregar</p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER PRESERVADO */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-3 sm:min-h-[84px]">
            <div className="min-w-0 flex items-center gap-3 sm:gap-4">
              <Link
                href="/dashboard"
                className="group flex min-w-0 items-center gap-3"
              >
                <img
                  src="/prejud-logo-1200x300 preto.svg"
                  alt="PreJud"
                  className="h-7 w-auto object-contain transition group-hover:opacity-85 sm:h-8 lg:h-9"
                />

                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    Área do Freelancer
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    Painel de gestão de acordos
                  </p>
                </div>
              </Link>
            </div>

            <div className="hidden lg:block">
              <BrazilClock />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 sm:gap-3 sm:px-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                    <User size={16} className="text-slate-700" />
                  </div>

                  <div className="hidden text-left sm:block">
                    <p className="max-w-[140px] truncate text-sm font-semibold text-slate-900">
                      Freelancer
                    </p>
                    <p className="max-w-[180px] truncate text-xs text-slate-500">
                      {user?.email ?? "freela@email.com"}
                    </p>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">
                        Freelancer
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user?.email ?? "freela@email.com"}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <Sparkles size={16} />
                        Dashboard
                      </Link>

                      <Link
                        href="/configuracoes"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <Settings size={16} />
                        Configurações
                      </Link>

                      <div className="my-2 border-t border-slate-100" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pb-3 lg:hidden">
            <BrazilClock />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
        {/* HERO SECTION COM STATS REAIS */}
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/60" />
          <div className="relative p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Painel central do freelancer
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Crie, acompanhe e formalize seus acordos com clareza
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                  Seu fluxo principal começa aqui: criar acordo, enviar convite,
                  gerar cobrança, emitir notificação e acompanhar o status de
                  cada caso com leitura simples no desktop e no mobile.
                </p>
              </div>

              <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-5 lg:max-w-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                    <Send className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Prioridade do momento
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Você tem{" "}
                      <span className="font-semibold text-slate-900">
                        {stats.aguardandoCliente}
                      </span>{" "}
                      acordo(s) aguardando resposta do cliente.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* STATS REAIS */}
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              <StatCard
                icon={<FileText className="h-5 w-5" />}
                value={stats.rascunhos}
                label="Rascunhos"
                description="Aguardando envio"
                tone="slate"
              />
              <StatCard
                icon={<Send className="h-5 w-5" />}
                value={stats.aguardandoCliente}
                label="Aguardando cliente"
                description="Pendentes de resposta"
                tone="amber"
              />
              <StatCard
                icon={<CheckCircle className="h-5 w-5" />}
                value={stats.ativos}
                label="Acordos ativos"
                description="Em execução"
                tone="emerald"
              />
              <StatCard
                icon={<DollarSign className="h-5 w-5" />}
                value={stats.cobrancasPendentes}
                label="Cobranças pendentes"
                description="Acompanhamento financeiro"
                tone="orange"
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {/* AÇÕES RÁPIDAS (preservado) */}
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                    Ações rápidas
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Os atalhos mais importantes para operar o sistema
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  {acoesRapidas.length} ação(ões)
                </span>
              </div>

              <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2">
                {acoesRapidas.map((acao) => {
                  const cardContent = (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                        {getAcaoIcon(acao.icon)}
                      </div>

                      <h3 className="text-base font-semibold text-slate-900">
                        {acao.titulo}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {acao.descricao}
                      </p>

                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                        Abrir
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  );

                  if (acao.href) {
                    return (
                      <Link key={acao.id} href={acao.href}>
                        {cardContent}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={acao.id}
                      type="button"
                      onClick={acao.onClick}
                      className="text-left"
                    >
                      {cardContent}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ACORDOS REAIS */}
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Meus acordos
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Acompanhe o andamento dos acordos criados por você
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {acordos.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-slate-500">Nenhum acordo encontrado</p>
                    <Link
                      href="/dashboard/formalizar-acordo"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Criar primeiro acordo
                    </Link>
                  </div>
                ) : (
                  acordos.map((acordo) => (
                    <article key={acordo.id} className="p-5 sm:p-6">
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                              <FileSignature className="h-5 w-5 text-slate-700" />
                            </div>

                            <div className="min-w-0">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                                  {acordo.titulo}
                                </h3>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getAcordoStatusColor(
                                    acordo.status
                                  )}`}
                                >
                                  {getAcordoStatusLabel(acordo.status)}
                                </span>
                              </div>

                              <p className="text-sm leading-6 text-slate-500">
                                Cliente • {acordo.cliente} • {acordo.data}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={`/dashboard/acordos/${acordo.id}`}
                            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                          >
                            Ver detalhes
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>

                        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                              Cliente
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {acordo.cliente}
                            </p>
                          </div>

                          {acordo.valor && (
                            <div>
                              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                Valor
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {acordo.valor}
                              </p>
                            </div>
                          )}

                          {acordo.prazo && (
                            <div>
                              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                Prazo
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {acordo.prazo}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                          <Link
                            href={`/dashboard/acordos/${acordo.id}`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                          >
                            <Eye className="h-4 w-4" />
                            Abrir acordo
                          </Link>

                          <button
                            type="button"
                            onClick={() => console.log("Gerar cobrança:", acordo.id)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                          >
                            <DollarSign className="h-4 w-4" />
                            Gerar cobrança
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              console.log("Emitir notificação:", acordo.id)
                            }
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 sm:w-auto"
                          >
                            <Bell className="h-4 w-4" />
                            Emitir notificação
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            {/* COBRANÇAS REAIS */}
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Cobranças recentes
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Visão rápida das cobranças vinculadas aos seus acordos
                </p>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                {cobrancas.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="text-sm text-slate-500">Nenhuma cobrança encontrada</p>
                  </div>
                ) : (
                  cobrancas.map((cobranca) => (
                    <div
                      key={cobranca.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            {cobranca.servico}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Cliente: {cobranca.cliente}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getCobrancaStatusColor(
                            cobranca.status
                          )}`}
                        >
                          {cobranca.status === "pendente"
                            ? "Pendente"
                            : cobranca.status === "paga"
                            ? "Paga"
                            : "Contestada"}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Valor
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {cobranca.valor}
                          </p>
                        </div>

                        <div>
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Vencimento
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {cobranca.vencimento}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR PRESERVADA */}
          <aside className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Resumo rápido
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Visão geral da sua operação como freelancer
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Rascunhos</span>
                  <span className="text-sm font-bold text-slate-900">
                    {stats.rascunhos}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">
                    Aguardando cliente
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {stats.aguardandoCliente}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Acordos ativos</span>
                  <span className="text-sm font-bold text-slate-900">
                    {stats.ativos}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">
                    Cobranças pendentes
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {stats.cobrancasPendentes}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Histórico recente
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Últimas movimentações da sua conta
              </p>

              <div className="mt-5 space-y-3">
                {historico.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
                      <History className="h-4 w-4 text-slate-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-6 text-slate-800">
                        {item.acao}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{item.data}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-blue-200 bg-blue-50 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-white">
                  <Sparkles className="h-5 w-5 text-blue-700" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Operação simplificada
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    O painel do freelancer foi organizado para priorizar
                    criação, acompanhamento de acordos e gestão de cobrança.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Acesso rápido
              </h2>
              <div className="mt-4 space-y-3">
                <Link
                  href="/dashboard/formalizar-acordo"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                  <span>Criar novo acordo</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {acordos[0] && (
                  <Link
                    href={`/dashboard/acordos/${acordos[0].id}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                  >
                    <span>Último acordo aberto</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
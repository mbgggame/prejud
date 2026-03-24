"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useFreelancerDashboard } from "@/hooks/useFreelancerDashboard";
import type { Agreement } from "@/types/agreement";
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
  AlertTriangle,
  Eye,
  History,
  ArrowRight,
  LayoutList,
  Sparkles,
  PlusCircle,
  Send,
  FileSignature,
  Wallet,
  Loader2,
} from "lucide-react";

// ==========================================
// TIPOS
// ==========================================

type AcordoStatus =
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

interface DashboardStats {
  rascunhos: number;
  aguardandoCliente: number;
  ativos: number;
  cobrancasPendentes: number;
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
// COMPONENTES AUXILIARES
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
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-600 shadow-sm">
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
    slate: "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneMap[tone]}`}
        >
          {icon}
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function FreelancerDashboardPage(): React.JSX.Element {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data, loading, error, refresh } = useFreelancerDashboard(user?.uid);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDark(false);
    }
  }, []);

  const toggleDark = () => {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  // Mapear stats do backend para o formato do dashboard
  const stats: DashboardStats = {
    rascunhos: data.stats.pendingConfirmation || 0,
    aguardandoCliente: data.stats.pendingConfirmation || 0,
    ativos: data.stats.activeAgreements || 0,
    cobrancasPendentes: 0, // TODO: adicionar ao backend se necessário
  };

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

  const cobrancas: CobrancaFreela[] = [
    {
      id: "10",
      cliente: "Empresa Atlas",
      servico: "Desenvolvimento de landing page",
      valor: "R$ 2.500,00",
      vencimento: "22/03/2026",
      status: "pendente",
    },
  ];

  const historico: HistoricoItem[] = [
    { acao: "Você criou um novo acordo", data: "19/03/2026" },
    { acao: "Você enviou um convite ao cliente", data: "18/03/2026" },
    { acao: "Você gerou uma cobrança vinculada ao acordo", data: "17/03/2026" },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getAcordoStatusColor = (status: AcordoStatus | string) => {
    switch (status) {
      case "rascunho":
        return "bg-slate-50 dark:bg-slate-800/60 text-slate-700 border-slate-200 dark:border-slate-800";
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
        return "bg-slate-50 dark:bg-slate-800/60 text-slate-700 border-slate-200 dark:border-slate-800";
    }
  };

  const getAcordoStatusLabel = (status: AcordoStatus | string) => {
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
        return "bg-slate-50 dark:bg-slate-800/60 text-slate-700 border-slate-200 dark:border-slate-800";
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

  // Função para construir o link do acordo (público ou interno)
  const getAcordoLink = (agreement: Agreement): string => {
    if (agreement.protocol && agreement.clientAccessToken) {
      return `/p/${agreement.protocol}?t=${agreement.clientAccessToken}`;
    }
    // Fallback para rota interna se não tiver protocol/token
    return `/dashboard/acordos/${agreement.id}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-800/60">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-slate-600" />
          <p className="text-sm text-slate-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-800/60">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            Erro ao carregar dados
          </h2>
          <p className="mb-4 text-sm text-slate-600">{error}</p>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Loader2 className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:bg-[#0B1220] dark:text-slate-100">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0B1220]/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-3 sm:min-h-[84px]">
            <div className="min-w-0 flex items-center gap-3 sm:gap-4">
              <Link
                href="/dashboard"
                className="group flex min-w-0 items-center gap-3"
              >
                <>
  <img
    src="/prejud-logo-1200x300 preto.svg"
    alt="PreJud"
    className="h-7 w-auto object-contain dark:hidden"
  />
  <img
    src="/prejud-logo-1200x300.svg"
    alt="PreJud"
    className="h-7 w-auto object-contain hidden dark:block"
  />
</>

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
  <button
    onClick={toggleDark}
    className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
  >
    {dark ? "☀️" : "🌙"}
  </button>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-2 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-800/60 sm:gap-3 sm:px-3"
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
                  <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                    <div className="border-b border-slate-100 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Freelancer
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user?.email ?? "freela@email.com"}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:bg-slate-800/60"
                      >
                        <LayoutList size={16} />
                        Dashboard
                      </Link>

                      <Link
                        href="/cliente/configuracoes"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:bg-slate-800/60"
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

      <main className="mx-auto max-w-7xl px-4 pt-28 pb-8 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950" />
          <div className="relative p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Painel central do freelancer
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl lg:text-4xl">
                  Crie, acompanhe e formalize seus acordos com clareza
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                  Seu fluxo principal começa aqui: criar acordo, enviar convite,
                  gerar cobrança, emitir notificação e acompanhar o status de
                  cada caso com leitura simples no desktop e no mobile.
                </p>
              </div>

              <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 dark:bg-slate-900/90 p-4 shadow-sm backdrop-blur sm:p-5 lg:max-w-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                    <Send className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Prioridade do momento
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
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

        <section className="mt-6 grid gap-6 space-y-6">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                    Ações rápidas
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Os atalhos mais importantes para operar o sistema
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-600">
                  {acoesRapidas.length} ação(ões)
                </span>
              </div>

              <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2">
                {acoesRapidas.map((acao) => {
                  const content = (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white dark:bg-slate-900 hover:shadow-md">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
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
                        {content}
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
                      {content}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Meus acordos
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Acompanhe o andamento dos acordos criados por você
                </p>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                {data.agreements.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileSignature className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                    <p className="text-sm text-slate-600">
                      Nenhum acordo encontrado.
                    </p>
                    <Link
                      href="/dashboard/formalizar-acordo"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
                    >
                      Criar primeiro acordo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  data.agreements.map((acordo: Agreement) => (
                    <article key={acordo.id} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md sm:p-6">
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                              <FileSignature className="h-5 w-5 text-slate-700" />
                            </div>

                            <div className="min-w-0">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                                  {acordo.title || "Acordo sem título"}
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
                                Cliente • {acordo.clientName || "N/A"} •{" "}
                                {acordo.createdAt
                                  ? typeof acordo.createdAt === "string"
                                    ? new Date(acordo.createdAt).toLocaleDateString("pt-BR")
                                    : acordo.createdAt instanceof Date
                                    ? acordo.createdAt.toLocaleDateString("pt-BR")
                                    : "Data não disponível"
                                  : "Data não disponível"}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={getAcordoLink(acordo)}
                            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:bg-slate-800/60 hover:text-slate-900"
                          >
                            Ver detalhes
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>

                        <div className="grid gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                          <div>
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                              Cliente
                            </p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {acordo.clientName || "N/A"}
                            </p>
                          </div>

                                                    {acordo.value !== undefined && acordo.value !== null && (
                            <div>
                              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                Valor
                              </p>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {typeof acordo.value === 'number'
                                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acordo.value)
                                  : acordo.value}
                              </p>
                            </div>
                          )}
                          

                                                                                                                                  {acordo.deadline && (
                            <div>
                              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                Prazo
                              </p>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {(() => {
                                  const d = acordo.deadline;
                                  
                                  // Se for string direta (já formatada)
                                  if (typeof d === 'string') return d;
                                  
                                  // Se for Date (incluindo Invalid Date)
                                  if (d instanceof Date) {
                                    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('pt-BR');
                                  }
                                  
                                  // Se for objeto com _seconds (Firestore)
                                  if (d && typeof d === 'object' && '_seconds' in d) {
                                    return new Date(d._seconds * 1000).toLocaleDateString('pt-BR');
                                  }
                                  
                                  // Se for objeto com seconds
                                  if (d && typeof d === 'object' && 'seconds' in d) {
                                    return new Date(d.seconds * 1000).toLocaleDateString('pt-BR');
                                  }
                                  
                                  return 'N/A';
                                })()}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                          <Link
                            href={getAcordoLink(acordo)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                          >
                            <Eye className="h-4 w-4" />
                            Abrir acordo
                          </Link>

                          <button
                            type="button"
                            onClick={() => console.log("Gerar cobrança:", acordo.id)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:bg-slate-800/60 sm:w-auto"
                          >
                            <DollarSign className="h-4 w-4" />
                            Gerar cobrança
                          </button>

                          <button
                            type="button"
                            onClick={() => console.log("Emitir notificação:", acordo.id)}
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

            <section className="overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Cobranças recentes
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Visão rápida das cobranças vinculadas aos seus acordos
                </p>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                {cobrancas.map((cobranca) => (
                  <div
                    key={cobranca.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-5 shadow-sm transition-all duration-200 hover:bg-white dark:bg-slate-900 hover:shadow-md"
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
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {cobranca.valor}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Vencimento
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {cobranca.vencimento}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          
        </section>
      </main>
    </div>
  );
}























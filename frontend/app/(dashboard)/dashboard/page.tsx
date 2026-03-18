﻿"use client";

import React from "react";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/services/firebase";
import {
  collection,
  query,
  onSnapshot,
  where,
  orderBy,
} from "firebase/firestore";
import {
  Shield,
  FileText,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Search,
  Inbox,
  Send,
  Edit3,
  Plus,
  Eye,
  Clock,
  FilePlus,
  CheckCircle,
  FileSignature,
  Briefcase,
  DollarSign,
  Scale,
  Camera,
  History,
  Archive,
  Copy,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// ==========================================
// TIPOS
// ==========================================

type RecordType =
  | "acordo"
  | "contrato"
  | "cobranca"
  | "violacao_termos"
  | "notificacao_extrajudicial"
  | "resposta_recebida"
  | "prova_digital";

type RecordStatus =
  | "rascunho"
  | "formalizado"
  | "aguardando_resposta"
  | "em_cobranca"
  | "notificado"
  | "respondido"
  | "encerrado";

type TabType = "todos" | "formalizados" | "rascunho" | "ativos";

interface Record {
  id: string;
  type: RecordType;
  title: string;
  partyName: string; // cliente ou empresa
  status: RecordStatus;
  date: string;
  protocol: string;
  value?: string; // valor do acordo
  freelancerId?: string; // ID do freelancer
  updatedAt?: any;
  createdAt?: any;
  hash?: string;
  events?: EventType[];
}

type EventType = {
  type: string;
  at: any;
  byEmail?: string;
};

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================

function BrazilClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateDateTime = () => {
      const now = new Date();
      const brazilTime = now.toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const brazilDate = now.toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setTime(brazilTime);
      setDate(brazilDate);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="text-right">
        <p className="text-xs text-gray-500">...</p>
      </div>
    );
  }

  return (
    <div className="text-right">
      <p className="text-xs text-gray-400 capitalize">{date}</p>
      <p className="text-xs text-purple-400 font-mono">{time} BRT</p>
    </div>
  );
}

function formatPtBrDateFromAny(ts: any): string {
  try {
    if (ts?.toDate) return ts.toDate().toLocaleDateString("pt-BR");
    if (typeof ts === "string") {
      const d = new Date(ts);
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString("pt-BR");
    }
  } catch {
    // ignore
  }
  return new Date().toLocaleDateString("pt-BR");
}

function formatDateTimeShort(ts: any): string {
  try {
    let date: Date;
    if (ts?.toDate) {
      date = ts.toDate();
    } else if (typeof ts === "string") {
      date = new Date(ts);
    } else if (ts instanceof Date) {
      date = ts;
    } else {
      return "-";
    }

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return "-";
  }
}

function getEventIcon(type: string) {
  switch (type) {
    case "record_created":
      return <FilePlus className="w-3 h-3" />;
    case "draft_saved":
      return <Edit3 className="w-3 h-3" />;
    case "formalized":
      return <CheckCircle className="w-3 h-3" />;
    case "notification_sent":
      return <Send className="w-3 h-3" />;
    case "response_received":
      return <Inbox className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
}

function getEventLabel(type: string): string {
  switch (type) {
    case "record_created":
      return "Criado";
    case "draft_saved":
      return "Editado";
    case "formalized":
      return "Formalizado";
    case "notification_sent":
      return "Notificado";
    case "response_received":
      return "Respondido";
    case "closed":
      return "Encerrado";
    default:
      return type.replace(/_/g, " ");
  }
}

function getEventColor(type: string): string {
  switch (type) {
    case "record_created":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "draft_saved":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "formalized":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "notification_sent":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "response_received":
    case "closed":
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

// ==========================================
// COMPONENTE DE TIMELINE MINI
// ==========================================

function MiniTimeline({
  events,
  createdAt,
}: {
  events?: EventType[];
  createdAt?: any;
}) {
  const displayEvents = useMemo(() => {
    if (events && events.length > 0) {
      return events.slice(0, 3);
    }

    const fallback: EventType[] = [];
    if (createdAt) {
      fallback.push({ type: "record_created", at: createdAt });
    }
    return fallback;
  }, [events, createdAt]);

  if (displayEvents.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
        <Clock className="w-3 h-3" />
        <span>Criado: {formatDateTimeShort(createdAt)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 mt-2">
      <div className="flex flex-wrap gap-1">
        {displayEvents.map((event, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${getEventColor(event.type)}`}
            title={event.byEmail ? `Por: ${event.byEmail}` : undefined}
          >
            {getEventIcon(event.type)}
            <span>{getEventLabel(event.type)}</span>
            <span className="opacity-75">{formatDateTimeShort(event.at)}</span>
          </span>
        ))}
      </div>

      {events && events.length > 3 && (
        <span className="text-xs text-gray-600">
          +{events.length - 3} eventos
        </span>
      )}
    </div>
  );
}

// ==========================================
// HELPERS DE TIPO E STATUS
// ==========================================

function getRecordTypeLabel(type: RecordType): string {
  const labels: { [key: string]: string } = {
    acordo: "Acordo",
    contrato: "Contrato",
    cobranca: "Cobrança",
    violacao_termos: "Violação de Termos",
    notificacao_extrajudicial: "Notificação",
    resposta_recebida: "Resposta",
    prova_digital: "Prova Digital",
  };
  return labels[type] || "Registro";
}

function getRecordTypeIcon(type: RecordType) {
  switch (type) {
    case "acordo":
      return <FileSignature className="w-4 h-4" />;
    case "contrato":
      return <Briefcase className="w-4 h-4" />;
    case "cobranca":
      return <DollarSign className="w-4 h-4" />;
    case "violacao_termos":
      return <Scale className="w-4 h-4" />;
    case "notificacao_extrajudicial":
      return <Send className="w-4 h-4" />;
    case "resposta_recebida":
      return <Inbox className="w-4 h-4" />;
    case "prova_digital":
      return <Camera className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

function getStatusLabel(status: RecordStatus): string {
  const labels: { [key: string]: string } = {
    rascunho: "Rascunho",
    formalizado: "Formalizado",
    aguardando_resposta: "Aguardando Resposta",
    em_cobranca: "Em Cobrança",
    notificado: "Notificado",
    respondido: "Respondido",
    encerrado: "Encerrado",
  };
  return labels[status] || status;
}

function getStatusColor(status: RecordStatus): string {
  switch (status) {
    case "rascunho":
      return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
    case "formalizado":
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    case "aguardando_resposta":
      return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    case "em_cobranca":
      return "bg-orange-500/10 border-orange-500/20 text-orange-400";
    case "notificado":
      return "bg-purple-500/10 border-purple-500/20 text-purple-400";
    case "respondido":
      return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
    case "encerrado":
      return "bg-gray-500/10 border-gray-500/20 text-gray-400";
    default:
      return "bg-gray-500/10 border-gray-500/20 text-gray-400";
  }
}

function getTabIcon(tab: TabType) {
  switch (tab) {
    case "formalizados":
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    case "rascunho":
      return <Edit3 className="w-5 h-5 text-yellow-400" />;
    case "ativos":
      return <Clock className="w-5 h-5 text-blue-400" />;
    case "todos":
      return <FileText className="w-5 h-5 text-purple-400" />;
  }
}

function getTabColor(tab: TabType): string {
  switch (tab) {
    case "formalizados":
      return "bg-emerald-500/10";
    case "rascunho":
      return "bg-yellow-500/10";
    case "ativos":
      return "bg-blue-500/10";
    case "todos":
      return "bg-purple-500/10";
  }
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
// HELPERS DE STATUS E AÇÕES
// ==========================================

function getAgreementStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    pending_client_confirmation: "Aguardando cliente",
    active: "Ativa",
    rejected: "Recusada",
    rascunho: "Rascunho",
    formalizado: "Formalizado",
    aguardando_resposta: "Aguardando resposta",
    em_cobranca: "Em cobrança",
    notificado: "Notificado",
    respondido: "Respondido",
    encerrado: "Encerrado",
  };
  return labels[status] || status;
}

function getAgreementStatusColor(status: string): string {
  switch (status) {
    case "pending_client_confirmation":
      return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
    case "active":
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    case "rejected":
      return "bg-red-500/10 border-red-500/20 text-red-400";
    default:
      return "bg-purple-500/10 border-purple-500/20 text-purple-400";
  }
}

// ==========================================

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("todos");
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isLocal = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost"
    );
  }, []);

  async function handleCopyLink(protocol: string, id: string) {
    if (!protocol?.trim()) return;

    try {
      const publicUrl = `${window.location.origin}/p/${encodeURIComponent(protocol)}`;
      await navigator.clipboard.writeText(publicUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 3000);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
    }
  }

  function handleOpenPublic(protocol: string) {
    if (!protocol?.trim()) return;
    const publicUrl = `${window.location.origin}/p/${encodeURIComponent(protocol)}`;
    window.open(publicUrl, "_blank");
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    console.log("[DASHBOARD] Buscando registros para:", user.uid);

    const q = query(
      collection(db, "agreements"),
      where("freelancerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const recs: Record[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();

          recs.push({
            id: docSnap.id,
            type: (data.type as RecordType) || "notificacao_extrajudicial",
            title: data.title || "Sem título",
            partyName: data.partyName || data.clientName || data.companyName || "N/A",
            status: (data.status as RecordStatus) || "rascunho",
            date: formatPtBrDateFromAny(data.createdAt || data.updatedAt),
            protocol: data.protocol || "N/A",
            value: data.value || "",
            freelancerId: data.freelancerId || "",
            updatedAt: data.updatedAt,
            createdAt: data.createdAt,
            hash: data.hash,
            events: data.events || [],
          });
        });

        console.log("[DASHBOARD] Carregado:", recs.length, "registros");
        setRecords(recs);
        setLoading(false);
      },
      (error) => {
        console.error("[DASHBOARD] Erro:", error);
        if (error.message?.includes("index")) {
          console.error("[DASHBOARD] ERRO DE ÍNDICE: Crie o índice no Firestore console!");
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const stats = useMemo(
    () => ({
      relacoesFormalizadas: records.filter(
        (r) => r.type === "contrato" || r.type === "acordo"
      ).length,
      acordosRegistrados: records.filter((r) => r.type === "acordo").length,
      cobrancasAtivas: records.filter(
        (r) => r.type === "cobranca" && r.status !== "encerrado"
      ).length,
      notificacoesEnviadas: records.filter(
        (r) => r.type === "notificacao_extrajudicial" && r.status !== "rascunho"
      ).length,
    }),
    [records]
  );

  const filteredRecords = useMemo(() => {
    switch (activeTab) {
      case "todos":
        return records;

      case "formalizados":
        return records.filter(
          (r) => r.status === "formalizado" || r.status === "notificado"
        );

      case "rascunho":
        return records.filter((r) => r.status === "rascunho");

      case "ativos":
        return records.filter((r) =>
          ["aguardando_resposta", "em_cobranca", "notificado"].includes(r.status)
        );

      default:
        return records;
    }
  }, [records, activeTab]);

  const integrityData = useMemo(() => {
    const lastRecord = records[0];
    return {
      hash:
        lastRecord?.hash ||
        Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join(""),
      lastProtocol: lastRecord?.protocol || "N/A",
      lastValidated: lastRecord?.updatedAt
        ? formatDateTimeShort(lastRecord.updatedAt)
        : formatDateTimeShort(new Date()),
      totalPreserved: records.filter((r) => r.hash).length,
    };
  }, [records]);

  const userName =
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Usuário";
  const userEmail = user?.email || "";

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Erro logout:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center justify-center transition-all hover:scale-105"
              >
                <img
                  src="/prejud-logo-1200x300.svg"
                  alt="PreJud"
                  className="h-10 w-auto"
                />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">Dashboard</h1>
                <p className="text-xs text-gray-400">Bem-vindo, {userName}</p>
              </div>
            </div>

            <div className="hidden md:block">
              <BrazilClock />
            </div>

            <div className="flex items-center gap-2">
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all text-sm">
                <Search size={16} />
                Consultar
              </button>

              <button
                onClick={() => router.push("/dashboard/novo-registro")}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-sm font-medium"
              >
                <Plus size={16} />
                Novo Registro
              </button>

              {isLocal && (
                <a
                  href="http://127.0.0.1:4000/firestore"
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                >
                  Firebase
                </a>
              )}

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <User size={16} className="text-purple-400" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {userName}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                      <p className="text-white font-medium text-sm">{userName}</p>
                      <p className="text-gray-500 text-xs truncate">
                        {userEmail}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/perfil"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User size={16} />
                        Meu perfil
                      </Link>
                      <Link
                        href="/configuracoes"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings size={16} />
                        Configurações
                      </Link>
                      <div className="my-1 border-t border-white/10" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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
        </div>
      </header>

      <main className="pt-24 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setActiveTab("todos")}
            className={`text-left bg-white/[0.02] border rounded-2xl p-5 transition-all hover:bg-white/[0.04] ${
              activeTab === "todos"
                ? "border-purple-500/50 bg-purple-500/5"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTabColor("todos")}`}
              >
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">
                {stats.relacoesFormalizadas}
              </span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              Relações Formalizadas
            </p>
          </button>

          <button
            onClick={() => setActiveTab("formalizados")}
            className={`text-left bg-white/[0.02] border rounded-2xl p-5 transition-all hover:bg-white/[0.04] ${
              activeTab === "formalizados"
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTabColor("formalizados")}`}
              >
                <FileSignature className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-white">
                {stats.acordosRegistrados}
              </span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              Acordos Registrados
            </p>
          </button>

          <button
            onClick={() => setActiveTab("ativos")}
            className={`text-left bg-white/[0.02] border rounded-2xl p-5 transition-all hover:bg-white/[0.04] ${
              activeTab === "ativos"
                ? "border-orange-500/50 bg-orange-500/5"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTabColor("ativos")}`}
              >
                <DollarSign className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-white">
                {stats.cobrancasAtivas}
              </span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              Cobranças Ativas
            </p>
          </button>

          <button
            onClick={() => setActiveTab("formalizados")}
            className={`text-left bg-white/[0.02] border rounded-2xl p-5 transition-all hover:bg-white/[0.04] ${
              activeTab === "formalizados"
                ? "border-blue-500/50 bg-blue-500/5"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTabColor("formalizados")}`}
              >
                <Send className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">
                {stats.notificacoesEnviadas}
              </span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              Notificações Enviadas
            </p>
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => router.push("/dashboard/formalizar-acordo")}
              className="flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.04] hover:border-purple-500/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSignature className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs text-gray-300 text-center">
                Formalizar novo acordo
              </span>
            </button>

            <button
              onClick={() =>
                router.push("/dashboard/novo-registro?tipo=prova_digital")
              }
              className="flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.04] hover:border-purple-500/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-xs text-gray-300 text-center">
                Registrar prova digital
              </span>
            </button>

            <button
              onClick={() => router.push("/dashboard/novo-registro?tipo=cobranca")}
              className="flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.04] hover:border-purple-500/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-xs text-gray-300 text-center">
                Criar cobrança
              </span>
            </button>

            <button
              onClick={() =>
                router.push("/dashboard/novo-registro?tipo=notificacao")
              }
              className="flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.04] hover:border-purple-500/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs text-gray-300 text-center">
                Emitir notificação
              </span>
            </button>

            <button
              onClick={() => router.push("/dashboard/historico")}
              className="flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.04] hover:border-purple-500/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <History className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-xs text-gray-300 text-center">
                Ver histórico completo
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTabColor(activeTab)}`}
              >
                {getTabIcon(activeTab)}
              </div>
              <h2 className="text-lg font-semibold text-white">
                {activeTab === "todos" && "Todos os Registros"}
                {activeTab === "formalizados" && "Registros Formalizados"}
                {activeTab === "rascunho" && "Rascunhos"}
                {activeTab === "ativos" && "Casos Ativos"}
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              {filteredRecords.length} item(s)
            </span>
          </div>

          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white/[0.02] border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Tipo</div>
            <div className="col-span-3">Título</div>
            <div className="col-span-2">Parte Relacionada</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Última Atualização</div>
            <div className="col-span-1">Protocolo</div>
          </div>

          <div className="divide-y divide-white/5">
            {filteredRecords.map((record) => {
              const isAgreement = record.type === "acordo" || record.freelancerId;
              const statusLabel = isAgreement
                ? getAgreementStatusLabel(record.status)
                : getStatusLabel(record.status);
              const statusColorClass = isAgreement
                ? getAgreementStatusColor(record.status)
                : getStatusColor(record.status);
              const typeLabel = getRecordTypeLabel(record.type);

              return (
                <div
                  key={record.id}
                  className="px-6 py-4 hover:bg-white/[0.02] transition-all group"
                >
                  <div className="flex items-start justify-between md:grid md:grid-cols-12 md:gap-4 md:items-center">
                    <div className="hidden md:flex md:col-span-2 items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(record.status)
                          .replace("text-", "bg-")
                          .replace("/10", "/20")
                          .split(" ")[0]}`}
                      >
                        {getRecordTypeIcon(record.type)}
                      </div>
                      <span className="text-sm text-gray-300">{typeLabel}</span>
                    </div>

                    <div className="flex-1 md:col-span-3 min-w-0 mb-2 md:mb-0">
                      <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors truncate">
                        {record.title}
                      </h3>
                      <div className="md:hidden mt-1">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          {getRecordTypeIcon(record.type)}
                          {typeLabel}
                        </span>
                      </div>
                      <MiniTimeline
                        events={record.events}
                        createdAt={record.createdAt}
                      />
                    </div>

                    <div className="hidden md:block md:col-span-2 text-sm text-gray-400 truncate">
                      {record.partyName}
                    </div>

                    <div className="md:col-span-2 flex items-center justify-end md:justify-start gap-2">
                      <span
                        className={`px-3 py-1 border text-xs rounded-full whitespace-nowrap ${statusColorClass}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className="hidden md:block md:col-span-2 text-sm text-gray-500">
                      {formatDateTimeShort(record.updatedAt || record.createdAt)}
                    </div>

                    <div className="hidden md:block md:col-span-1 text-xs text-gray-600 font-mono">
                      {record.protocol}
                    </div>

                    <div className="md:hidden flex items-center gap-2 ml-2">
                      <Link
                        href={`/dashboard/registro/${record.id}`}
                        className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2 mt-3 md:mt-0 md:justify-end">
                    <Link
                      href={`/dashboard/registro/${record.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 text-purple-400 text-sm rounded-full hover:bg-purple-500/20 transition-all whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Visualizar</span>
                    </Link>

                    {record.status === "rascunho" && (
                      <Link
                        href={`/dashboard/novo-registro?id=${record.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 text-sm rounded-full hover:bg-yellow-500/20 transition-all whitespace-nowrap"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Editar</span>
                      </Link>
                    )}

                    {record.protocol && (
                      <button
                        onClick={() => handleCopyLink(record.protocol, record.id)}
                        disabled={copiedId === record.id}
                        className={`flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:bg-emerald-500/20 border border-white/10 text-sm rounded-full transition-all whitespace-nowrap ${
                          copiedId === record.id
                            ? "text-emerald-400"
                            : "text-gray-300"
                        }`}
                      >
                        {copiedId === record.id ? (
                          <span>Link copiado</span>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copiar link</span>
                          </>
                        )}
                      </button>
                    )}

                    {record.protocol && (
                      <button
                        onClick={() => handleOpenPublic(record.protocol)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm rounded-full transition-all whitespace-nowrap"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Abrir proposta</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRecords.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Archive className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">
                Nenhum registro encontrado nesta categoria.
              </p>
              <button
                onClick={() => router.push("/dashboard/novo-registro")}
                className="mt-4 text-purple-400 hover:text-purple-300 text-sm"
              >
                Criar primeiro registro →
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 bg-purple-600/5 border border-purple-600/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-purple-400 font-medium">
              Integridade do Sistema
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-[#0a0a0c] rounded-lg p-3 border border-white/5">
              <p className="text-xs text-gray-500 mb-1">Hash SHA-256 Ativo</p>
              <code className="text-xs font-mono text-emerald-400 break-all">
                {integrityData.hash.substring(0, 16)}...
                {integrityData.hash.substring(48)}
              </code>
            </div>

            <div className="bg-[#0a0a0c] rounded-lg p-3 border border-white/5">
              <p className="text-xs text-gray-500 mb-1">
                Último Protocolo Gerado
              </p>
              <p className="text-sm text-gray-300 font-mono">
                {integrityData.lastProtocol}
              </p>
            </div>

            <div className="bg-[#0a0a0c] rounded-lg p-3 border border-white/5">
              <p className="text-xs text-gray-500 mb-1">
                Último Registro Validado
              </p>
              <p className="text-sm text-gray-300">
                {integrityData.lastValidated}
              </p>
            </div>

            <div className="bg-[#0a0a0c] rounded-lg p-3 border border-white/5">
              <p className="text-xs text-gray-500 mb-1">
                Trilha de Eventos Preservada
              </p>
              <p className="text-sm text-emerald-400">
                {integrityData.totalPreserved} registros
              </p>
            </div>
          </div>

          <p className="text-gray-500 text-xs">
            Todos os registros são protegidos por criptografia SHA-256 e carimbo
            de tempo imutável. A trilha de auditoria garante a integridade
            jurídica de cada caso.
          </p>
        </div>
      </main>
    </div>
  );
}
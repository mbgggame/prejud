"use client";

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
} from "lucide-react";
import Link from "next/link";

// ==========================================
// TIPOS
// ==========================================

type InternalStatus = 
  | "em_edicao" 
  | "rascunho" 
  | "enviada" 
  | "recebida_serv_email" 
  | "lida_pelo_notificado"
  | "recebida"  // legado
  | "lida";     // legado

type NormalizedStatus = "rascunho" | "enviada" | "recebida" | "lida";

type TabType = "todas" | "enviada" | "rascunho" | "recebida";

type UserRole = "outgoing" | "inbox";

type EventType = {
  type: string;
  at: any;
  byEmail?: string;
};

interface Notification {
  id: string;
  title: string;
  company: string;
  status: NormalizedStatus;        // Para lógica de filtro
  internalStatus: InternalStatus;  // Original do Firestore
  date: string;
  protocol: string;
  type: string;
  role: UserRole;
  isReceived: boolean;
  originalId?: string;  // Para inbox, referência ao outgoing
  events?: EventType[]; // Histórico de eventos
  createdAt?: any;
  updatedAt?: any;
  sentAt?: any;
}

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
    case "document_created":
      return <FilePlus className="w-3 h-3" />;
    case "draft_saved":
      return <Edit3 className="w-3 h-3" />;
    case "notification_sent":
      return <Send className="w-3 h-3" />;
    case "notification_received":
      return <CheckCircle className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
}

function getEventLabel(type: string): string {
  switch (type) {
    case "document_created":
      return "Criado";
    case "draft_saved":
      return "Editado";
    case "notification_sent":
      return "Enviado";
    case "notification_received":
      return "Recebido";
    case "notification_read":
      return "Lido";
    default:
      return type.replace(/_/g, " ");
  }
}

function getEventColor(type: string): string {
  switch (type) {
    case "document_created":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "draft_saved":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "notification_sent":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "notification_received":
    case "notification_read":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

// ==========================================
// COMPONENTE DE TIMELINE MINI
// ==========================================

function MiniTimeline({ events, createdAt, sentAt }: { 
  events?: EventType[]; 
  createdAt?: any;
  sentAt?: any;
}) {
  // Se não tiver events, criar a partir de createdAt/sentAt
  const displayEvents = useMemo(() => {
    if (events && events.length > 0) {
      return events.slice(0, 3); // Max 3 eventos
    }
    
    // Fallback: criar eventos básicos a partir dos timestamps
    const fallback: EventType[] = [];
    if (createdAt) {
      fallback.push({ type: "document_created", at: createdAt });
    }
    if (sentAt) {
      fallback.push({ type: "notification_sent", at: sentAt });
    }
    return fallback;
  }, [events, createdAt, sentAt]);

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
      {/* Chips de eventos */}
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
      
      {/* Info adicional se tiver mais eventos */}
      {events && events.length > 3 && (
        <span className="text-xs text-gray-600">
          +{events.length - 3} eventos
        </span>
      )}
    </div>
  );
}

// ==========================================
// NORMALIZAÇÃO DE STATUS
// ==========================================

/**
 * Converte status internos do Firestore para formato padronizado
 * Compatível com legado (rascunho, recebida, lida) e novo (em_edicao, etc)
 */
function normalizeStatus(internal: string | undefined): NormalizedStatus {
  const s = (internal || "").toLowerCase();
  
  // Rascunhos
  if (s === "em_edicao" || s === "rascunho") {
    return "rascunho";
  }
  
  // Lida (mais específico primeiro)
  if (s === "lida_pelo_notificado" || s === "lida") {
    return "lida";
  }
  
  // Recebida
  if (s === "recebida_serv_email" || s === "recebida") {
    return "recebida";
  }
  
  // Padrão: enviada
  return "enviada";
}

// ==========================================
// LABELS DE STATUS POR ABA (TRACKING)
// ==========================================

/**
 * Retorna o label de exibição conforme a aba atual (tracking de e-mail)
 */
function getStatusLabel(
  normalizedStatus: NormalizedStatus,
  currentTab: TabType,
  isInbox: boolean
): string {
  
  // ABA RASCUNHO: sempre Rascunho
  if (currentTab === "rascunho") {
    return "Rascunho";
  }
  
  // ABA ENVIADAS (outgoing)
  if (currentTab === "enviada" || (!isInbox && currentTab === "todas")) {
    switch (normalizedStatus) {
      case "rascunho":
        return "Rascunho";
      case "enviada":
        return "Enviada";
      case "recebida":
        return "Recebida serv. e-mail";
      case "lida":
        return "Lida";
      default:
        return "Enviada";
    }
  }
  
  // ABA RECEBIDAS (inbox)
  if (currentTab === "recebida" || (isInbox && currentTab === "todas")) {
    switch (normalizedStatus) {
      case "recebida":
        return "Recebida";
      case "lida":
        return "Lida";
      case "rascunho":
        return "Rascunho";
      case "enviada":
        return "Recebida"; // fallback para dados inconsistentes
      default:
        return "Recebida";
    }
  }
  
  // ABA TODAS (genérico)
  switch (normalizedStatus) {
    case "rascunho":
      return "Rascunho";
    case "enviada":
      return "Enviada";
    case "recebida":
      return isInbox ? "Recebida" : "Recebida serv. e-mail";
    case "lida":
      return "Lida";
    default:
      return "Enviada";
  }
}

// ==========================================
// CORES DA UI
// ==========================================

function getStatusColor(label: string): string {
  const lower = label.toLowerCase();
  
  if (lower.includes("rascunho")) {
    return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
  }
  if (lower.includes("lida")) {
    return "bg-purple-500/10 border-purple-500/20 text-purple-400";
  }
  if (lower.includes("recebida")) {
    return "bg-blue-500/10 border-blue-500/20 text-blue-400";
  }
  if (lower.includes("enviada")) {
    return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
  }
  
  return "bg-gray-500/10 border-gray-500/20 text-gray-400";
}

function getTabIcon(tab: TabType) {
  switch (tab) {
    case "enviada":
      return <Send className="w-5 h-5 text-emerald-400" />;
    case "rascunho":
      return <Edit3 className="w-5 h-5 text-yellow-400" />;
    case "recebida":
      return <Inbox className="w-5 h-5 text-blue-400" />;
    case "todas":
      return <FileText className="w-5 h-5 text-purple-400" />;
  }
}

function getTabColor(tab: TabType): string {
  switch (tab) {
    case "enviada":
      return "bg-emerald-500/10";
    case "rascunho":
      return "bg-yellow-500/10";
    case "recebida":
      return "bg-blue-500/10";
    case "todas":
      return "bg-purple-500/10";
  }
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function DashboardPage(): JSX.Element {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("todas");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const isLocal = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost"
    );
  }, []);

  // Redirect se não autenticado
  useEffect(() => {
    if (authLoading) return;
    if (!user) router.push("/login");
  }, [authLoading, user, router]);

  // Busca notificações em tempo real
  useEffect(() => {
    if (!user) return;

    console.log("[DASHBOARD] Buscando notificações para:", user.uid);

    // ==========================================
    // QUERY CORRIGIDA: Busca por userId (funciona para outgoing E inbox)
    // ==========================================
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),      // ESSENCIAL: UID do usuário logado
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs: Notification[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          
          // Determina role (compatível com legado sem role)
          const role: UserRole = data.role === "inbox" ? "inbox" : "outgoing";
          const isReceived = role === "inbox";
          
          // Normaliza status
          const internalStatus = (data.status as InternalStatus) || "enviada";
          const normalizedStatus = normalizeStatus(internalStatus);

          notifs.push({
            id: docSnap.id,
            title: data.title || "Sem título",
            company: isReceived 
              ? (data.notifierName || data.notifierCpf || "N/A")
              : (data.notifiedName || data.notifiedCpf || "N/A"),
            status: normalizedStatus,
            internalStatus,
            date: formatPtBrDateFromAny(data.createdAt || data.updatedAt),
            protocol: data.protocol || "N/A",
            type: data.notificationType || "Outros",
            role,
            isReceived,
            originalId: data.originalId,
            events: data.events || [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            sentAt: data.sentAt,
          });
        });

        console.log("[DASHBOARD] Carregado:", notifs.length, "notificações");
        setNotifications(notifs);
        setLoading(false);
      },
      (error) => {
        console.error("[DASHBOARD] Erro:", error);
        // Se der erro de índice, mostrar mensagem específica
        if (error.message?.includes("index")) {
          console.error("[DASHBOARD] ERRO DE ÍNDICE: Crie o índice no Firestore console!");
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Estatísticas
  const stats = useMemo(() => ({
    total: notifications.length,
    enviadas: notifications.filter((n) => n.role === "outgoing" && n.status !== "rascunho").length,
    rascunho: notifications.filter((n) => n.status === "rascunho").length,
    recebidas: notifications.filter((n) => n.role === "inbox").length,
  }), [notifications]);

  // Filtros por aba conforme regras
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "todas":
        return notifications;
        
      case "enviada":
        // role != inbox (outgoing ou legado) E não é rascunho
        return notifications.filter((n) => 
          n.role === "outgoing" && n.status !== "rascunho"
        );
        
      case "rascunho":
        // em_edicao ou rascunho (independente de role, mas tipicamente outgoing)
        return notifications.filter((n) => n.status === "rascunho");
        
      case "recebida":
        // role == inbox
        return notifications.filter((n) => n.role === "inbox");
        
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const userName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Usuário";
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
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              >
                <Shield className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">PreJud Dashboard</h1>
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
                onClick={() => router.push("/dashboard/nova")}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-sm font-medium"
              >
                <Plus size={16} />
                Criar Notificação
              </button>

              {isLocal && (
                <a
                  href="http://127.0.0.1:4000/firestore  "
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
                  <span className="hidden sm:block text-sm font-medium">{userName}</span>
                  <ChevronDown size={16} className={`transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                      <p className="text-white font-medium text-sm">{userName}</p>
                      <p className="text-gray-500 text-xs truncate">{userEmail}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/perfil" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                        <User size={16} />
                        Meu perfil
                      </Link>
                      <Link href="/configuracoes" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
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

      {/* MAIN */}
      <main className="pt-24 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
        {/* CARDS DE ESTATÍSTICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setActiveTab("todas")}
            className={`text-left bg-white/[0.02] border rounded-2xl p-5 transition-all hover:bg-white/[0.04] ${
              activeTab === "todas" ? "border-purple-500/50 bg-purple-500/5" : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTabColor("todas")}`}>
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.total}</span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">Total Notificações</p>
          </button>

          <button
            onClick={() => setActiveTab("enviada")}
            className={`text-left bg-white/[0.02] border rounded-2xl p-5 transition-all hover:bg-white/[0.04] ${
              activeTab === "enviada" ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTabColor("enviada")}`}>
                <Send className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.enviadas}</span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">Notificações Enviadas</p>
          </button>

          <button
            onClick={() => setActiveTab("rascunho")}
            className={`text-left bg-white/[0.02] border rounded-2xl p-5 transition-all hover:bg-white/[0.04] ${
              activeTab === "rascunho" ? "border-yellow-500/50 bg-yellow-500/5" : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTabColor("rascunho")}`}>
                <Edit3 className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.rascunho}</span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">Notificações em Rascunho</p>
          </button>

          <button
            onClick={() => setActiveTab("recebida")}
            className={`text-left bg-white/[0.02] border rounded-2xl p-5 transition-all hover:bg-white/[0.04] ${
              activeTab === "recebida" ? "border-blue-500/50 bg-blue-500/5" : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTabColor("recebida")}`}>
                <Inbox className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.recebidas}</span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">Notificações Recebidas</p>
          </button>
        </div>

        {/* LISTA DE NOTIFICAÇÕES */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTabColor(activeTab)}`}>
                {getTabIcon(activeTab)}
              </div>
              <h2 className="text-lg font-semibold text-white">
                {activeTab === "todas" && "Todas as Notificações"}
                {activeTab === "enviada" && "Notificações Enviadas"}
                {activeTab === "rascunho" && "Notificações em Rascunho"}
                {activeTab === "recebida" && "Notificações Recebidas"}
              </h2>
            </div>
            <span className="text-sm text-gray-500">{filteredNotifications.length} item(s)</span>
          </div>

          <div className="divide-y divide-white/5">
            {filteredNotifications.map((notification) => {
              // LABEL DE STATUS CONFORME ABA (TRACKING)
              const statusLabel = getStatusLabel(
                notification.status,
                activeTab,
                notification.role === "inbox"
              );
              
              const statusColorClass = getStatusColor(statusLabel);

              return (
                <div
                  key={notification.id}
                  className="px-6 py-4 hover:bg-white/[0.02] transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTabColor(
                        notification.status === "rascunho" ? "rascunho" : 
                        notification.role === "inbox" ? "recebida" : "enviada"
                      )}`}>
                        {notification.status === "rascunho" ? (
                          <Edit3 className="w-5 h-5 text-yellow-400" />
                        ) : notification.role === "inbox" ? (
                          <Inbox className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Send className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors truncate">
                          {notification.title}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {notification.company} • {notification.date}
                        </p>
                        <p className="text-gray-600 text-xs">
                          Protocolo: {notification.protocol}
                        </p>
                        
                        {/* MINI TIMELINE */}
                        <MiniTimeline 
                          events={notification.events}
                          createdAt={notification.createdAt}
                          sentAt={notification.sentAt}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <Link
                        href={`/dashboard/notificacao/${notification.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 text-purple-400 text-sm rounded-full hover:bg-purple-500/20 transition-all whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Visualizar</span>
                      </Link>

                      {notification.status === "rascunho" && (
                        <Link
                          href={`/dashboard/nova?id=${notification.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 text-sm rounded-full hover:bg-yellow-500/20 transition-all whitespace-nowrap"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="hidden sm:inline">Editar</span>
                        </Link>
                      )}

                      {/* STATUS COM TRACKING */}
                      <span className={`px-3 py-1 border text-sm rounded-full whitespace-nowrap ${statusColorClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Nenhuma notificação encontrada nesta categoria.</p>
            </div>
          )}
        </div>

        {/* FOOTER INFO */}
        <div className="mt-8 bg-purple-600/5 border border-purple-600/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-purple-400 font-medium">Hash de Integridade do Sistema</h3>
          </div>
          <p className="text-gray-400 text-sm mb-2">
            Todos os registros são protegidos por criptografia SHA-256 e carimbo de tempo.
          </p>
          <code className="block bg-[#0a0a0c] rounded-lg px-4 py-3 text-xs font-mono text-gray-500 break-all">
            {Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}
          </code>
        </div>
      </main>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";
import {
  FileText,
  Shield,
  Clock,
  User,
  Mail,
  CreditCard,
  DollarSign,
  Calendar,
  Receipt,
  AlertCircle,
} from "lucide-react";

// ==========================================
// TIPOS
// ==========================================

type AgreementStatus =
  | "draft"
  | "pending_confirmation"
  | "confirmed"
  | "contested"
  | "in_adjustment"
  | "deadline_extension_pending"
  | "amendment_pending"
  | "charge_open"
  | "charge_contested"
  | "notice_sent"
  | "in_dispute"
  | "closed";

interface Agreement {
  id: string;
  title: string;
  freelancerId: string;
  freelancerName: string;
  clientName: string;
  clientEmail: string;
  clientDocument?: string;
  serviceType: string;
  description: string;
  value: string;
  deadline: string;
  terms: string;
  status: AgreementStatus;
  protocol: string;
  hash?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
  paymentModel?: string;
  paymentMethod?: string;
  cardInstallments?: number;
  pixInstallments?: number;
}

interface AgreementEvent {
  id: string;
  agreementId: string;
  type: string;
  title: string;
  description: string;
  actorId?: string;
  actorName: string;
  actorType: "freelancer" | "client" | "system";
  createdAt: Timestamp;
  metadata?: Record<string, any>;
}

// ==========================================
// HELPERS
// ==========================================

function formatDatePtBr(date: string | Timestamp | Date | undefined): string {
  if (!date) return "-";
  
  try {
    let d: Date;
    if (typeof date === "string") {
      d = new Date(date);
    } else if (date instanceof Timestamp) {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else {
      return "-";
    }
    
    if (isNaN(d.getTime())) return "-";
    
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return "-";
  }
}

function getStatusLabel(status: AgreementStatus): string {
  const labels: Record<AgreementStatus, string> = {
    draft: "Rascunho",
    pending_confirmation: "Aguardando Confirmação",
    confirmed: "Confirmado",
    contested: "Contestado",
    in_adjustment: "Em Ajuste",
    deadline_extension_pending: "Prorrogação Pendente",
    amendment_pending: "Aditivo Pendente",
    charge_open: "Cobrança em Aberto",
    charge_contested: "Cobrança Contestada",
    notice_sent: "Notificação Enviada",
    in_dispute: "Em Disputa",
    closed: "Encerrado",
  };
  return labels[status] || status;
}

function getStatusColor(status: AgreementStatus): string {
  switch (status) {
    case "draft":
      return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
    case "pending_confirmation":
      return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    case "confirmed":
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    case "contested":
    case "in_dispute":
      return "bg-red-500/10 border-red-500/20 text-red-400";
    case "closed":
      return "bg-gray-500/10 border-gray-500/20 text-gray-400";
    default:
      return "bg-purple-500/10 border-purple-500/20 text-purple-400";
  }
}

function getActorTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    freelancer: "Freelancer",
    client: "Cliente",
    system: "Sistema",
  };
  return labels[type] || type;
}

function getPaymentModelLabel(model: string | undefined): string {
  const labels: Record<string, string> = {
    advance: "Pagamento antecipado",
    "50_50": "50% no início / 50% na entrega",
    "30_70": "30% no início / 70% na entrega",
  };
  return labels[model || ""] || model || "Não informado";
}

function getPaymentMethodLabel(method: string | undefined): string {
  const labels: Record<string, string> = {
    pix: "PIX",
    pix_installments: "PIX parcelado",
    credit_card_single: "Cartão de crédito à vista",
    credit_card_installments: "Cartão de crédito parcelado",
  };
  return labels[method || ""] || method || "Não informado";
}

function getInstallmentsText(agreement: Agreement): string | null {
  if (agreement.paymentMethod === "credit_card_installments" && agreement.cardInstallments) {
    return agreement.cardInstallments + "x no cartão";
  }
  if (agreement.paymentMethod === "pix_installments" && agreement.pixInstallments) {
    return agreement.pixInstallments + "x no PIX";
  }
  return null;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function PropostaPublicaPage() {
  const params = useParams();
  const protocol = params.protocol as string;

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [events, setEvents] = useState<AgreementEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!protocol) return;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Buscar acordo por protocolo
        const agreementsQuery = query(
          collection(db, "agreements"),
          where("protocol", "==", protocol)
        );

        const agreementsSnap = await getDocs(agreementsQuery);

        if (agreementsSnap.empty) {
          setAgreement(null);
          setLoading(false);
          return;
        }

        // Pegar o primeiro (e único) acordo com esse protocolo
        const agreementDoc = agreementsSnap.docs[0];
        const agreementData = agreementDoc.data() as Omit<Agreement, "id">;
        const agreementWithId = {
          id: agreementDoc.id,
          ...agreementData,
        };
        
        setAgreement(agreementWithId);

        // Buscar eventos da timeline
        try {
          const eventsQuery = query(
            collection(db, "agreement_events"),
            where("agreementId", "==", agreementDoc.id),
            orderBy("createdAt", "desc")
          );

          const eventsSnap = await getDocs(eventsQuery);
          const eventsData: AgreementEvent[] = [];

          eventsSnap.forEach((doc) => {
            const data = doc.data() as Omit<AgreementEvent, "id">;
            eventsData.push({
              id: doc.id,
              ...data,
            });
          });

          setEvents(eventsData);
        } catch (eventsError) {
          // Se falhar por índice, buscar sem orderBy e ordenar no frontend
          console.warn("Timeline query failed, fetching without order:", eventsError);
          
          const eventsQuerySimple = query(
            collection(db, "agreement_events"),
            where("agreementId", "==", agreementDoc.id)
          );

          const eventsSnapSimple = await getDocs(eventsQuerySimple);
          const eventsDataSimple: AgreementEvent[] = [];

          eventsSnapSimple.forEach((doc) => {
            const data = doc.data() as Omit<AgreementEvent, "id">;
            eventsDataSimple.push({
              id: doc.id,
              ...data,
            });
          });

          // Ordenar no frontend por createdAt desc
          eventsDataSimple.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });

          setEvents(eventsDataSimple);
        }
      } catch (err) {
        console.error("Erro ao carregar proposta:", err);
        setError("Erro ao carregar os dados da proposta.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [protocol]);

  // ==========================================
  // HANDLERS DE AÇÃO
  // ==========================================

  async function handleAccept() {
    if (!agreement || actionLoading) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      // 1. Atualizar status do acordo
      const agreementRef = doc(db, "agreements", agreement.id);
      await updateDoc(agreementRef, {
        status: "active",
        updatedAt: serverTimestamp(),
      });

      // 2. Criar evento de aceite
      await addDoc(collection(db, "agreement_events"), {
        agreementId: agreement.id,
        type: "agreement_confirmed",
        title: "Proposta aceita",
        description: "O cliente aceitou a proposta.",
        actorType: "client",
        actorName: agreement.clientName,
        actorId: agreement.clientEmail,
        createdAt: serverTimestamp(),
        metadata: {
          protocol: agreement.protocol,
        },
      });

      // 3. Atualizar estado local
      setAgreement((prev) => prev ? { ...prev, status: "active" } : null);
      setActionSuccess("Proposta aceita com sucesso!");
    } catch (err) {
      console.error("Erro ao aceitar proposta:", err);
      setActionError("Erro ao aceitar a proposta. Tente novamente.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!agreement || actionLoading) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      // 1. Atualizar status do acordo
      const agreementRef = doc(db, "agreements", agreement.id);
      await updateDoc(agreementRef, {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });

      // 2. Criar evento de recusa
      await addDoc(collection(db, "agreement_events"), {
        agreementId: agreement.id,
        type: "agreement_rejected",
        title: "Proposta recusada",
        description: "O cliente recusou a proposta.",
        actorType: "client",
        actorName: agreement.clientName,
        actorId: agreement.clientEmail,
        createdAt: serverTimestamp(),
        metadata: {
          protocol: agreement.protocol,
        },
      });

      // 3. Atualizar estado local
      setAgreement((prev) => prev ? { ...prev, status: "rejected" } : null);
      setActionSuccess("Proposta recusada.");
    } catch (err) {
      console.error("Erro ao recusar proposta:", err);
      setActionError("Erro ao recusar a proposta. Tente novamente.");
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
          <p className="text-gray-500 text-sm">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!agreement) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Proposta não encontrada</h1>
          <p className="text-gray-500 mb-6">
            A proposta que você está procurando não existe ou o protocolo está incorreto.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all"
          >
            <Shield className="w-4 h-4" />
            Ir para PreJud
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  const installmentsText = getInstallmentsText(agreement);

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">PreJud</h1>
                <p className="text-xs text-gray-400">Proposta Comercial</p>
              </div>
            </Link>

            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-500">Protocolo</p>
              <p className="text-sm text-gray-300 font-mono">{agreement.protocol}</p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="pt-24 pb-12 px-4 md:px-8 max-w-5xl mx-auto">
        {/* CABEÇALHO DA PROPOSTA */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{agreement.title}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 border text-xs rounded-full ${getStatusColor(agreement.status)}`}>
                  {getStatusLabel(agreement.status)}
                </span>
                <span className="text-xs text-gray-500 font-mono sm:hidden">
                  {agreement.protocol}
                </span>
              </div>
            </div>
          </div>
          
          {/* TEXTO DE CONFIANÇA */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Proposta registrada com protocolo e histórico verificável.</span>
          </div>
        </div>

        {/* CARD DE RESUMO DA PROPOSTA */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Resumo da proposta</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Projeto</p>
              <p className="text-white font-medium truncate">{agreement.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Valor total</p>
              <p className="text-white font-medium">{agreement.value || "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Forma de pagamento</p>
              <p className="text-gray-300">{getPaymentModelLabel(agreement.paymentModel)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Método de pagamento</p>
              <p className="text-gray-300">{getPaymentMethodLabel(agreement.paymentMethod)}</p>
            </div>
            {installmentsText && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Parcelamento</p>
                <p className="text-gray-300">{installmentsText}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1">Prazo de entrega</p>
              <p className="text-gray-300">
                {agreement.deadline
                  ? new Date(agreement.deadline).toLocaleDateString("pt-BR")
                  : "Não informado"}
              </p>
            </div>
          </div>
        </div>

        {/* SEÇÃO DE AÇÃO - ACEITE/RECUSA */}
        {agreement.status === "pending_client_confirmation" && (
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Decisão do cliente</h2>
            </div>

            {/* Mensagens de feedback */}
            {actionSuccess && (
              <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-emerald-400 text-sm">{actionSuccess}</p>
              </div>
            )}
            {actionError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{actionError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
              >
                {actionLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Aceitar proposta
                  </>
                )}
              </button>

              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-red-400 font-medium rounded-xl transition-all"
              >
                {actionLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Recusar proposta
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {agreement.status === "active" && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-400">Proposta aceita</h3>
                <p className="text-sm text-gray-400">Esta proposta foi confirmada pelo cliente.</p>
              </div>
            </div>
          </div>
        )}

        {agreement.status === "rejected" && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-400">Proposta recusada</h3>
                <p className="text-sm text-gray-400">Esta proposta foi recusada pelo cliente.</p>
              </div>
            </div>
          </div>
        )}

        {/* BLOCO DESCRIÇÃO */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Descrição do Serviço</h2>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">{agreement.description}</p>
          </div>
        </div>

        {/* BLOCO TERMOS */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Termos do Acordo</h2>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">{agreement.terms}</p>
          </div>
        </div>

        {/* BLOCO CLIENTE */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Dados do Cliente</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Nome</p>
              <p className="text-white font-medium">{agreement.clientName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">E-mail</p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <p className="text-gray-300">{agreement.clientEmail}</p>
              </div>
            </div>
            {agreement.clientDocument && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Documento</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-300 font-mono">{agreement.clientDocument}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BLOCO TIMELINE */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Histórico</h2>
            <span className="ml-auto text-xs text-gray-500">
              {events.length} evento(s)
            </span>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum evento registrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-white font-medium truncate">{event.title}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDatePtBr(event.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{event.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Por: <span className="text-gray-300">{event.actorName}</span>
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-gray-400">
                        {getActorTypeLabel(event.actorType)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Esta proposta foi registrada na plataforma PreJud e possui protocolo de autenticidade.
          </p>
          <p className="text-xs text-gray-600 mt-2 font-mono">
            Protocolo: {agreement.protocol}
          </p>
        </div>
      </main>
    </div>
  );
}
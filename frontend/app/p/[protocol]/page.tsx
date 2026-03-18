"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type AgreementStatus =
  | "draft"
  | "pending_client_confirmation"
  | "confirmed"
  | "rejected"
  | "contested"
  | "in_adjustment"
  | "deadline_extension_pending"
  | "amendment_pending"
  | "charge_open"
  | "charge_contested"
  | "notice_sent"
  | "in_dispute"
  | "closed";

type AgreementEvent = {
  id: string;
  type?: string;
  description?: string;
  createdAt?: Timestamp | Date | null;
  actorName?: string;
  actorId?: string;
};

type Agreement = {
  id: string;
  title?: string;
  freelancerId?: string;
  freelancerName?: string;
  clientName?: string;
  clientEmail?: string;
  clientDocument?: string;
  serviceType?: string;
  description?: string;
  value?: number;
  deadline?: string;
  terms?: string;
  status?: AgreementStatus;
  protocol?: string;
  hash?: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
  timeline?: unknown[];
  clientAccessToken?: string;
};

function formatMoney(value?: number) {
  if (typeof value !== "number") return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value?: Timestamp | Date | null) {
  if (!value) return "—";
  const date = value instanceof Timestamp ? value.toDate() : value instanceof Date ? value : null;
  if (!date) return "—";
  return date.toLocaleString("pt-BR");
}

export default function PublicProposalPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const agreementId = useMemo(() => {
    const raw = params?.protocol;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  }, [params]);

  const urlToken = searchParams.get("t") || "";

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [events, setEvents] = useState<AgreementEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!agreementId) {
      setLoading(false);
      setError("ID do acordo inválido.");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        setActionError(null);
        setActionSuccess(null);

        const agreementRef = doc(db, "agreements", agreementId);
        const agreementSnap = await getDoc(agreementRef);

        if (!agreementSnap.exists()) {
          setAgreement(null);
          setIsTokenValid(false);
          setError("Proposta não encontrada.");
          return;
        }

        const agreementData = agreementSnap.data() as Omit<Agreement, "id">;
        const agreementWithId: Agreement = { id: agreementSnap.id, ...agreementData };
        setAgreement(agreementWithId);

        const tokenIsValid = !!urlToken && !!agreementWithId.clientAccessToken && urlToken === agreementWithId.clientAccessToken;
        setIsTokenValid(tokenIsValid);

        const eventsRef = collection(db, "agreement_events");
        const eventsQuery = query(eventsRef, where("agreementId", "==", agreementSnap.id), orderBy("createdAt", "asc"));
        const eventsSnap = await getDocs(eventsQuery);
        const eventsData: AgreementEvent[] = eventsSnap.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<AgreementEvent, "id">),
        }));
        setEvents(eventsData);
      } catch (err) {
        console.error("Erro ao carregar proposta pública:", err);
        setError("Não foi possível carregar a proposta.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [agreementId, urlToken]);

  const canAct = !!agreement && isTokenValid === true && agreement.status === "pending_client_confirmation" && !actionLoading;

  async function handleAccept() {
    if (!agreement || !canAct) return;
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const agreementRef = doc(db, "agreements", agreement.id);
      await updateDoc(agreementRef, { status: "confirmed", updatedAt: serverTimestamp() });
      setAgreement((prev) => prev ? { ...prev, status: "confirmed" } : prev);
      setActionSuccess("Proposta aceita com sucesso.");
    } catch (err) {
      console.error("Erro ao aceitar proposta:", err);
      setActionError("Não foi possível aceitar a proposta.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!agreement || !canAct) return;
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      const agreementRef = doc(db, "agreements", agreement.id);
      await updateDoc(agreementRef, { status: "rejected", updatedAt: serverTimestamp() });
      setAgreement((prev) => prev ? { ...prev, status: "rejected" } : prev);
      setActionSuccess("Proposta recusada com sucesso.");
    } catch (err) {
      console.error("Erro ao recusar proposta:", err);
      setActionError("Não foi possível recusar a proposta.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p>Carregando proposta...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-3xl font-bold">Algo deu errado</h1>
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!agreement) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-3xl font-bold">Proposta não encontrada</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{agreement.title || "Proposta"}</h1>
        <p className="mt-2 text-sm text-gray-600">Protocolo: {agreement.protocol || "—"}</p>
      </div>

      <section className="mb-6 rounded-xl border p-4">
        <h2 className="mb-3 text-xl font-semibold">Resumo</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <p><strong>Freelancer:</strong> {agreement.freelancerName || "—"}</p>
          <p><strong>Cliente:</strong> {agreement.clientName || "—"}</p>
          <p><strong>Email:</strong> {agreement.clientEmail || "—"}</p>
          <p><strong>Serviço:</strong> {agreement.serviceType || "—"}</p>
          <p><strong>Valor:</strong> {formatMoney(agreement.value)}</p>
          <p><strong>Prazo:</strong> {agreement.deadline || "—"}</p>
          <p><strong>Status:</strong> {agreement.status || "—"}</p>
          <p><strong>Atualizado em:</strong> {formatDate(agreement.updatedAt)}</p>
        </div>
      </section>

      <section className="mb-6 rounded-xl border p-4">
        <h2 className="mb-3 text-xl font-semibold">Descrição</h2>
        <p className="whitespace-pre-wrap">{agreement.description || "—"}</p>
      </section>

      <section className="mb-6 rounded-xl border p-4">
        <h2 className="mb-3 text-xl font-semibold">Termos</h2>
        <p className="whitespace-pre-wrap">{agreement.terms || "—"}</p>
      </section>

      <section className="mb-6 rounded-xl border p-4">
        <h2 className="mb-3 text-xl font-semibold">Timeline</h2>
        {events.length === 0 ? (
          <p>Nenhum evento encontrado.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-lg border p-3">
                <p className="font-medium">{event.type || "Evento"}</p>
                <p className="text-sm text-gray-600">{event.description || "Sem descrição"}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(event.createdAt)} {event.actorName ? `• ${event.actorName}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {isTokenValid === false && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Link inválido, incompleto ou expirado.
        </div>
      )}

      {agreement.status !== "pending_client_confirmation" && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          Esta proposta já foi processada e não pode mais ser alterada.
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {actionSuccess}
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
        <p className="font-medium">Confirmação digital em implantação</p>
        <p className="text-sm mt-1">
          Em breve será possível aceitar ou recusar propostas diretamente por este link. 
          Para formalizar o acordo, entre em contato com o freelancer.
        </p>
      </div>
    </main>
  );
}

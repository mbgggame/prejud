'use client';

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  getAgreementById,
  createAgreement,
  getAgreementEvents,
  resendAgreementAfterRevision,
  closeAgreement,
} from "@/services/firebaseAgreementService";
import type { Agreement, TimelineEvent } from "@/types/agreement";

interface AgreementFormData {
  title: string;

  freelancerName: string;
  freelancerDocument: string;
  freelancerEmail: string;
  freelancerPhone: string;
  freelancerCity: string;
  freelancerState: string;

  clientName: string;
  clientDocument: string;
  clientEmail: string;
  clientPhone: string;

  serviceCategory: string;
  serviceSubtype: string;
  serviceOther: string;
  description: string;

  deliverables: string;
  quantity: string;
  formats: string;
  outOfScope: string;

  startDate: string;
  deadline: string;
  deliveryMode: string;
  milestones: string;

  value: string;
  hasEntry: string;
  entryValue: string;
  installmentMode: string;
  paymentMethod: string;
  dueDate: string;
  lateFee: string;

  serviceType: string;
}

const SERVICE_OPTIONS = [
  "Design gráfico",
  "Criação de logotipo",
  "Identidade visual",
  "Social media",
  "Gestão de tráfego pago",
  "Copywriting",
  "Redação de artigos/blog",
  "Roteiros para vídeos",
  "Edição de vídeo",
  "Motion design",
  "Web design",
  "Criação de landing page",
  "Desenvolvimento de sites",
  "Desenvolvimento de e-commerce",
  "Desenvolvimento de app",
  "Programação sob demanda",
  "UI/UX design",
  "SEO",
  "Gestão de e-mail marketing / automações",
  "Suporte administrativo / assistente virtual",
  "Criação de conteúdo UGC",
  "Locução",
  "Tradução",
  "Narração",
  "Edição de imagens",
  "Modelagem 3D",
  "Automações no-code",
  "Criação de apresentações",
  "Consultoria digital",
  "Outros",
] as const;

function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function formatDateTime(value: unknown): string {
  if (!value) return "—";
  try {
    const d = new Date(value as string);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("pt-BR");
  } catch {
    return "—";
  }
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function stripCountryCode55(value: string): string {
  let digits = onlyDigits(value);

  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }

  return digits;
}

function formatPhone(value: string): string {
  const digits = stripCountryCode55(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

function formatCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

function formatCpfOrCnpj(value: string): string {
  const digits = onlyDigits(value);
  return digits.length <= 11 ? formatCpf(value) : formatCnpj(value);
}

// ⭐ NOVO: Função para formatar data DD/MM/AAAA
function formatDateBR(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

// ⭐ NOVO: Função para converter string BR para Date
function parseDateBR(dateStr: string): Date | null {
  if (!dateStr || dateStr.length !== 10) return null;
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return null;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return isNaN(date.getTime()) ? null : date;
}

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
  };
  return labels[type || ""] || type || "Evento";
}

function getEventDescription(event: TimelineEvent): string {
  if (event?.metadata?.message) return String(event.metadata.message);
  if (event?.metadata?.description) return String(event.metadata.description);
  return "Sem detalhes adicionais.";
}

function TooltipHint({ text }: { text: string }) {
  return (
    <span className="group relative ml-2 inline-flex align-middle">
      <span className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-slate-300 text-[11px] font-bold text-slate-500 dark:border-slate-600 dark:text-slate-300">
        ?
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-72 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-normal leading-5 text-slate-600 shadow-xl group-hover:block dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-300">
        {text}
      </span>
    </span>
  );
}

export default function FormalizarAcordoPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dark, setDark] = useState(false);

  const [loadingOriginalAgreement, setLoadingOriginalAgreement] = useState(false);
  const [loadingRevisionMessage, setLoadingRevisionMessage] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const [originalAgreement, setOriginalAgreement] = useState<Agreement | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [clientRevisionMessage, setClientRevisionMessage] = useState<string>("");

  // ⭐ CORREÇÃO: Proteger contra searchParams null
  const agreementId = searchParams?.get("agreementId") ?? null;
  const mode = searchParams?.get("mode") ?? null;
  const isRevisionMode = mode === "revision" && !!agreementId;

  const [formData, setFormData] = useState<AgreementFormData>({
    title: "",

    freelancerName: "",
    freelancerDocument: "",
    freelancerEmail: "",
    freelancerPhone: "",
    freelancerCity: "",
    freelancerState: "",

    clientName: "",
    clientDocument: "",
    clientEmail: "",
    clientPhone: "",

    serviceCategory: "",
    serviceSubtype: "",
    serviceOther: "",
    description: "",

    deliverables: "",
    quantity: "",
    formats: "",
    outOfScope: "",

    startDate: "",
    deadline: "",
    deliveryMode: "",
    milestones: "",

    value: "",
    hasEntry: "não",
    entryValue: "",
    installmentMode: "à vista",
    paymentMethod: "",
    dueDate: "",
    lateFee: "não",

    serviceType: "",
  });

  const resolvedServiceType = useMemo(() => {
    if (formData.serviceSubtype === "Outros") {
      return formData.serviceOther.trim();
    }
    return formData.serviceSubtype || formData.serviceCategory || "";
  }, [formData.serviceSubtype, formData.serviceOther, formData.serviceCategory]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      freelancerName: prev.freelancerName || user.displayName || "Freelancer",
      freelancerEmail: prev.freelancerEmail || user.email || "",
    }));
  }, [user]);

  useEffect(() => {
    async function loadData() {
      if (!agreementId) return;

      try {
        setLoadingOriginalAgreement(true);
        setLoadingTimeline(true);

        const agreement = await getAgreementById(agreementId);

        if (agreement) {
          setOriginalAgreement(agreement);

          setFormData((prev) => ({
            ...prev,
            title: agreement.title || "",
            freelancerName:
              (agreement as any).freelancerName ||
              prev.freelancerName ||
              user?.displayName ||
              user?.email ||
              "Freelancer",
            freelancerDocument: (agreement as any).freelancerDocument || "",
            freelancerEmail:
              (agreement as any).freelancerEmail ||
              prev.freelancerEmail ||
              user?.email ||
              "",
            freelancerPhone: formatPhone((agreement as any).freelancerPhone || ""),
            // ⭐ NOVO: Carregar cidade/estado
            freelancerCity: (agreement as any).freelancerCity || "",
            freelancerState: (agreement as any).freelancerState || "",

            clientName: agreement.clientName || "",
            clientDocument: (agreement as any).clientDocument || "",
            clientEmail: agreement.clientEmail || "",
            clientPhone: formatPhone((agreement as any).clientPhone || ""),

            serviceCategory: (agreement as any).serviceCategory || "",
            serviceSubtype: (agreement as any).serviceSubtype || agreement.serviceType || "",
            serviceOther: (agreement as any).serviceOther || "",
            description: agreement.description || "",

            deliverables: (agreement as any).deliverables || "",
            quantity: (agreement as any).quantity || "",
            formats: (agreement as any).formats || "",
            outOfScope: (agreement as any).outOfScope || "",

            // ⭐ ALTERADO: Converter datas para formato BR
            startDate: formatDateBR(formatDateForInput((agreement as any).startDate)),
            deadline: formatDateBR(formatDateForInput(agreement.deadline)),
            deliveryMode: (agreement as any).deliveryMode || "",
            milestones: (agreement as any).milestones || "",

            value: agreement.value?.toString() || "",
            hasEntry: (agreement as any).hasEntry || "não",
            entryValue: (agreement as any).entryValue?.toString?.() || "",
            installmentMode: (agreement as any).installmentMode || "à vista",
            paymentMethod: (agreement as any).paymentMethod || "",
            // ⭐ ALTERADO: Converter data para formato BR
            dueDate: formatDateBR(formatDateForInput((agreement as any).dueDate)),
            lateFee: (agreement as any).lateFee || "não",

            serviceType: agreement.serviceType || "",
          }));

          const events = await getAgreementEvents(agreementId);
          setTimeline(events || []);

          if (isRevisionMode) {
            setLoadingRevisionMessage(true);
            const revisionEvent = (events || []).find(
              (e: TimelineEvent) => e.type === "amendment_adjustment_requested"
            );

            if (revisionEvent?.metadata?.message) {
              setClientRevisionMessage(String(revisionEvent.metadata.message));
            }
            setLoadingRevisionMessage(false);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar acordo:", error);
        alert("Erro ao carregar dados do acordo.");
      } finally {
        setLoadingOriginalAgreement(false);
        setLoadingTimeline(false);
      }
    }

    loadData();
  }, [agreementId, isRevisionMode, user]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let nextValue = value;

    if (name === "freelancerPhone" || name === "clientPhone") {
      nextValue = formatPhone(value);
    }

    if (name === "freelancerDocument" || name === "clientDocument") {
      nextValue = formatCpfOrCnpj(value);
    }

    // ⭐ NOVO: Formatar datas para DD/MM/AAAA
    if (name === "startDate" || name === "deadline" || name === "dueDate") {
      nextValue = formatDateBR(value);
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: nextValue };

      if (name === "serviceSubtype" && value !== "Outros") {
        next.serviceOther = "";
      }

      return next;
    });
  };

  const buildStructuredDescription = () => {
    return [
      `Categoria do serviço: ${formData.serviceCategory || "Não informado"}`,
      `Subtipo do serviço: ${
        formData.serviceSubtype === "Outros"
          ? formData.serviceOther || "Outros"
          : formData.serviceSubtype || "Não informado"
      }`,
      `Descrição resumida: ${formData.description || "Não informado"}`,
      "",
      `O que será entregue: ${formData.deliverables || "Não informado"}`,
      `Quantidade de entregas/peças: ${formData.quantity || "Não informado"}`,
      `Formatos de entrega: ${formData.formats || "Não informado"}`,
      `Fora do escopo: ${formData.outOfScope || "Não informado"}`,
      "",
      `Data de início: ${formData.startDate || "Não informado"}`,
      `Data estimada de entrega: ${formData.deadline || "Não informado"}`,
      `Entrega única ou por etapas: ${formData.deliveryMode || "Não informado"}`,
      `Cronograma de marcos: ${formData.milestones || "Não informado"}`,
      "",
      `Valor total: R$ ${formData.value || "0,00"}`,
      `Entrada: ${formData.hasEntry || "não"}`,
      `Valor da entrada: ${formData.entryValue || "Não informado"}`,
      `Forma de parcelamento: ${formData.installmentMode || "Não informado"}`,
      `Forma de pagamento: ${formData.paymentMethod || "Não informado"}`,
      `Data de vencimento: ${formData.dueDate || "Não informado"}`,
      `Multa por atraso: ${formData.lateFee || "não"}`,
    ].join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const structuredDescription = buildStructuredDescription();

      const agreementData = {
        title: formData.title,
        clientEmail: formData.clientEmail,
        clientName: formData.clientName,
        serviceType: resolvedServiceType,
        description: structuredDescription,
        value: parseFloat(formData.value) || 0,
        // ⭐ ALTERADO: Converter datas de BR para Date
        deadline: parseDateBR(formData.deadline),

        freelancerId: user.uid,
        freelancerName: formData.freelancerName || user.displayName || user.email || "Freelancer",
        freelancerEmail: formData.freelancerEmail || user.email || "",
        status: "pending_client_confirmation" as const,

        freelancerDocument: formData.freelancerDocument,
        freelancerPhone: stripCountryCode55(formData.freelancerPhone),
        // ⭐ NOVO: Incluir cidade/estado
        freelancerCity: formData.freelancerCity,
        freelancerState: formData.freelancerState,
        clientDocument: formData.clientDocument,
        clientPhone: stripCountryCode55(formData.clientPhone),

        serviceCategory: formData.serviceCategory,
        serviceSubtype: formData.serviceSubtype,
        serviceOther: formData.serviceOther,

        deliverables: formData.deliverables,
        quantity: formData.quantity,
        formats: formData.formats,
        outOfScope: formData.outOfScope,

        // ⭐ ALTERADO: Converter datas de BR para Date
        startDate: parseDateBR(formData.startDate),
        deliveryMode: formData.deliveryMode,
        milestones: formData.milestones,

        hasEntry: formData.hasEntry,
        entryValue: parseFloat(formData.entryValue) || 0,
        installmentMode: formData.installmentMode,
        paymentMethod: formData.paymentMethod,
        // ⭐ ALTERADO: Converter data de BR para Date
        dueDate: parseDateBR(formData.dueDate),
        lateFee: formData.lateFee,
      };

      if (isRevisionMode && agreementId) {
        await resendAgreementAfterRevision(agreementId, agreementData, user.uid);
        alert("✅ Acordo reenviado com sucesso. O cliente recebeu a versão atualizada.");
      } else {
        await createAgreement(agreementData);
        alert("✅ Acordo criado e enviado ao cliente.");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao salvar acordo:", error);
      alert("Erro ao salvar acordo. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!agreementId || !confirm("Tem certeza que deseja encerrar este acordo?")) return;

    setIsClosing(true);

    try {
      await closeAgreement(agreementId, user?.uid || "");
      alert("Acordo encerrado.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao encerrar acordo:", error);
      alert("Erro ao encerrar acordo.");
    } finally {
      setIsClosing(false);
    }
  };

  if (loadingOriginalAgreement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FB] dark:bg-[#020817]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <p className="mt-4 text-slate-600 dark:text-slate-300">Carregando acordo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-900 dark:bg-[#020817] dark:text-white">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-[#020817]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Image
              src={dark ? "/prejud-logo-1200x300 preto.svg" : "/prejud-logo-1200x300.svg"}
              alt="PREJUD"
              width={145}
              height={36}
              priority
              className="h-auto w-[120px] sm:w-[145px]"
            />
            <div>
              <p className="text-lg font-bold leading-tight">Área do Freelancer</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Painel de gestão de acordos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg shadow-sm transition hover:-translate-y-0.5 dark:border-slate-700/50 dark:bg-[#0F172A]"
              aria-label="Alternar tema"
              type="button"
            >
              {dark ? "☀️" : "🌙"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-slate-700/50 dark:bg-[#0F172A] dark:text-slate-200"
            >
              ← Voltar ao dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#04112A] md:p-8">
          <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
            {isRevisionMode ? "Modo revisão do acordo" : "Formalização de novo acordo"}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <div>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                {isRevisionMode
                  ? "Ajuste, reenvie e preserve o histórico do acordo"
                  : "Crie, acompanhe e formalize seus acordos com clareza"}
              </h1>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Use o padrão visual da PREJUD para estruturar o serviço, definir
                escopo, prazo, pagamento e manter o histórico completo com hash e timeline.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700/50 dark:bg-[#0B1733]">
              <h2 className="text-lg font-bold">Resumo do acordo</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/50 dark:bg-[#0F172A]">
                  <p className="text-slate-500 dark:text-slate-400">Status atual</p>
                  <p className="mt-1 font-semibold">
                    {originalAgreement?.status || (isRevisionMode ? "Em revisão" : "Novo")}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/50 dark:bg-[#0F172A]">
                  <p className="text-slate-500 dark:text-slate-400">Hash do acordo</p>
                  <p className="mt-1 break-all font-mono text-xs sm:text-sm">
                    {(originalAgreement as any)?.hash ||
                      (originalAgreement as any)?.agreementHash ||
                      searchParams?.get("originalHash") ||
                      "Hash ainda não disponível"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/50 dark:bg-[#0F172A]">
                  <p className="text-slate-500 dark:text-slate-400">Protocolo</p>
                  <p className="mt-1 font-semibold">
                    {(originalAgreement as any)?.protocol ||
                      searchParams?.get("originalProtocol") ||
                      "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {isRevisionMode && (
          <section className="mt-6 rounded-[28px] border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
            <h2 className="text-lg font-bold text-blue-800 dark:text-blue-300">
              Revisão solicitada pelo cliente
            </h2>
            <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
              Esta edição mantém o acordo no fluxo e preserva o histórico da revisão.
            </p>
          </section>
        )}

        {isRevisionMode && (clientRevisionMessage || loadingRevisionMessage) && (
          <section className="mt-6 rounded-[28px] border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">
              Mensagem do cliente
            </h3>

            {loadingRevisionMessage ? (
              <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
                Carregando mensagem...
              </p>
            ) : (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-[#0F172A]">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {clientRevisionMessage || "Nenhuma mensagem detalhada foi registrada."}
                </p>
              </div>
            )}
          </section>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#04112A] md:p-8"
          >
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold">1. Identificação das partes</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Dados do freelancer e do cliente para formalização do acordo.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Nome completo do freelancer *
                    </label>
                    <input
                      name="freelancerName"
                      value={formData.freelancerName}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      CPF/CNPJ do freelancer
                    </label>
                    <input
                      name="freelancerDocument"
                      value={formData.freelancerDocument}
                      onChange={handleChange}
                      inputMode="numeric"
                      maxLength={18}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      E-mail do freelancer *
                    </label>
                    <input
                      type="email"
                      name="freelancerEmail"
                      value={formData.freelancerEmail}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Telefone do freelancer
                    </label>
                    <input
                      name="freelancerPhone"
                      value={formData.freelancerPhone}
                      onChange={handleChange}
                      inputMode="numeric"
                      maxLength={15}
                      placeholder="(00) 00000-0000"
                      autoComplete="tel"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  {/* ⭐ NOVO: Cidade do freelancer */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Cidade do freelancer *
                    </label>
                    <input
                      name="freelancerCity"
                      value={formData.freelancerCity}
                      onChange={handleChange}
                      required
                      placeholder="São Paulo"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  {/* ⭐ NOVO: Estado do freelancer */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Estado do freelancer *
                    </label>
                    <select
                      name="freelancerState"
                      value={formData.freelancerState}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    >
                      <option value="">Selecione...</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Nome completo do cliente *
                    </label>
                    <input
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      CPF/CNPJ do cliente
                    </label>
                    <input
                      name="clientDocument"
                      value={formData.clientDocument}
                      onChange={handleChange}
                      inputMode="numeric"
                      maxLength={18}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      E-mail do cliente *
                    </label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Telefone do cliente
                    </label>
                    <input
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleChange}
                      inputMode="numeric"
                      maxLength={15}
                      placeholder="(00) 00000-0000"
                      autoComplete="tel"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold">2. Tipo de serviço</h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 flex items-center text-sm font-medium">
                      Categoria do serviço *
                      <TooltipHint text="Informe a área principal do trabalho. Ex.: Design, Desenvolvimento, Marketing, Conteúdo. Seja simples e amplo." />
                    </label>
                    <input
                      name="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={handleChange}
                      placeholder="Ex.: Design, Marketing, Desenvolvimento"
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center text-sm font-medium">
                      Subtipo *
                      <TooltipHint text="Escolha o tipo específico do serviço dentro da categoria. Se não encontrar, selecione Outros." />
                    </label>
                    <select
                      name="serviceSubtype"
                      value={formData.serviceSubtype}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    >
                      <option value="">Selecione...</option>
                      {SERVICE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.serviceSubtype === "Outros" && (
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium">
                        Especifique o serviço *
                      </label>
                      <input
                        name="serviceOther"
                        value={formData.serviceOther}
                        onChange={handleChange}
                        required={formData.serviceSubtype === "Outros"}
                        placeholder="Descreva o serviço não listado"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="mb-1 flex items-center text-sm font-medium">
                      Título do acordo *
                      <TooltipHint text="Escreva um título curto e direto, deixando claro o serviço contratado. Ex.: Criação de landing page para campanha X." />
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Ex.: Criação de identidade visual para marca X"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 flex items-center text-sm font-medium">
                      Descrição resumida *
                      <TooltipHint text="Resuma em uma frase o que será feito. Não detalhe tudo aqui. Os detalhes ficam nos campos abaixo." />
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      required
                      placeholder="Ex.: Criação de logo, paleta, tipografia e manual básico."
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold">3. Objeto do contrato</h2>

                <div className="mt-5 grid gap-4">
                  <div>
                    <label className="mb-1 flex items-center text-sm font-medium">
                      O que será entregue? *
                      <TooltipHint text="Liste de forma objetiva as entregas principais. Ex.: 1 logotipo, 1 paleta de cores, 1 manual básico em PDF." />
                    </label>
                    <textarea
                      name="deliverables"
                      value={formData.deliverables}
                      onChange={handleChange}
                      rows={3}
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 flex items-center text-sm font-medium">
                        Quantas entregas/peças? *
                        <TooltipHint text="Informe a quantidade total do que será entregue. Ex.: 10 posts, 3 vídeos, 1 site, 2 páginas." />
                      </label>
                      <input
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        placeholder="Ex.: 10 posts, 1 logo, 3 vídeos"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex items-center text-sm font-medium">
                        Quais formatos?
                        <TooltipHint text="Informe em quais formatos o cliente receberá os arquivos. Ex.: PNG, JPG, PDF, MP4, Figma, link publicado." />
                      </label>
                      <input
                        name="formats"
                        value={formData.formats}
                        onChange={handleChange}
                        placeholder="Ex.: PNG, JPG, PDF, MP4, Figma"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 flex items-center text-sm font-medium">
                      O que está fora do escopo?
                      <TooltipHint text="Use este campo para evitar mal-entendidos. Ex.: não inclui edição extra, tráfego pago, hospedagem, arquivo editável ou novas peças." />
                    </label>
                    <textarea
                      name="outOfScope"
                      value={formData.outOfScope}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Ex.: não inclui gestão mensal, arquivos editáveis, tráfego pago, hospedagem."
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold">4. Prazo</h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Data de início
                    </label>
                    {/* ⭐ ALTERADO: Input de data com máscara DD/MM/AAAA */}
                    <input
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="DD/MM/AAAA"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Data estimada de entrega *
                    </label>
                    {/* ⭐ ALTERADO: Input de data com máscara DD/MM/AAAA */}
                    <input
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="DD/MM/AAAA"
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Entrega única ou por etapas?
                    </label>
                    <select
                      name="deliveryMode"
                      value={formData.deliveryMode}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    >
                      <option value="">Selecione...</option>
                      <option value="entrega única">Entrega única</option>
                      <option value="por etapas">Por etapas</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 flex items-center text-sm font-medium">
                      Cronograma de marcos
                      <TooltipHint text="Detalhe só se precisar. Ex.: briefing em 2 dias, primeira prévia em 5 dias, versão final em 10 dias." />
                    </label>
                    <input
                      name="milestones"
                      value={formData.milestones}
                      onChange={handleChange}
                      placeholder="Ex.: briefing, primeira prévia, versão final"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold">5. Valor e pagamento</h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Valor total (R$) *
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Entrada?
                    </label>
                    <select
                      name="hasEntry"
                      value={formData.hasEntry}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    >
                      <option value="não">Não</option>
                      <option value="sim">Sim</option>
                    </select>
                  </div>

                  {formData.hasEntry === "sim" && (
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Valor da entrada (R$)
                      </label>
                      <input
                        type="number"
                        name="entryValue"
                        value={formData.entryValue}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Parcelado?
                    </label>
                    <select
                      name="installmentMode"
                      value={formData.installmentMode}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    >
                      <option value="à vista">À vista</option>
                      <option value="parcelado">Parcelado</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Forma de pagamento
                    </label>
                    <input
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      placeholder="Ex.: PIX, boleto, cartão, transferência"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Data de vencimento
                    </label>
                    {/* ⭐ ALTERADO: Input de data com máscara DD/MM/AAAA */}
                    <input
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="DD/MM/AAAA"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Multa por atraso?
                    </label>
                    <select
                      name="lateFee"
                      value={formData.lateFee}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#0F172A]"
                    >
                      <option value="não">Não</option>
                      <option value="sim">Sim</option>
                    </select>
                  </div>
                </div>
              </section>

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-w-[240px] flex-1 items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Salvando..."
                    : isRevisionMode
                    ? "Reenviar acordo ajustado"
                    : "Criar e enviar acordo"}
                </button>

                {isRevisionMode && (
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isClosing}
                    className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isClosing ? "Encerrando..." : "Encerrar acordo"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>

          <aside className="space-y-6">
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#04112A]">
              <h2 className="text-2xl font-bold">Histórico / timeline</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Eventos do acordo preservados para auditoria e acompanhamento.
              </p>

              {loadingTimeline ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Carregando timeline...
                </p>
              ) : timeline.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Nenhum evento disponível para este acordo.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {timeline.map((event, index) => (
                    <div key={`${event.type}-${index}`} className="relative pl-6">
                      <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-blue-500" />
                      {index < timeline.length - 1 && (
                        <span className="absolute left-[5px] top-5 h-[calc(100%+8px)] w-px bg-slate-200 dark:bg-slate-700" />
                      )}

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-[#0F172A]">
                        <p className="text-sm font-semibold">
                          {getEventLabel(event.type)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {formatDateTime((event as any).createdAt || (event as any).timestamp)}
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {getEventDescription(event)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#04112A]">
              <h2 className="text-2xl font-bold">Dados técnicos</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-[#0F172A]">
                  <p className="text-slate-500 dark:text-slate-400">Agreement ID</p>
                  <p className="mt-1 break-all font-mono text-xs">
                    {agreementId || "Novo acordo"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-[#0F172A]">
                  <p className="text-slate-500 dark:text-slate-400">Modo</p>
                  <p className="mt-1 font-semibold">
                    {isRevisionMode ? "Revisão" : "Criação"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-[#0F172A]">
                  <p className="text-slate-500 dark:text-slate-400">Serviço resolvido</p>
                  <p className="mt-1 font-semibold">
                    {resolvedServiceType || "Não definido"}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
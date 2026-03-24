"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getAgreementByProtocolOrId,
  processPublicAgreementConfirmation,
} from "@/services/firebaseAgreementService";
import { Agreement } from "@/types/agreement";
import { Timeline } from "@/components/Timeline";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  FileText,
  User,
  Mail,
  DollarSign,
  Calendar,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

export default function PublicAgreementPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [contestLoading, setContestLoading] = useState(false);
  const [revisionLoading, setRevisionLoading] = useState(false);

  const protocol = params.protocol as string;
  const token = searchParams.get("t");

  useEffect(() => {
    if (!protocol) return;

    const loadAgreement = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAgreementByProtocolOrId(
          protocol,
          token || undefined
        );

        if (!data) {
          setError("Acordo não encontrado ou link inválido.");
          return;
        }

        if (data.clientAccessToken !== token) {
          setError("Token de acesso inválido.");
          return;
        }

        setAgreement(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar acordo.");
      } finally {
        setLoading(false);
      }
    };

    loadAgreement();
  }, [protocol, token]);

  const reloadAgreement = async () => {
    const updated = await getAgreementByProtocolOrId(
      protocol,
      token || undefined
    );

    if (!updated) {
      throw new Error("Não foi possível recarregar o acordo.");
    }

    setAgreement(updated);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!agreement) return;

    setConfirmLoading(true);
    try {
      await processPublicAgreementConfirmation(
        agreement.id,
        "accept",
        token || undefined
      );

      await reloadAgreement();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao confirmar acordo.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleContest = async () => {
    if (!agreement) return;

    setContestLoading(true);
    try {
      await processPublicAgreementConfirmation(
        agreement.id,
        "reject",
        token || undefined
      );

      await reloadAgreement();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao contestar acordo.");
    } finally {
      setContestLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!agreement) return;

    const message = window.prompt("Descreva o ajuste que deseja:");

    if (!message || !message.trim()) return;

    setRevisionLoading(true);
    try {
      await processPublicAgreementConfirmation(
        agreement.id,
        "request_revision",
        token || undefined,
        message.trim()
      );

      await reloadAgreement();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao solicitar revisão."
      );
    } finally {
      setRevisionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-white">
        <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#020617]/90">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="flex items-center">
              <img
                src="/prejud-logo-1200x300 preto.svg"
                alt="PreJud"
                className="h-8 w-auto dark:hidden"
              />
              <img
                src="/prejud-logo-1200x300.svg"
                alt="PreJud"
                className="hidden h-8 w-auto dark:block"
              />
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-[#111827] dark:text-slate-300 dark:shadow-none">
              <Shield className="h-3.5 w-3.5" />
              Ambiente público
            </div>
          </div>
        </header>

        <main className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 pt-28 pb-8 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <Loader2 className="h-5 w-5 animate-spin text-slate-600 dark:text-slate-300" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Carregando acordo...
            </span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-white">
        <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#020617]/90">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="flex items-center">
              <img
                src="/prejud-logo-1200x300 preto.svg"
                alt="PreJud"
                className="h-8 w-auto dark:hidden"
              />
              <img
                src="/prejud-logo-1200x300.svg"
                alt="PreJud"
                className="hidden h-8 w-auto dark:block"
              />
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-[#111827] dark:text-slate-300 dark:shadow-none">
              <Shield className="h-3.5 w-3.5" />
              Ambiente público
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-8 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
          <div className="mx-auto max-w-3xl">
            <div className="mb-5">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/50 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-[#0F172A]"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </div>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="h-3.5 w-3.5" />
                Erro de acesso
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white">
                Não foi possível abrir este acordo
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {error}
              </p>

              <div className="mt-6">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/50 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-[#0F172A]"
                >
                  Voltar para o dashboard
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  if (!agreement) return null;

  const isPending = agreement.status === "pending_client_confirmation";
  const isConfirmed = agreement.status === "confirmed";
  const isRejected =
    agreement.status === "contested" || agreement.status === "rejected";
  const isClosed = agreement.status === "closed";
  const isInAdjustment = agreement.status === "in_adjustment";

  const statusBadge = isPending
    ? {
        label: "Aguardando sua resposta",
        className:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300",
      }
    : isConfirmed
    ? {
        label: "Acordo confirmado",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300",
      }
    : isInAdjustment
    ? {
        label: "Revisão solicitada",
        className:
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300",
      }
    : isClosed
    ? {
        label: "Convite encerrado",
        className:
          "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700/50 dark:bg-slate-900/60 dark:text-slate-300",
      }
    : {
        label: "Acordo contestado",
        className:
          "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300",
      };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#020617]/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center">
            <img
              src="/prejud-logo-1200x300 preto.svg"
              alt="PreJud"
              className="h-8 w-auto dark:hidden"
            />
            <img
              src="/prejud-logo-1200x300.svg"
              alt="PreJud"
              className="hidden h-8 w-auto dark:block"
            />
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-[#111827] dark:text-slate-300 dark:shadow-none">
            <Shield className="h-3.5 w-3.5" />
            Protocolo
            <span className="font-mono text-slate-900 dark:text-white">
              {agreement.protocol}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/50 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-[#0F172A]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <div
              className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusBadge.className}`}
            >
              <Shield className="h-3.5 w-3.5" />
              {statusBadge.label}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white">
              Proposta de acordo
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Você recebeu uma proposta de acordo profissional. Revise os
              detalhes abaixo antes de confirmar, contestar ou solicitar
              revisão.
            </p>
          </section>

          <section className="mt-6 rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6 sm:py-6">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                Resumo do acordo
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Informações principais da proposta enviada pelo profissional.
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700/50 dark:bg-[#111827]">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700/50 dark:bg-[#0F172A]">
                      <FileText className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Acordo
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                        {agreement.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700/50 dark:bg-[#111827] dark:shadow-none dark:hover:bg-[#162033]">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      <User className="h-4 w-4" />
                      Profissional
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {agreement.freelancerName || "-"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700/50 dark:bg-[#111827] dark:shadow-none dark:hover:bg-[#162033]">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      <Mail className="h-4 w-4" />
                      E-mail do profissional
                    </div>
                    <p className="break-all text-sm font-medium text-slate-900 dark:text-white">
                      {agreement.freelancerId || "-"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700/50 dark:bg-[#111827] dark:shadow-none dark:hover:bg-[#162033]">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      <DollarSign className="h-4 w-4" />
                      Valor
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      R$ {agreement.value?.toFixed(2) ?? "0,00"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700/50 dark:bg-[#111827] dark:shadow-none dark:hover:bg-[#162033]">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      Prazo de entrega
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {agreement.deadline
                        ? new Date(agreement.deadline).toLocaleDateString(
                            "pt-BR"
                          )
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-[#111827] dark:shadow-none">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Descrição do serviço
                  </div>
                  <p className="min-h-[100px] whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {agreement.description || "-"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6 sm:py-6">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                Ações da proposta
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Escolha abaixo como deseja responder a este convite.
              </p>
            </div>

            <div className="p-5 sm:p-6">
              {isPending && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-semibold">
                        Aguardando sua resposta
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-amber-700/90 dark:text-amber-200">
                      Você pode confirmar este acordo, solicitar revisão ou
                      contestar o convite.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                    <button
                      onClick={handleConfirm}
                      disabled={confirmLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {confirmLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      {confirmLoading ? "Confirmando..." : "Aceitar acordo"}
                    </button>

                    <button
                      onClick={handleRequestRevision}
                      disabled={revisionLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-600 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-[#162033]"
                    >
                      {revisionLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-5 w-5" />
                      )}
                      {revisionLoading ? "Enviando..." : "Solicitar revisão"}
                    </button>

                    <button
                      onClick={handleContest}
                      disabled={contestLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {contestLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      {contestLoading ? "Processando..." : "Contestar convite"}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-slate-700/50 dark:bg-[#111827] dark:text-slate-300">
                    Use <span className="font-semibold">Solicitar revisão</span>{" "}
                    quando quiser pedir ajustes sem confirmar o acordo neste
                    momento.
                  </div>
                </div>
              )}

              {isConfirmed && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Acordo confirmado</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-emerald-700/90 dark:text-emerald-200">
                    Sua confirmação foi registrada com segurança no histórico do
                    acordo.
                  </p>
                </div>
              )}

              {isInAdjustment && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <RefreshCw className="h-5 w-5" />
                    <span className="font-semibold">Revisão solicitada</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-blue-700/90 dark:text-blue-200">
                    Seu pedido de revisão foi registrado e enviado para análise
                    do profissional.
                  </p>
                </div>
              )}

              {isRejected && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">Acordo contestado</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-red-700/90 dark:text-red-200">
                    Sua contestação foi registrada e o profissional poderá
                    avaliar os próximos passos.
                  </p>
                </div>
              )}

              {isClosed && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-[#111827]">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">Convite encerrado</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Este convite foi encerrado. Caso ainda deseje seguir com
                    este profissional, responda ao e-mail recebido solicitando a
                    abertura de um novo convite.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6 sm:py-6">
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                  Integridade do registro
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Identificador criptográfico da versão atual deste acordo.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700/50 dark:bg-[#111827]">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 text-slate-700 dark:text-slate-200" />
                    <div className="min-w-0">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Hash SHA-256
                      </p>
                      <p className="break-all font-mono text-sm text-slate-900 dark:text-white">
                        {agreement.hash || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6 sm:py-6">
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                  Histórico do acordo
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Linha do tempo completa das ações registradas neste convite.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <Timeline events={agreement.timeline || []} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
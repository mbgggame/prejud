"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAgreement, sendAgreementInvitationEmail } from '@/services/firebaseAgreementService';
import { useAuth } from '@/contexts/AuthContext';
import type { AgreementStatus } from '@/types/agreement';
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  FileSignature,
  ChevronRight,
  User,
  Mail,
  Briefcase,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  Clock,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface AgreementFormData {
  title: string;
  clientEmail: string;
  clientName: string;
  serviceType: string;
  description: string;
  value: string;
  deadline: string;
}

const SERVICE_TYPES = [
  { value: "desenvolvimento", label: "Desenvolvimento de Software" },
  { value: "design", label: "Design e UX/UI" },
  { value: "consultoria", label: "Consultoria" },
  { value: "marketing", label: "Marketing Digital" },
  { value: "redacao", label: "Redação e Conteúdo" },
  { value: "video", label: "Edição de Vídeo" },
  { value: "outro", label: "Outro Serviço" },
];

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
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-[#0F172A] dark:text-slate-200 dark:shadow-none">
      <Clock size={12} className="text-slate-500 dark:text-slate-400" />
      <span className="font-medium">{time}</span>
      <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
        BRT
      </span>
    </div>
  );
}

export default function FormalizarAcordoPage(): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const [formData, setFormData] = useState<AgreementFormData>({
    title: "",
    clientEmail: "",
    clientName: "",
    serviceType: "",
    description: "",
    value: "",
    deadline: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AgreementFormData, string>>
  >({});

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

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AgreementFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título do acordo é obrigatório";
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = "E-mail do cliente é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = "E-mail inválido";
    }

    if (!formData.clientName.trim()) {
      newErrors.clientName = "Nome do cliente é obrigatório";
    }

    if (!formData.serviceType) {
      newErrors.serviceType = "Tipo de serviço é obrigatório";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição do serviço é obrigatória";
    } else if (formData.description.length < 20) {
      newErrors.description = "Descrição deve ter pelo menos 20 caracteres";
    }

    if (!formData.value.trim()) {
      newErrors.value = "Valor do acordo é obrigatório";
    } else if (isNaN(parseFloat(formData.value.replace(/[R$\.,]/g, "")))) {
      newErrors.value = "Valor inválido";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Prazo de entrega é obrigatório";
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.deadline = "Prazo não pode ser anterior a hoje";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof AgreementFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/\D/g, "");
    const floatValue = parseFloat(numericValue || "0") / 100;

    return floatValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[R$\.,]/g, "");
    const formatted = formatCurrency(rawValue);
    setFormData((prev) => ({ ...prev, value: formatted }));

    if (errors.value) {
      setErrors((prev) => ({ ...prev, value: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!user) {
      alert("Usu�rio n�o autenticado");
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para criar o acordo
      const agreementData = {
        title: formData.title,
        freelancerId: user.uid,
        freelancerName: user.displayName || user.email || "Freelancer",
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        serviceType: formData.serviceType,
        description: formData.description,
        value: parseFloat(formData.value.replace(/[^\d.,]/g, "").replace(",", ".")),
        deadline: new Date(formData.deadline),
        terms: "Termos padr�o do acordo", // TODO: Adicionar campo de termos no formul�rio
        status: "pending_client_confirmation" as AgreementStatus,
      };

      // Criar o acordo no Firestore
      const newAgreement = await createAgreement(agreementData);

      // Enviar e-mail de convite para o cliente
      await sendAgreementInvitationEmail(
        newAgreement.id,
        newAgreement.clientEmail,
        newAgreement.clientName,
        newAgreement.freelancerName,
        newAgreement.title,
        newAgreement.clientAccessToken || ""
      );

      // Redirecionar para o dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao criar acordo:", error);
      alert("Erro ao criar acordo. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0A0F1A] dark:text-slate-100">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0F1A]/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-3 sm:min-h-[84px]">
            <div className="min-w-0 flex items-center gap-3 sm:gap-4">
              <Link
                href="/dashboard"
                className="group flex min-w-0 items-center gap-3"
              >
                <>
                  <Image
                    src="/prejud-logo-1200x300 preto.svg"
                    alt="PreJud"
                    width={140}
                    height={35}
                    className="h-7 w-auto object-contain dark:hidden"
                    priority
                  />
                  <Image
                    src="/prejud-logo-1200x300.svg"
                    alt="PreJud"
                    width={140}
                    height={35}
                    className="hidden h-7 w-auto object-contain dark:block"
                    priority
                  />
                </>

                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    Área do Freelancer
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
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
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:bg-white/5"
                type="button"
              >
                {dark ? "☀️" : "🌙"}
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0F172A] dark:shadow-none dark:hover:bg-white/5 sm:gap-3 sm:px-3"
                  type="button"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">
                    <Image
                      src="/escudo somente-1200x300.svg"
                      alt="Escudo PreJud"
                      width={20}
                      height={20}
                      className="h-5 w-auto object-contain opacity-80 dark:opacity-70"
                    />
                  </div>

                  <div className="hidden text-left sm:block">
                    <p className="max-w-[140px] truncate text-sm font-semibold text-slate-900 dark:text-white">
                      Freelancer
                    </p>
                    <p className="max-w-[180px] truncate text-xs text-slate-500 dark:text-slate-400">
                      {user?.email ?? "fabio.laperriere@gmail.com"}
                    </p>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform dark:text-slate-400 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0F172A]">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Freelancer
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {user?.email ?? "fabio.laperriere@gmail.com"}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                      >
                        Dashboard
                      </Link>

                      <Link
                        href="/dashboard/configuracoes"
                        className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                      >
                        Configurações
                      </Link>

                      <div className="my-2 border-t border-slate-100 dark:border-white/10" />

                      <button
                        type="button"
                        className="block w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
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
        <div className="mb-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0F172A] dark:shadow-none">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            Novo acordo
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
            Formalizar novo acordo
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Crie um acordo digital com trilha de auditoria, assinatura eletrônica
            e garantia de compliance jurídico.
          </p>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0F172A] dark:shadow-none">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6 dark:border-white/10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
              Dados do acordo
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Preencha as informações do serviço e do cliente
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Título do acordo <span className="text-red-500">*</span>
                </label>

                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FileText className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Desenvolvimento de Landing Page"
                    className={`block w-full rounded-xl border ${
                      errors.title
                        ? "border-red-300 focus:ring-red-500 dark:border-red-500/50"
                        : "border-slate-200 focus:ring-blue-500 dark:border-white/10"
                    } bg-white py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 dark:bg-[#111827] dark:text-white dark:placeholder:text-slate-500`}
                  />
                </div>

                {errors.title && (
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="clientName"
                  className="block text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Nome do cliente <span className="text-red-500">*</span>
                </label>

                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="Nome completo do cliente"
                    className={`block w-full rounded-xl border ${
                      errors.clientName
                        ? "border-red-300 focus:ring-red-500 dark:border-red-500/50"
                        : "border-slate-200 focus:ring-blue-500 dark:border-white/10"
                    } bg-white py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 dark:bg-[#111827] dark:text-white dark:placeholder:text-slate-500`}
                  />
                </div>

                {errors.clientName && (
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.clientName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="clientEmail"
                  className="block text-sm font-semibold text-slate-900 dark:text-white"
                >
                  E-mail do cliente <span className="text-red-500">*</span>
                </label>

                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="email"
                    id="clientEmail"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    placeholder="cliente@email.com"
                    className={`block w-full rounded-xl border ${
                      errors.clientEmail
                        ? "border-red-300 focus:ring-red-500 dark:border-red-500/50"
                        : "border-slate-200 focus:ring-blue-500 dark:border-white/10"
                    } bg-white py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 dark:bg-[#111827] dark:text-white dark:placeholder:text-slate-500`}
                  />
                </div>

                {errors.clientEmail && (
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.clientEmail}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="serviceType"
                  className="block text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Tipo de serviço <span className="text-red-500">*</span>
                </label>

                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Briefcase className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>

                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className={`block w-full cursor-pointer appearance-none rounded-xl border ${
                      errors.serviceType
                        ? "border-red-300 focus:ring-red-500 dark:border-red-500/50"
                        : "border-slate-200 focus:ring-blue-500 dark:border-white/10"
                    } bg-white py-3 pl-10 pr-10 text-slate-900 transition focus:outline-none focus:ring-2 dark:bg-[#111827] dark:text-white`}
                  >
                    <option value="">Selecione o tipo de serviço</option>
                    {SERVICE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronRight className="h-5 w-5 rotate-90 text-slate-400 dark:text-slate-500" />
                  </div>
                </div>

                {errors.serviceType && (
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.serviceType}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="value"
                  className="block text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Valor do acordo <span className="text-red-500">*</span>
                </label>

                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <DollarSign className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    id="value"
                    name="value"
                    value={formData.value}
                    onChange={handleValueChange}
                    placeholder="R$ 0,00"
                    className={`block w-full rounded-xl border ${
                      errors.value
                        ? "border-red-300 focus:ring-red-500 dark:border-red-500/50"
                        : "border-slate-200 focus:ring-blue-500 dark:border-white/10"
                    } bg-white py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 dark:bg-[#111827] dark:text-white dark:placeholder:text-slate-500`}
                  />
                </div>

                {errors.value && (
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.value}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="deadline"
                  className="block text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Prazo de entrega <span className="text-red-500">*</span>
                </label>

                <div className="relative mt-2 max-w-md">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Calendar className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`block w-full rounded-xl border ${
                      errors.deadline
                        ? "border-red-300 focus:ring-red-500 dark:border-red-500/50"
                        : "border-slate-200 focus:ring-blue-500 dark:border-white/10"
                    } bg-white py-3 pl-10 pr-4 text-slate-900 transition focus:outline-none focus:ring-2 dark:bg-[#111827] dark:text-white`}
                  />
                </div>

                {errors.deadline && (
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.deadline}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Descrição detalhada do serviço <span className="text-red-500">*</span>
                </label>

                <div className="mt-2">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva detalhadamente o escopo do serviço, entregáveis e critérios de aceitação..."
                    className={`block w-full resize-none rounded-xl border ${
                      errors.description
                        ? "border-red-300 focus:ring-red-500 dark:border-red-500/50"
                        : "border-slate-200 focus:ring-blue-500 dark:border-white/10"
                    } bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 dark:bg-[#111827] dark:text-white dark:placeholder:text-slate-500`}
                  />
                </div>

                {errors.description ? (
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.description}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    Mínimo de 20 caracteres. Seja específico sobre o que será entregue.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 dark:border-white/10 sm:flex-row sm:justify-end sm:gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-white/5"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Criando acordo...
                  </>
                ) : (
                  <>
                    <FileSignature className="h-4 w-4" />
                    Criar acordo
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-center gap-3 py-6 text-center">
          <Image
            src="/escudo somente-1200x300.svg"
            alt="PreJud Escudo"
            width={48}
            height={48}
            className="h-12 w-auto object-contain opacity-60 dark:opacity-40"
          />
          <p className="text-xs text-slate-400 dark:text-slate-500">
            PreJud — Formalizando relações profissionais com trilha verificável.
          </p>
        </footer>
      </main>
    </div>
  );
}
"use client";

import React from 'react';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { submitAgreement } from "@/services/agreementServiceAdapter";
import {
  Shield,
  ArrowLeft,
  FileSignature,
  User,
  Mail,
  CreditCard,
  Briefcase,
  DollarSign,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ==========================================
// TIPOS
// ==========================================

type ServiceType = 
  | "design_grafico"
  | "web_design"
  | "desenvolvimento_site"
  | "desenvolvimento_sistema"
  | "programacao"
  | "social_media"
  | "gestao_trafego"
  | "marketing_digital"
  | "copywriting"
  | "redacao"
  | "traducao"
  | "edicao_video"
  | "motion_design"
  | "fotografia"
  | "ilustracao"
  | "consultoria"
  | "arquitetura"
  | "engenharia"
  | "producao_audiovisual"
  | "outros";

interface AgreementFormData {
  // Dados do cliente
  cliente_nome: string;
  cliente_email: string;
  cliente_documento: string;
  cliente_telefone: string;
  
  // Tipo de servico
  tipo_servico: ServiceType;
  tipo_servico_outro: string;
  
  // Dados do acordo
  titulo_acordo: string;
  descricao_servico: string;
  valor_acordo: string;
  data_entrega: string;
  termos_do_acordo: string;
}

// ==========================================
// HELPERS DE FORMATAÇÃO
// ==========================================

function formatCurrencyBR(value: string): string {
  const numericValue = value.replace(/\D/g, "");
  const cents = parseInt(numericValue || "0", 10);
  const formatted = (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatted;
}

function unformatCurrencyBR(value: string): string {
  const numericValue = value.replace(/\D/g, "");
  const cents = parseInt(numericValue || "0", 10);
  return (cents / 100).toFixed(2).replace(".", ",");
}

function formatDocumentBR(value: string): string {
  const numericValue = value.replace(/\D/g, "");
  const limited = numericValue.slice(0, 14);
  if (limited.length <= 11) {
    return limited
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    return limited
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }
}

// ==========================================
// CONFIGURAÇÃO
// ==========================================

const serviceTypes: { value: ServiceType; label: string }[] = [
  { value: "design_grafico", label: "Design grafico" },
  { value: "web_design", label: "Web design" },
  { value: "desenvolvimento_site", label: "Desenvolvimento de site" },
  { value: "desenvolvimento_sistema", label: "Desenvolvimento de sistema" },
  { value: "programacao", label: "Programacao" },
  { value: "social_media", label: "Social media" },
  { value: "gestao_trafego", label: "Gestao de trafego" },
  { value: "marketing_digital", label: "Marketing digital" },
  { value: "copywriting", label: "Copywriting" },
  { value: "redacao", label: "Redacao" },
  { value: "traducao", label: "Traducao" },
  { value: "edicao_video", label: "Edicao de video" },
  { value: "motion_design", label: "Motion design" },
  { value: "fotografia", label: "Fotografia" },
  { value: "ilustracao", label: "Ilustracao" },
  { value: "consultoria", label: "Consultoria" },
  { value: "arquitetura", label: "Arquitetura" },
  { value: "engenharia", label: "Engenharia" },
  { value: "producao_audiovisual", label: "Producao audiovisual" },
  { value: "outros", label: "Outros" },
];

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function FormalizarAcordoPage(): React.JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<AgreementFormData>({
    cliente_nome: "",
    cliente_documento: "",
    cliente_telefone: "",
    cliente_documento: "",`r`n    cliente_telefone: "",
    tipo_servico: "desenvolvimento_site",
    tipo_servico_outro: "",
    titulo_acordo: "",
    descricao_servico: "",
    valor_acordo: "",
    data_entrega: "",
    termos_do_acordo: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    let maskedValue = value;
    if (name === "valor_acordo") {
      maskedValue = formatCurrencyBR(value);
    } else if (name === "cliente_documento") {
      maskedValue = formatDocumentBR(value);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: maskedValue,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.cliente_nome.trim()) return false;
    if (!formData.cliente_email.trim()) return false;
    if (!formData.titulo_acordo.trim()) return false;
    if (!formData.descricao_servico.trim()) return false;
    if (!formData.termos_do_acordo.trim()) return false;
    if (formData.tipo_servico === "outros" && !formData.tipo_servico_outro.trim()) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const agreementData = {
        title: formData.titulo_acordo,
        freelancerId: user?.uid || "",
        freelancerName: user?.displayName || user?.email || "Freelancer",
        clientName: formData.cliente_nome,
        clientEmail: formData.cliente_email,
        clientDocument: formData.cliente_documento || "",
        serviceType:
          formData.tipo_servico === "outros"
            ? formData.tipo_servico_outro
            : formData.tipo_servico,
        description: formData.descricao_servico,
        value: unformatCurrencyBR(formData.valor_acordo),
        deadline: formData.data_entrega,
        terms: formData.termos_do_acordo,
        status: "pending_confirmation" as const,
      };

      await submitAgreement(agreementData);
      setLoading(false);
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao formalizar acordo:", error);
      setLoading(false);
    }
  };
  const showOtherService = formData.tipo_servico === "outros";

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Voltar ao dashboard</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">PreJud</h1>
                <p className="text-xs text-gray-400">Formalizar Acordo</p>
              </div>
            </div>
            
            <div className="w-32" />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <FileSignature className="w-3 h-3" />
            Novo Acordo
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Formalizar acordo com cliente
          </h1>
          <p className="text-gray-400">
            Preencha os dados do acordo. O cliente recebera um convite para confirmar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Dados do cliente</h2>
                <p className="text-sm text-gray-500">Informacoes da parte contratante</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome completo <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    name="cliente_nome"
                    value={formData.cliente_nome}
                    onChange={handleInputChange}
                    placeholder="Nome do cliente"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-mail <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    name="cliente_email"
                    value={formData.cliente_email}
                    onChange={handleInputChange}
                    placeholder="cliente@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CPF ou CNPJ
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    name="cliente_documento"
                    value={formData.cliente_documento}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Tipo de servico</h2>
                <p className="text-sm text-gray-500">Categoria do trabalho</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Selecione o servico <span className="text-red-400">*</span>
                </label>
                <select
                  name="tipo_servico"
                  value={formData.tipo_servico}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
                  required
                >
                  {serviceTypes.map((service) => (
                    <option key={service.value} value={service.value} className="bg-[#1a1a1c]">
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>

              {showOtherService && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Especificar servico <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="tipo_servico_outro"
                    value={formData.tipo_servico_outro}
                    onChange={handleInputChange}
                    placeholder="Descreva o tipo de servico"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    required={showOtherService}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Dados do acordo</h2>
                <p className="text-sm text-gray-500">Detalhes do combinado</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titulo do acordo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="titulo_acordo"
                  value={formData.titulo_acordo}
                  onChange={handleInputChange}
                  placeholder="Ex: Desenvolvimento de Landing Page"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descricao do servico <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="descricao_servico"
                  value={formData.descricao_servico}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descreva o que sera entregue"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor do acordo
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      name="valor_acordo"
                      value={formData.valor_acordo}
                      onChange={handleInputChange}
                      placeholder="0,00"
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de entrega
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="date"
                      name="data_entrega"
                      value={formData.data_entrega}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Termos do acordo <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="termos_do_acordo"
                  value={formData.termos_do_acordo}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Descreva detalhadamente: entregaveis, numero de revisoes, condicoes de pagamento, direitos autorais, confidencialidade, etc."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                  required
                />
              </div>
            </div>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Formalizacao</h2>
                <p className="text-sm text-gray-500">Confirmacao e envio</p>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-1">Fluxo de confirmacao</h4>
                  <p className="text-sm text-gray-400">
                    Um convite de confirmacao sera enviado ao cliente para validar este acordo. 
                    O acordo so tera validade apos a confirmacao do cliente.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !validateForm()}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all hover:scale-[1.02] disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando convite...
                </>
              ) : (
                <>
                  <FileSignature className="w-5 h-5" />
                  Formalizar acordo
                </>
              )}
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}


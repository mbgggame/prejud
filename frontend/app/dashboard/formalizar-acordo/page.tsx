'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitAgreement } from "@/services/agreementServiceAdapter";
import { useAuth } from "@/lib/hooks/useAuth";
import { ServiceType } from "@/types/agreement";
import {
  ArrowLeft,
  FileText,
  User,
  Mail,
  Phone,
  FileDigit,
  Briefcase,
  DollarSign,
  Calendar,
  ClipboardList,
  Shield,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ==========================================
// TIPOS LOCAIS
// ==========================================

interface FormData {
  titulo_acordo: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string;
  cliente_documento: string;
  tipo_servico: ServiceType | "";
  tipo_servico_outro: string;
  descricao_servico: string;
  valor_acordo: string;
  data_entrega: string;
  termos_do_acordo: string;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function FormalizarAcordoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    titulo_acordo: "",
    cliente_nome: "",
    cliente_email: "",
    cliente_telefone: "",
    cliente_documento: "",
    tipo_servico: "",
    tipo_servico_outro: "",
    descricao_servico: "",
    valor_acordo: "",
    data_entrega: "",
    termos_do_acordo: "",
  });

  const unformatCurrencyBR = (value: string): number => {
    const numeric = value.replace(/[^0-9]/g, "");
    return Number(numeric) / 100;
  };

  const validateForm = (): boolean => {
    if (!formData.titulo_acordo.trim()) return false;
    if (!formData.cliente_nome.trim()) return false;
    if (!formData.cliente_email.trim()) return false;
    if (!formData.descricao_servico.trim()) return false;
    if (!formData.valor_acordo.trim()) return false;
    if (!formData.data_entrega) return false;
    if (!formData.termos_do_acordo.trim()) return false;
    if (formData.tipo_servico === "outro" && !formData.tipo_servico_outro.trim()) return false;
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
        clientId: formData.cliente_email,
        freelancerName: user?.displayName || user?.email || "Freelancer",
        clientName: formData.cliente_nome,
        clientEmail: formData.cliente_email,
        clientPhone: formData.cliente_telefone || undefined,
        clientDocument: formData.cliente_documento || "",
        serviceType: (formData.tipo_servico === "outro" ? formData.tipo_servico_outro : formData.tipo_servico) as ServiceType,
        description: formData.descricao_servico,
        value: unformatCurrencyBR(formData.valor_acordo),
        deadline: new Date(formData.data_entrega),
        terms: formData.termos_do_acordo,
        status: "pending_client_confirmation" as const,
        hash: "temp-hash-" + Date.now(),
      };

      await submitAgreement(agreementData);
      setLoading(false);
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao formalizar acordo:", error);
      setLoading(false);
    }
  };

  const showOtherService = formData.tipo_servico === "outro";

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <h1 className="text-lg font-semibold text-white">Novo Acordo</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#1A1A1D] rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <Shield className="w-6 h-6 text-emerald-500" />
                Formalizar Novo Acordo
              </h2>
              <p className="text-gray-400 mt-2">
                Preencha os dados abaixo para criar um novo acordo profissional
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Titulo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Titulo do Acordo
                </label>
                <input
                  type="text"
                  value={formData.titulo_acordo}
                  onChange={(e) => setFormData({ ...formData, titulo_acordo: e.target.value })}
                  className="w-full bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                  placeholder="Ex: Desenvolvimento de Site E-commerce"
                  required
                />
              </div>

              {/* Dados do Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.cliente_nome}
                    onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                    className="w-full bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email do Cliente
                  </label>
                  <input
                    type="email"
                    value={formData.cliente_email}
                    onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                    className="w-full bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="cliente@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.cliente_telefone}
                    onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
                    className="w-full bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FileDigit className="w-4 h-4 text-gray-500" />
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    value={formData.cliente_documento}
                    onChange={(e) => setFormData({ ...formData, cliente_documento: e.target.value })}
                    className="w-full bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              {/* Tipo de Servico */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  Tipo de Servico
                </label>
                <select
                  value={formData.tipo_servico}
                  onChange={(e) => setFormData({ ...formData, tipo_servico: e.target.value as ServiceType })}
                  className="w-full bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="desenvolvimento">Desenvolvimento</option>
                  <option value="design">Design</option>
                  <option value="consultoria">Consultoria</option>
                  <option value="redacao">Redacao</option>
                  <option value="marketing">Marketing</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {showOtherService && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Especifique o tipo de servico
                  </label>
                  <input
                    type="text"
                    value={formData.tipo_servico_outro}
                    onChange={(e) => setFormData({ ...formData, tipo_servico_outro: e.target.value })}
                    className="w-full bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="Descreva o tipo de servico"
                    required
                  />
                </div>
              )}

              {/* Descricao */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-gray-500" />
                  Descricao do Servico
                </label>
                <textarea
                  value={formData.descricao_servico}
                  onChange={(e) => setFormData({ ...formData, descricao_servico: e.target.value })}
                  className="w-full bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 min-h-[120px] resize-none"
                  placeholder="Descreva detalhadamente o servico a ser prestado..."
                  required
                />
              </div>

              {/* Valor e Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    Valor do Acordo
                  </label>
                  <input
                    type="text"
                    value={formData.valor_acordo}
                    onChange={(e) => setFormData({ ...formData, valor_acordo: e.target.value })}
                    className="w-full bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="R$ 0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Data de Entrega
                  </label>
                  <input
                    type="date"
                    value={formData.data_entrega}
                    onChange={(e) => setFormData({ ...formData, data_entrega: e.target.value })}
                    className="w-full bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    required
                  />
                </div>
              </div>

              {/* Termos */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Termos do Acordo
                </label>
                <textarea
                  value={formData.termos_do_acordo}
                  onChange={(e) => setFormData({ ...formData, termos_do_acordo: e.target.value })}
                  className="w-full bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 min-h-[100px] resize-none"
                  placeholder="Termos e condicoes do acordo..."
                  required
                />
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !validateForm()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Criando Acordo...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Formalizar Acordo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

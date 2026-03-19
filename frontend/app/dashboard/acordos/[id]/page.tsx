"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { agreementService } from "@/services/agreementService";
import { Agreement } from "@/types/agreement";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, FileText, User, Mail, DollarSign, Calendar, Shield } from "lucide-react";

export default function AcordoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const agreementId = params.id as string;

  useEffect(() => {
    if (!agreementId || !user) return;

    const loadAgreement = async () => {
      try {
        setLoading(true);
        const data = await agreementService.getById(agreementId);
        if (!data) {
          setError("Acordo nao encontrado");
          return;
        }
        if (data.freelancerId !== user.uid && data.clientId !== user.email) {
          setError("Voce nao tem permissao para visualizar este acordo");
          return;
        }
        setAgreement(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar acordo");
      } finally {
        setLoading(false);
      }
    };

    loadAgreement();
  }, [agreementId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white">{error}</p>
          <Link href="/dashboard" className="text-emerald-500 hover:underline mt-4 inline-block">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!agreement) return null;

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <h1 className="text-lg font-semibold text-white">Detalhes do Acordo</h1>
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
                {agreement.title}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Status
                  </label>
                  <p className="text-white bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3">
                    {agreement.status}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Cliente
                  </label>
                  <p className="text-white bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3">
                    {agreement.clientName}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email do Cliente
                  </label>
                  <p className="text-white bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3">
                    {agreement.clientEmail}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Valor
                  </label>
                  <p className="text-white bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3">
                    R$ {agreement.value?.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Prazo
                  </label>
                  <p className="text-white bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3">
                    {agreement.deadline ? new Date(agreement.deadline).toLocaleDateString("pt-BR") : "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Protocolo
                  </label>
                  <p className="text-white bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 font-mono text-sm">
                    {agreement.protocol}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Descricao</label>
                <p className="text-gray-300 bg-[#0B0B0D] border border-white/10 rounded-lg px-4 py-3 min-h-[100px]">
                  {agreement.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

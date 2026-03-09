"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, FileSignature, User, Briefcase, DollarSign, Calendar, ArrowRight, Loader2 } from "lucide-react";

export default function ConvitePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  
  const token = params.token;

  const handleCriarConta = () => {
    setLoading(true);
    router.push(`/registro?convite=${token}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PreJud</span>
            </div>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white">Já tenho conta</Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-8 max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
          <FileSignature className="w-3 h-3" />
          Convite de acordo
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Convite para confirmar acordo</h1>
        <p className="text-gray-400 mb-8">Um profissional registrou um acordo com você.</p>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8 text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-purple-400" />
              <div><p className="text-xs text-gray-500">Freelancer</p><p className="text-white">João Silva</p></div>
            </div>
            <div className="flex items-center gap-4">
              <Briefcase className="w-5 h-5 text-blue-400" />
              <div><p className="text-xs text-gray-500">Serviço</p><p className="text-white">Desenvolvimento</p></div>
            </div>
            <div className="flex items-center gap-4">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <div><p className="text-xs text-gray-500">Valor</p><p className="text-white">R$ 3.500,00</p></div>
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-orange-400" />
              <div><p className="text-xs text-gray-500">Prazo</p><p className="text-white">15/04/2024</p></div>
            </div>
          </div>
        </div>

        <button onClick={handleCriarConta} disabled={loading} className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" />Criar conta e acessar</>}
        </button>
      </main>
    </div>
  );
}
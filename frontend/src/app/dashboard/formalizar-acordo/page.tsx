"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function FormalizarAcordoPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            <span className="font-bold">PreJud</span>
          </div>
          <div className="w-20"></div>
        </div>
      </header>
      
      <main className="pt-20 p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Formalizar Acordo</h1>
        <form className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Título</label>
            <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Cliente</label>
            <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white" />
          </div>
          <button type="button" onClick={() => router.push("/dashboard")} 
            className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium">
            Formalizar
          </button>
        </form>
      </main>
    </div>
  );
}

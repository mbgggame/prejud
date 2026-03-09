"use client";

import React from 'react';

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft, Clock } from "lucide-react";

export default function AcordosPage(): React.JSX.Element {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/cliente/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Voltar</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">PreJud Cliente</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acordos</h1>
          <p className="text-gray-400 mb-6">Esta pagina esta em desenvolvimento.</p>
          <button
            onClick={() => router.push("/cliente/dashboard")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            Voltar ao dashboard
          </button>
        </div>
      </main>
    </div>
  );
}


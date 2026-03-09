"use client";

import React from 'react';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  Shield,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Clock,
  FileSignature,
  DollarSign,
  Bell,
  CheckCircle,
  AlertTriangle,
  Eye,
  XCircle,
  History,
} from "lucide-react";

// ==========================================
// TIPOS
// ==========================================

type SolicitacaoStatus = "pendente_confirmacao" | "confirmado" | "contestacao" | "disputa";

interface Solicitacao {
  id: string;
  tipo: "acordo" | "cobranca" | "notificacao";
  freelancer: string;
  servico: string;
  valor?: string;
  prazo?: string;
  status: SolicitacaoStatus;
  data: string;
}

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

function BrazilClock() {
  const [time, setTime] = useState("");
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit"
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1 text-xs text-gray-400">
      <Clock size={12} />
      <span>{time}</span>
      <span className="text-[10px]">BRT</span>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function ClienteDashboardPage(): React.JSX.Element {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  
  // TODO: Buscar do backend
  const stats = {
    pendentes: 2,
    ativos: 3,
    cobrancas: 1,
    notificacoes: 0
  };

  const solicitacoes: Solicitacao[] = [
    {
      id: "1",
      tipo: "acordo",
      freelancer: "Maria Oliveira",
      servico: "Design de logo",
      valor: "R$ 800,00",
      prazo: "20/03/2024",
      status: "pendente_confirmacao",
      data: "15/03/2024"
    },
    {
      id: "2",
      tipo: "cobranca",
      freelancer: "Joao Silva",
      servico: "Desenvolvimento de site",
      valor: "R$ 3.500,00",
      status: "pendente_confirmacao",
      data: "14/03/2024"
    }
  ];

  const acordosAtivos = [
    {
      id: "3",
      titulo: "Redacao de artigos",
      freelancer: "Ana Costa",
      prazo: "30/03/2024",
      status: "confirmado"
    }
  ];

  const historico = [
    { acao: "Vocaª confirmou um acordo", data: "10/03/2024" },
    { acao: "Vocaª contestou uma cobranca", data: "05/03/2024" },
    { acao: "Vocaª respondeu uma notificacao", data: "01/03/2024" }
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleConfirmar = (id: string) => {
    // TODO: Implementar confirmacao
    console.log("Confirmar:", id);
  };

  const handleContestar = (id: string) => {
    // TODO: Implementar contestacao
    console.log("Contestar:", id);
  };

  const handleNaoReconheco = (id: string) => {
    // TODO: Implementar disputa
    console.log("Nao reconheco:", id);
  };

  const getStatusColor = (status: SolicitacaoStatus) => {
    switch (status) {
      case "pendente_confirmacao": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "confirmado": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "contestacao": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "disputa": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400";
    }
  };

  const getStatusLabel = (status: SolicitacaoStatus) => {
    switch (status) {
      case "pendente_confirmacao": return "Pendente";
      case "confirmado": return "Confirmado";
      case "contestacao": return "Contestado";
      case "disputa": return "Em disputa";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/cliente/dashboard" className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center justify-center transition-all">
                <Shield className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">PreJud Cliente</h1>
                <p className="text-xs text-gray-400">area do cliente</p>
              </div>
            </div>

            <div className="hidden md:block">
              <BrazilClock />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <User size={16} className="text-purple-400" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">Cliente</span>
                  <ChevronDown size={16} className={`transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                      <p className="text-white font-medium text-sm">Cliente</p>
                      <p className="text-gray-500 text-xs truncate">cliente@email.com</p>
                    </div>
                    <div className="py-1">
                      <Link href="/cliente/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                        <Shield size={16} />
                        Dashboard
                      </Link>
                      <Link href="/cliente/configuracoes" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                        <Settings size={16} />
                        Configuracoes
                      </Link>
                      <div className="my-1 border-t border-white/10" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <LogOut size={16} />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="pt-24 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
        {/* CARDS DE ESTATaSTICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.pendentes}</span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">Pendentes de resposta</p>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.ativos}</span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">Acordos ativos</p>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.cobrancas}</span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">Cobrancas recebidas</p>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.notificacoes}</span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">Notificacoes</p>
          </div>
        </div>

        {/* SEa‡aƒO 1: SOLICITAa‡a•ES PENDENTES */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Solicitacoes pendentes</h2>
          
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
            {solicitacoes.map((solicitacao) => (
              <div key={solicitacao.id} className="p-6 border-b border-white/5 last:border-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(solicitacao.status).replace('text-', 'bg-').replace('/10', '/20').split(' ')[0]}`}>
                      <FileSignature className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {solicitacao.tipo === "acordo" ? "Acordo aguardando confirmacao" : "Cobranca recebida"}
                      </h3>
                      <p className="text-sm text-gray-500">{solicitacao.freelancer} â€¢ {solicitacao.data}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 border text-xs rounded-full ${getStatusColor(solicitacao.status)}`}>
                    {getStatusLabel(solicitacao.status)}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Servico</p>
                    <p className="text-gray-300">{solicitacao.servico}</p>
                  </div>
                  {solicitacao.valor && (
                    <div>
                      <p className="text-gray-500">Valor</p>
                      <p className="text-gray-300">{solicitacao.valor}</p>
                    </div>
                  )}
                  {solicitacao.prazo && (
                    <div>
                      <p className="text-gray-500">Prazo</p>
                      <p className="text-gray-300">{solicitacao.prazo}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleConfirmar(solicitacao.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirmar acordo
                  </button>
                  
                  <button
                    onClick={() => handleContestar(solicitacao.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-all"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Solicitar ajuste
                  </button>
                  
                  <button
                    onClick={() => handleNaoReconheco(solicitacao.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Nao reconheco este acordo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEa‡aƒO 2: ACORDOS ATIVOS */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Acordos ativos</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {acordosAtivos.map((acordo) => (
              <div key={acordo.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">{acordo.titulo}</h3>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
                    Ativo
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">Freelancer: {acordo.freelancer}</p>
                <p className="text-sm text-gray-500 mb-4">Prazo: {acordo.prazo}</p>
                <Link
                  href={`/cliente/acordos/${acordo.id}`}
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Ver acordo
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* SEa‡aƒO 3: HISTa“RICO RECENTE */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Historico recente</h2>
          
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="space-y-4">
              {historico.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center">
                    <History className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm">{item.acao}</p>
                    <p className="text-gray-500 text-xs">{item.data}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


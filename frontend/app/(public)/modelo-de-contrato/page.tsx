"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  ArrowRight, 
  Menu, 
  X, 
  LogOut, 
  Clock, 
  Loader2,
  User,
  Settings,
  ChevronDown,
  Bell,
  FileText,
  History,
  Send,
  FileCheck,
  AlertCircle,
  MessageSquare,
  DollarSign,
  Calendar,
  UserX,
  Hash,
  Eye,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BrazilClockProps {
  className?: string;
}

function BrazilClock({ className = "" }: BrazilClockProps) {
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      const brazilTime = now.toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit'
      });
      setTime(brazilTime);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex items-center gap-1 text-xs text-gray-400 ${className}`}>
        <Clock size={12} />
        <span>--:--</span>
        <span className="text-[10px]">BRT</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 text-xs text-gray-400 ${className}`}>
      <Clock size={12} />
      <span>{time || '--:--'}</span>
      <span className="text-[10px]">BRT</span>
    </div>
  );
}

interface ErrorCard {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

export default function ModeloContratoFreelancerPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const isLoggedIn = !!user;
  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'UsuÃ¡rio';
  const userEmail = user?.email || '';

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      router.push('/');
    } catch (error: unknown) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleCriarRegistro = (): void => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/registro');
    }
  };

  const errorCards: ErrorCard[] = [
    {
      icon: MessageSquare,
      title: "Acordos apenas por mensagem",
      description: "Tudo fica apenas em conversas informais."
    },
    {
      icon: FileCheck,
      title: "Escopo mal definido",
      description: "MudanÃ§as no projeto geram conflitos."
    },
    {
      icon: DollarSign,
      title: "Pagamento nÃ£o combinado",
      description: "Falta de clareza sobre valores e prazos."
    },
    {
      icon: UserX,
      title: "Cliente desaparece",
      description: "ApÃ³s a entrega, o pagamento nÃ£o acontece."
    }
  ];

  const features: Feature[] = [
    {
      icon: Hash,
      title: "Registro digital verificÃ¡vel",
      description: "Cada acordo recebe um hash SHA-256."
    },
    {
      icon: Eye,
      title: "Protocolo rastreÃ¡vel",
      description: "Todas as aÃ§Ãµes recebem nÃºmero de protocolo."
    },
    {
      icon: History,
      title: "HistÃ³rico completo",
      description: "Acordos, notificaÃ§Ãµes e respostas ficam registrados."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white font-sans selection:bg-purple-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold tracking-tight">PreJud</span>
                <BrazilClock />
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#por-que-contrato" className="text-sm text-gray-400 hover:text-white transition-colors">Por Que Contrato</a>
              <a href="#modelo" className="text-sm text-gray-400 hover:text-white transition-colors">Modelo</a>
              <a href="#erros" className="text-sm text-gray-400 hover:text-white transition-colors">Erros Comuns</a>
              <a href="#como-ajuda" className="text-sm text-gray-400 hover:text-white transition-colors">Como Ajuda</a>
              <Link href="/freelas" className="text-sm text-gray-400 hover:text-white transition-colors">Para Freelancers</Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                        <User size={16} className="text-purple-400" />
                      </div>
                      <span className="text-sm font-medium">{userName}</span>
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    {profileOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setProfileOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                          <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                            <p className="text-white font-medium text-sm">{userName}</p>
                            <p className="text-gray-500 text-xs truncate">{userEmail}</p>
                          </div>
                          <div className="py-1">
                            <Link 
                              href="/dashboard"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Shield size={16} />
                              Dashboard
                            </Link>
                            <Link 
                              href="/perfil"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <User size={16} />
                              Meu perfil
                            </Link>
                            <Link 
                              href="/configuracoes"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Settings size={16} />
                              ConfiguraÃ§Ãµes
                            </Link>
                            <div className="my-1 border-t border-white/10"></div>
                            <button
                              onClick={() => {
                                setProfileOpen(false);
                                handleLogout();
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                              <LogOut size={16} />
                              Sair
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Login</Link>
                  <Link href="/registro" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all hover:scale-105">
                    Criar Conta
                  </Link>
                </>
              )}
            </div>

            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B0B0D] border-t border-white/5 px-6 py-4 space-y-4">
            <a href="#por-que-contrato" className="block text-gray-400 hover:text-white">Por Que Contrato</a>
            <a href="#modelo" className="block text-gray-400 hover:text-white">Modelo</a>
            <a href="#erros" className="block text-gray-400 hover:text-white">Erros Comuns</a>
            <a href="#como-ajuda" className="block text-gray-400 hover:text-white">Como Ajuda</a>
            <Link href="/freelas" className="block text-gray-400 hover:text-white">Para Freelancers</Link>
            <div className="pt-4 border-t border-white/5 space-y-3">
              {isLoggedIn ? (
                <>
                  <span className="block text-sm text-gray-500">Logado como: {user?.email}</span>
                  <Link href="/dashboard" className="block w-full text-left text-gray-300">Dashboard</Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 bg-red-500/10 text-red-400 rounded-lg">
                    <LogOut size={16} /> Sair
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block w-full text-left text-gray-300">Login</Link>
                  <Link href="/registro" className="block w-full px-4 py-2 bg-purple-600 text-white rounded-lg">Criar Conta</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-20 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                <FileText size={12} />
                Modelo de contrato
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
                Modelo de contrato freelancer{" "}
                <span className="text-purple-400">simples e profissional</span>.
              </h1>
              
              <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                Veja como criar um contrato bÃ¡sico para proteger seus trabalhos e evitar problemas de pagamento.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleCriarRegistro}
                  className="group px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  Criar registro de acordo
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="#modelo"
                  className="group px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  Ver como funciona
                </a>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Proteja seus freelas
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Evite conflitos com clientes
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  <span className="ml-4 text-xs text-gray-500">Contrato de PrestaÃ§Ã£o de ServiÃ§os</span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border-l-4 border-purple-500">
                    <p className="text-sm font-medium mb-1">Contratante:</p>
                    <p className="text-xs text-gray-400">[Nome do cliente]</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm font-medium mb-1">Prestador:</p>
                    <p className="text-xs text-gray-400">[Nome do freelancer]</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm font-medium mb-2">ServiÃ§o contratado:</p>
                    <p className="text-xs text-gray-400 mb-3">DescriÃ§Ã£o do trabalho a ser realizado</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Valor:</span>
                        <p className="text-green-400">R$ XXXX</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Prazo:</span>
                        <p className="text-blue-400">XX dias</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle size={14} className="text-purple-400" />
                      <p className="text-xs text-purple-400">Hash de verificaÃ§Ã£o</p>
                    </div>
                    <p className="text-xs font-mono text-gray-400 break-all">c4d8e1f5a2b9...</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* SeÃ§Ã£o 1: Por Que Usar Contrato */}
      <section id="por-que-contrato" className="py-20 lg:py-32 bg-[#0a0a0c] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Por que usar contrato em trabalhos freelancer?
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              Muitos trabalhos freelancer comeÃ§am apenas com mensagens ou acordos verbais. 
              Quando surgem conflitos sobre pagamento, prazo ou escopo, provar o combinado pode ser difÃ­cil.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
            <h3 className="text-xl font-semibold mb-6 text-purple-400">Um contrato simples ajuda a definir:</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="font-medium mb-1">valor do serviÃ§o</p>
                  <p className="text-sm text-gray-400">Evita discussÃµes sobre quanto deve ser pago</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="font-medium mb-1">prazo de entrega</p>
                  <p className="text-sm text-gray-400">Data clara para entrega do trabalho</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <FileCheck size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="font-medium mb-1">escopo do trabalho</p>
                  <p className="text-sm text-gray-400">O que estÃ¡ incluÃ­do e o que nÃ£o estÃ¡</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <Send size={20} className="text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium mb-1">forma de pagamento</p>
                  <p className="text-sm text-gray-400">PIX, transferÃªncia, parcelamento, etc.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-gray-300 text-center">
                Isso reduz conflitos e protege <span className="text-purple-400 font-semibold">ambas as partes</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SeÃ§Ã£o 2: Modelo de Contrato */}
      <section id="modelo" className="py-20 lg:py-32 bg-[#0B0B0D]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Modelo bÃ¡sico de contrato freelancer</h2>
            <p className="text-gray-400">Use esta estrutura como base para seus acordos.</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8 pb-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-purple-400 mb-2">CONTRATO DE PRESTAÃ‡ÃƒO DE SERVIÃ‡OS FREELANCER</h3>
              <p className="text-sm text-gray-500">Modelo simplificado para proteger seu trabalho</p>
            </div>

            <div className="space-y-6 text-gray-300">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm font-semibold text-blue-400 mb-1">Contratante:</p>
                  <p className="text-sm">[Nome completo do cliente]</p>
                  <p className="text-sm text-gray-500">[CPF/CNPJ]</p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm font-semibold text-purple-400 mb-1">Prestador:</p>
                  <p className="text-sm">[Nome completo do freelancer]</p>
                  <p className="text-sm text-gray-500">[CPF/CNPJ]</p>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-sm font-semibold mb-2">ServiÃ§o contratado:</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  [DescriÃ§Ã£o detalhada do trabalho a ser realizado, incluindo entregÃ¡veis especÃ­ficos]
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Valor</p>
                  <p className="text-lg font-semibold text-green-400">R$ XXXX</p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Prazo de entrega</p>
                  <p className="text-lg font-semibold text-blue-400">XX/XX/XXXX</p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Forma de pagamento</p>
                  <p className="text-lg font-semibold text-yellow-400">PIX/TransferÃªncia</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                <p className="text-sm font-semibold text-yellow-400 mb-2">ObservaÃ§Ãµes:</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Qualquer alteraÃ§Ã£o de escopo deve ser acordada entre as partes por escrito. 
                  O pagamento deve ser realizado em atÃ© X dias apÃ³s a entrega e aprovaÃ§Ã£o do trabalho.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div className="text-center">
                  <div className="h-px bg-white/20 mb-4"></div>
                  <p className="text-sm text-gray-500">Assinatura do Contratante</p>
                </div>
                <div className="text-center">
                  <div className="h-px bg-white/20 mb-4"></div>
                  <p className="text-sm text-gray-500">Assinatura do Prestador</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              ðŸ’¡ <span className="text-purple-400">Dica:</span> Registre este acordo no PreJud para ter prova digital verificÃ¡vel.
            </p>
          </div>
        </div>
      </section>

      {/* SeÃ§Ã£o 3: Erros Comuns */}
      <section id="erros" className="py-20 lg:py-32 bg-[#0a0a0c] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Erros comuns em acordos freelancer</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Evite estas situaÃ§Ãµes para proteger seus trabalhos.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {errorCards.map((card, idx) => (
              <div 
                key={idx}
                className="group p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-red-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <card.icon className="text-red-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SeÃ§Ã£o 4: Como o PreJud Ajuda */}
      <section id="como-ajuda" className="py-20 lg:py-32 bg-[#0B0B0D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Registre acordos freelancer com seguranÃ§a
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                O PreJud permite registrar acordos, gerar prova com hash criptogrÃ¡fico e enviar cobranÃ§as formais caso o pagamento nÃ£o aconteÃ§a.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-purple-500/20 rounded-full blur-3xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                <Shield size={80} className="text-purple-400 relative z-10" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="group p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-green-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-green-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-purple-900/20 to-[#0B0B0D]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Proteja seus prÃ³ximos freelas
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Registre acordos e tenha uma forma profissional de resolver conflitos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleCriarRegistro}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all hover:scale-105"
            >
              Criar meu primeiro registro
            </button>
            {isLoggedIn && (
              <Link 
                href="/dashboard"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                Acessar dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0B0B0D] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-semibold">PreJud</span>
              </div>
              <p className="text-sm text-gray-500">
                NotificaÃ§Ã£o extrajudicial com integridade digital garantida.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">PreÃ§os</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">JurÃ­dico</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>suporte@prejud.com.br</li>
                <li>(11) 4000-0000</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              Â© 2024 PreJud. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


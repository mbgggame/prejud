// C:\prejud-saas\frontend\src\app\page.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  FileCheck, 
  Fingerprint, 
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
  Search,
  FileText,
  History,
  Send,
  AlertTriangle,
  MessageSquare,
  UserX,
  MessagesSquare,
  Hash,
  Eye,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Interface para as props do BrazilClock
interface BrazilClockProps {
  className?: string;
}

// Componente de relógio com horário oficial do Brasil
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

// Interface para problemas
interface Problem {
  icon: React.ElementType;
  title: string;
  description: string;
}

// Interface para passos
interface Step {
  icon: React.ElementType;
  number: string;
  title: string;
  description: string;
}

// Interface para recursos de segurança
interface SecurityFeature {
  icon: React.ElementType;
  title: string;
  description: string;
}

// Interface para guias SEO
interface GuideCard {
  title: string;
  description: string;
  href: string;
}

export default function FreelasPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const isLoggedIn = !!user;
  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário';
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
      router.push('/dashboard/novo-registro');
    } else {
      router.push('/registro');
    }
  };

  const problems: Problem[] = [
    {
      icon: AlertTriangle,
      title: "Cliente não paga",
      description: "Você entrega o trabalho e o pagamento não acontece."
    },
    {
      icon: MessageSquare,
      title: "Acordos informais",
      description: "Tudo fica apenas em mensagens de WhatsApp."
    },
    {
      icon: UserX,
      title: "Cliente desaparece",
      description: "Depois da entrega, o cliente simplesmente some."
    },
    {
      icon: MessagesSquare,
      title: "Discussões intermináveis",
      description: "Conversas longas sem solução concreta."
    }
  ];

  const steps: Step[] = [
    {
      icon: FileText,
      number: "PASSO 1",
      title: "Registrar o acordo",
      description: "Registre o combinado com seu cliente e gere um documento com hash criptográfico."
    },
    {
      icon: History,
      number: "PASSO 2",
      title: "Prova e rastreabilidade",
      description: "Tudo fica registrado com data, integridade e histórico das partes."
    },
    {
      icon: Send,
      number: "PASSO 3",
      title: "Cobrança formal",
      description: "Se o cliente não pagar, envie uma notificação formal pela plataforma."
    }
  ];

  const securityFeatures: SecurityFeature[] = [
    {
      icon: Hash,
      title: "Registro com hash SHA-256",
      description: "Cada documento possui integridade criptográfica."
    },
    {
      icon: Eye,
      title: "Protocolo rastreável",
      description: "Todas as ações recebem número de protocolo."
    },
    {
      icon: Shield,
      title: "Histórico verificável",
      description: "Acordos, notificações e respostas ficam registrados."
    }
  ];

  // NOVO: Array de guias SEO
  const guideCards: GuideCard[] = [
    {
      title: "Cliente não pagou freela? Veja o que fazer",
      description: "Guia completo para resolver cobranças e proteger seus trabalhos.",
      href: "/cliente-nao-pagou-freela"
    },
    {
      title: "Modelo de contrato freelancer simples",
      description: "Veja um exemplo de contrato para evitar conflitos com clientes.",
      href: "/modelo-de-contrato"
    },
    {
      title: "Como cobrar cliente que não paga",
      description: "Estratégias práticas para cobrar de forma profissional.",
      href: "/como-cobrar-cliente"
    },
    {
      title: "Notificação extrajudicial de cobrança",
      description: "Entenda quando usar uma cobrança formal.",
      href: "/notificacao-extrajudicial-cobranca"
    },
    {
      title: "Como provar um acordo digital",
      description: "Saiba como registrar acordos feitos online.",
      href: "/prova-de-acordo-digital"
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
      {/* Header - Mesmo da home */}
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
              <a href="#problemas" className="text-sm text-gray-400 hover:text-white transition-colors">Problemas</a>
              <a href="#como-funciona" className="text-sm text-gray-400 hover:text-white transition-colors">Como Funciona</a>
              <a href="#seguranca" className="text-sm text-gray-400 hover:text-white transition-colors">Seguranca</a>
              {/* NOVO: Item de menu Guias */}
              <Link href="/cliente-nao-pagou-freela" className="text-sm text-gray-400 hover:text-white transition-colors">Guias</Link>
              <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link>
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
                              Configuracoes
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
            <a href="#problemas" className="block text-gray-400 hover:text-white">Problemas</a>
            <a href="#como-funciona" className="block text-gray-400 hover:text-white">Como Funciona</a>
            <a href="#seguranca" className="block text-gray-400 hover:text-white">Seguranca</a>
            {/* NOVO: Item de menu Guias mobile */}
            <Link href="/cliente-nao-pagou-freela" className="block text-gray-400 hover:text-white">Guias</Link>
            <Link href="/" className="block text-gray-400 hover:text-white">Home</Link>
            <div className="pt-4 border-t border-white/5 space-y-3">
              {isLoggedIn ? (
                <>
                  <span className="block text-sm text-gray-500">
                    Logado como: {user?.email}
                  </span>
                  <Link href="/dashboard" className="block w-full text-left text-gray-300">Dashboard</Link>
                  <Link href="/perfil" className="block w-full text-left text-gray-300">Meu perfil</Link>
                  <Link href="/configuracoes" className="block w-full text-left text-gray-300">Configuracoes</Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 bg-red-500/10 text-red-400 rounded-lg"
                  >
                    <LogOut size={16} />
                    Sair
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                Para freelancers e prestadores de servico
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
                Infraestrutura digital para formalizar relações profissionais
              </h1>
              
              <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                Registre acordos, preserve evidências verificáveis e utilize notificações formais quando necessário.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => router.push('/dashboard/novo-registro?tipo=acordo')}
                  className="group px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  Formalizar acordo
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="#como-funciona"
                  className="group px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  Ver como funciona
                </a>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Registro imediato
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Prova juridica valida
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  <span className="ml-4 text-xs text-gray-500">Acordo de Freelancer</span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium">Projeto: Landing Page</p>
                        <p className="text-xs text-gray-500">Cliente: Empresa ABC</p>
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Registrado</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Valor: R$ 3.500,00 | Prazo: 15 dias</p>
                  </div>
                  
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-xs text-purple-400 mb-1">Hash do Acordo</p>
                    <p className="text-xs font-mono text-gray-400 break-all">a3f5c8e9d2b1f4e7...</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                    <div>
                      <p className="text-sm font-medium text-yellow-400">Notificacao de Cobranca</p>
                      <p className="text-xs text-gray-500">Enviada apos vencimento</p>
                    </div>
                    <Send size={16} className="text-yellow-400" />
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Problemas Section */}
      <section id="problemas" className="py-20 lg:py-32 bg-[#0a0a0c] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Problemas comuns entre freelancers</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Situacoes que podem ser evitadas com registro formal.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((problem, idx) => (
              <div 
                key={idx}
                className="group p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-red-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <problem.icon className="text-red-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-300 text-lg">
              O PreJud ajuda a registrar o acordo e resolver conflitos de forma estruturada.
            </p>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="py-20 lg:py-32 bg-[#0B0B0D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Proteja seus freelas em 3 passos</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Um fluxo simples para garantir seus acordos.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className="group p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-purple-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <step.icon className="text-purple-400" size={24} />
                  </div>
                  <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seguranca Section */}
      <section id="seguranca" className="py-20 lg:py-32 bg-[#0a0a0c] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Infraestrutura digital para proteger seus trabalhos</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Tecnologia de ponta para garantir a integridade dos seus acordos.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {securityFeatures.map((feature, idx) => (
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

      {/* NOVA SECAO: Guias e Recursos SEO */}
      <section id="guias" className="py-20 lg:py-32 bg-[#0B0B0D] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Guias e recursos para freelancers</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Aprenda como proteger seus acordos, cobrar clientes e evitar conflitos em trabalhos freelancer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guideCards.map((guide, idx) => (
              <Link
                key={idx}
                href={guide.href}
                className="group p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-purple-500/20 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="text-purple-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed flex-grow">
                  {guide.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-purple-400 group-hover:gap-3 transition-all">
                  <span>Ler guia</span>
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-purple-900/20 to-[#0B0B0D]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Proteja seus proximos freelas
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Formalize acordos e tenha uma forma profissional de resolver conflitos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/dashboard/novo-registro?tipo=acordo')}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all hover:scale-105"
            >
              Fromalizar acordo
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

      {/* Footer - Atualizado com coluna Guias */}
      <footer className="py-12 bg-[#0B0B0D] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-semibold">PreJud</span>
              </div>
              <p className="text-sm text-gray-500">
                Notificacao extrajudicial com integridade digital garantida.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            {/* NOVO: Coluna Guias no Footer */}
            <div>
              <h4 className="font-semibold mb-4">Guias</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/cliente-nao-pagou-freela" className="hover:text-white transition-colors">Cliente nao pagou freela</Link></li>
                <li><Link href="/modelo-de-contrato" className="hover:text-white transition-colors">Modelo de contrato</Link></li>
                <li><Link href="/como-cobrar-cliente" className="hover:text-white transition-colors">Como cobrar cliente</Link></li>
                <li><Link href="/notificacao-extrajudicial-cobranca" className="hover:text-white transition-colors">Notificacao extrajudicial</Link></li>
                <li><Link href="/prova-de-acordo-digital" className="hover:text-white transition-colors">Prova de acordo digital</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Juridico</h4>
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
              © 2024 PreJud. Todos os direitos reservados.
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
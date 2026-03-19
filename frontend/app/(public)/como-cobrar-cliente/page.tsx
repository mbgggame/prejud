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
  AlertCircle,
  Search,
  FileSearch,
  MessageSquare,
  DollarSign,
  Clock3,
  HelpCircle,
  Hash,
  Eye,
  CheckCircle,
  ChevronRight,
  Briefcase
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

interface Step {
  icon: React.ElementType;
  number: string;
  title: string;
  description: string;
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

interface FAQItem {
  question: string;
  answer: string;
}

export default function ComoCobrarClienteQueNaoPagaPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
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

  const steps: Step[] = [
    {
      icon: FileSearch,
      number: "1",
      title: "ReÃºna as provas",
      description: "Separe mensagens, e-mails, arquivos, comprovantes e qualquer documento que demonstre o combinado."
    },
    {
      icon: FileText,
      number: "2",
      title: "Revise o acordo",
      description: "Confirme valor, prazo, escopo e forma de pagamento para evitar cobranÃ§a confusa."
    },
    {
      icon: MessageSquare,
      number: "3",
      title: "FaÃ§a uma cobranÃ§a objetiva",
      description: "Envie uma mensagem clara, educada e direta, informando o que estÃ¡ pendente."
    },
    {
      icon: Send,
      number: "4",
      title: "Formalize a cobranÃ§a",
      description: "Se nÃ£o houver retorno, uma cobranÃ§a formal pode aumentar muito a chance de resoluÃ§Ã£o."
    }
  ];

  const errorCards: ErrorCard[] = [
    {
      icon: AlertCircle,
      title: "Cobrar sem organizaÃ§Ã£o",
      description: "Falar de forma vaga enfraquece a cobranÃ§a."
    },
    {
      icon: MessageSquare,
      title: "Misturar emoÃ§Ã£o com prova",
      description: "Quanto mais emocional a conversa, menor a chance de soluÃ§Ã£o objetiva."
    },
    {
      icon: FileText,
      title: "NÃ£o registrar o combinado",
      description: "Sem prova, a cobranÃ§a perde forÃ§a."
    },
    {
      icon: Clock3,
      title: "Esperar tempo demais",
      description: "Quanto mais o tempo passa, mais difÃ­cil fica resolver."
    }
  ];

  const features: Feature[] = [
    {
      icon: Hash,
      title: "Registro digital verificÃ¡vel",
      description: "Cada acordo recebe hash SHA-256."
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

  const faqItems: FAQItem[] = [
    {
      question: "Como cobrar um cliente sem parecer agressivo?",
      answer: "A melhor forma Ã© usar uma comunicaÃ§Ã£o clara, objetiva e baseada no combinado."
    },
    {
      question: "Posso cobrar cliente que nÃ£o pagou mesmo sem contrato?",
      answer: "Sim, mensagens, e-mails e outros registros podem ajudar a comprovar o acordo."
    },
    {
      question: "Quando vale formalizar a cobranÃ§a?",
      answer: "Quando o cliente deixa de responder, adia demais ou nÃ£o cumpre o pagamento prometido."
    },
    {
      question: "O PreJud serve para freelancer?",
      answer: "Sim, o PreJud pode ajudar freelancers e prestadores de serviÃ§o a registrar acordos e cobrar de forma mais profissional."
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
              <a href="#dificuldade" className="text-sm text-gray-400 hover:text-white transition-colors">Por Que Ã‰ DifÃ­cil</a>
              <a href="#passos" className="text-sm text-gray-400 hover:text-white transition-colors">Passos</a>
              <a href="#erros" className="text-sm text-gray-400 hover:text-white transition-colors">Erros</a>
              <a href="#como-ajuda" className="text-sm text-gray-400 hover:text-white transition-colors">Como Ajuda</a>
              <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
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
            <a href="#dificuldade" className="block text-gray-400 hover:text-white">Por Que Ã‰ DifÃ­cil</a>
            <a href="#passos" className="block text-gray-400 hover:text-white">Passos</a>
            <a href="#erros" className="block text-gray-400 hover:text-white">Erros</a>
            <a href="#como-ajuda" className="block text-gray-400 hover:text-white">Como Ajuda</a>
            <a href="#faq" className="block text-gray-400 hover:text-white">FAQ</a>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium">
                <DollarSign size={12} />
                Guia de cobranÃ§a
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
                Como cobrar cliente que nÃ£o paga{" "}
                <span className="text-purple-400">de forma profissional</span>.
              </h1>
              
              <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                Veja formas prÃ¡ticas de cobrar um cliente inadimplente, proteger o acordo e evitar discussÃµes interminÃ¡veis.
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
                  href="#passos"
                  className="group px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  Ver como funciona
                </a>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  CobranÃ§a mais profissional
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Mais prova e rastreabilidade
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  <span className="ml-4 text-xs text-gray-500">CobranÃ§a Formal</span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={16} className="text-red-400" />
                      <p className="text-sm font-medium text-red-400">Pagamento pendente</p>
                    </div>
                    <p className="text-xs text-gray-400">Fatura #2024-001 - R$ 5.000,00</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium">CobranÃ§a formal enviada</p>
                        <p className="text-xs text-gray-500">Via PreJud</p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Enviada</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Protocolo: #PREJ-2024-001234</p>
                  </div>
                  
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-xs text-purple-400 mb-1">Hash de Integridade</p>
                    <p className="text-xs font-mono text-gray-400 break-all">d8f2a5c9e1b4...</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                    <div>
                      <p className="text-sm font-medium text-green-400">Pagamento confirmado</p>
                      <p className="text-xs text-gray-500">Resolvido em 7 dias</p>
                    </div>
                    <CheckCircle size={16} className="text-green-400" />
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* SeÃ§Ã£o 1: Por Que Ã‰ TÃ£o DifÃ­cil */}
      <section id="dificuldade" className="py-20 lg:py-32 bg-[#0a0a0c] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Por que cobrar um cliente inadimplente Ã© tÃ£o difÃ­cil?
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              Muitos profissionais fecham trabalhos apenas por mensagem, sem contrato claro, prazo definido ou registro formal do combinado. 
              Quando o pagamento atrasa, a cobranÃ§a vira uma sequÃªncia de mensagens, promessas e desgaste.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              "acordo informal",
              "cliente que visualiza e nÃ£o responde",
              "pagamento prometido e nÃ£o realizado",
              "medo de perder o relacionamento comercial"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-lg border border-white/5">
                <span className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20">
            <p className="text-gray-300 text-center">
              Sem um registro claro, a cobranÃ§a fica frÃ¡gil e a conversa pode se transformar em <span className="text-orange-400 font-semibold">conflito</span>.
            </p>
          </div>
        </div>
      </section>

      {/* SeÃ§Ã£o 2: Passos PrÃ¡ticos */}
      <section id="passos" className="py-20 lg:py-32 bg-[#0B0B0D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Passos para cobrar um cliente que nÃ£o paga</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Um fluxo estruturado aumenta suas chances de receber.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className="group p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-purple-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <step.icon className="text-purple-400" size={20} />
                  </div>
                  <span className="text-2xl font-bold text-purple-500/30">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SeÃ§Ã£o 3: Erros Comuns */}
      <section id="erros" className="py-20 lg:py-32 bg-[#0a0a0c] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Erros comuns ao cobrar um cliente</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Evite estas armadilhas para manter sua cobranÃ§a efetiva.</p>
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
                Uma forma mais estruturada de cobrar
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                O PreJud permite registrar acordos, gerar prova com hash criptogrÃ¡fico e enviar cobranÃ§as formais com rastreabilidade completa.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-purple-500/20 rounded-full blur-3xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                <Briefcase size={80} className="text-purple-400 relative z-10" />
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

      {/* SeÃ§Ã£o 5: FAQ */}
      <section id="faq" className="py-20 lg:py-32 bg-[#0a0a0c] border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Perguntas frequentes</h2>
            <p className="text-gray-400">Respostas rÃ¡pidas sobre cobranÃ§a de clientes.</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div 
                key={idx}
                className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-medium text-gray-200 pr-4">{item.question}</span>
                  <ChevronRight 
                    size={20} 
                    className={`text-purple-400 flex-shrink-0 transition-transform ${openFAQ === idx ? 'rotate-90' : ''}`} 
                  />
                </button>
                {openFAQ === idx && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-400 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-purple-900/20 to-[#0B0B0D]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Proteja seus prÃ³ximos acordos
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Registre acordos e tenha uma forma profissional de cobrar clientes e resolver conflitos.
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


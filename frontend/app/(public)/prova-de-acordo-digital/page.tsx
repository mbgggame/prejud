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
  MessageSquare,
  Mail,
  FolderOpen,
  Calendar,
  CheckCircle,
  Hash,
  Eye,
  ChevronRight,
  Lock,
  Smartphone
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

interface ProofType {
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

export default function ProvaDeAcordoDigitalPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
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
      router.push('/dashboard');
    } else {
      router.push('/registro');
    }
  };

  const proofTypes: ProofType[] = [
    {
      icon: MessageSquare,
      title: "Mensagens e e-mails",
      description: "Conversas que demonstrem valor, prazo, escopo e compromisso entre as partes."
    },
    {
      icon: FolderOpen,
      title: "Arquivos enviados",
      description: "Briefings, propostas, PDFs, comprovantes e anexos ajudam a contextualizar o combinado."
    },
    {
      icon: Calendar,
      title: "Registro cronológico",
      description: "Ter data, ordem dos fatos e integridade do conteúdo fortalece a prova."
    },
    {
      icon: FileText,
      title: "Documento formalizado",
      description: "Quando o acordo é transformado em um registro verificável, a segurança aumenta muito."
    }
  ];

  const steps: Step[] = [
    {
      icon: FolderOpen,
      number: "1",
      title: "Organize o combinado",
      description: "Reúna as informações principais do acordo: serviço, valor, prazo e forma de pagamento."
    },
    {
      icon: FileText,
      number: "2",
      title: "Formalize em um registro único",
      description: "Transforme o combinado em um documento claro e objetivo."
    },
    {
      icon: Lock,
      number: "3",
      title: "Gere um registro verificável",
      description: "Um documento com integridade criptográfica e protocolo rastreável fortalece a prova."
    },
    {
      icon: History,
      number: "4",
      title: "Preserve o histórico",
      description: "Manter notificações, respostas e documentos em sequência ajuda a demonstrar os fatos."
    }
  ];

  const features: Feature[] = [
    {
      icon: Hash,
      title: "Hash criptográfico SHA-256",
      description: "Garante integridade do documento registrado."
    },
    {
      icon: Eye,
      title: "Protocolo rastreável",
      description: "Cada ação recebe identificação única e verificável."
    },
    {
      icon: History,
      title: "Histórico completo",
      description: "Acordos, notificações e respostas ficam organizados em um só lugar."
    }
  ];

  const faqItems: FAQItem[] = [
    {
      question: "Mensagem de WhatsApp pode servir como prova?",
      answer: "Mensagens podem ajudar a demonstrar o combinado, especialmente quando mostram valor, prazo e compromisso entre as partes."
    },
    {
      question: "Um acordo digital precisa ser impresso para valer?",
      answer: "Nem sempre. O importante é ter registro claro, coerente e verificável do conteúdo e do contexto."
    },
    {
      question: "Como deixar um acordo digital mais forte?",
      answer: "O ideal é organizar o combinado em um documento único, com registro cronológico e integridade verificável."
    },
    {
      question: "O PreJud serve para registrar acordos digitais?",
      answer: "Sim. O PreJud foi pensado para registrar acordos, gerar prova e facilitar a formalização de cobranças e conflitos."
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
              <a href="#problema" className="text-sm text-gray-400 hover:text-white transition-colors">O Problema</a>
              <a href="#prova" className="text-sm text-gray-400 hover:text-white transition-colors">O Que Serve Como Prova</a>
              <a href="#fortalecer" className="text-sm text-gray-400 hover:text-white transition-colors">Como Fortalecer</a>
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
                              Configurações
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
            <a href="#problema" className="block text-gray-400 hover:text-white">O Problema</a>
            <a href="#prova" className="block text-gray-400 hover:text-white">O Que Serve Como Prova</a>
            <a href="#fortalecer" className="block text-gray-400 hover:text-white">Como Fortalecer</a>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                <Lock size={12} />
                Prova digital verificável
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
                Como criar prova de acordo digital{" "}
                <span className="text-purple-400">de forma segura</span>.
              </h1>
              
              <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                Entenda como registrar acordos feitos por mensagem, e-mail ou documento digital e aumentar a segurança das suas cobranças.
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
                  href="#fortalecer"
                  className="group px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  Ver como funciona
                </a>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Registro verificável
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Mais segurança jurídica
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  <span className="ml-4 text-xs text-gray-500">Prova de Acordo Digital</span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone size={16} className="text-green-400" />
                      <p className="text-sm font-medium text-green-400">Acordo registrado</p>
                    </div>
                    <p className="text-xs text-gray-400">WhatsApp + E-mail + Documento</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium">Registro consolidado</p>
                        <p className="text-xs text-gray-500">Valor, prazo e escopo definidos</p>
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Verificado</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-xs text-purple-400 mb-1">Hash SHA-256</p>
                    <p className="text-xs font-mono text-gray-400 break-all">f9a4d7c2e8b1...</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <div>
                      <p className="text-sm font-medium text-blue-400">Protocolo ativo</p>
                      <p className="text-xs text-gray-500">Rastreável e auditável</p>
                    </div>
                    <CheckCircle size={16} className="text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Seção 1: O Problema */}
      <section id="problema" className="py-20 lg:py-32 bg-[#0a0a0c] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Por que acordos digitais geram tantos conflitos?
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              Hoje muitos serviços são combinados por WhatsApp, e-mail, direct ou mensagem. 
              O problema aparece quando uma das partes muda de versão, nega o combinado ou deixa de cumprir o acordo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              "mensagens soltas e desorganizadas",
              "falta de contrato formal",
              "dúvidas sobre valor, prazo e escopo",
              "dificuldade para reunir prova depois do problema"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-lg border border-white/5">
                <span className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20">
            <p className="text-gray-300 text-center">
              Sem um registro claro, a conversa pode virar <span className="text-orange-400 font-semibold">discussão</span> e a cobrança perde força.
            </p>
          </div>
        </div>
      </section>

      {/* Seção 2: O Que Pode Servir Como Prova */}
      <section id="prova" className="py-20 lg:py-32 bg-[#0B0B0D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">O que pode ajudar a provar um acordo digital?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Diferentes tipos de evidências que fortalecem sua posição.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {proofTypes.map((item, idx) => (
              <div 
                key={idx}
                className="group p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-green-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="text-green-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 3: Como Fortalecer */}
      <section id="fortalecer" className="py-20 lg:py-32 bg-[#0a0a0c] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Como fortalecer um acordo digital</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Passos para aumentar a segurança do seu acordo.</p>
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

      {/* Seção 4: Como o PreJud Ajuda */}
      <section id="como-ajuda" className="py-20 lg:py-32 bg-[#0B0B0D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Registro digital com integridade e rastreabilidade
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                O PreJud permite registrar acordos, gerar prova com hash SHA-256 e manter histórico completo das comunicações entre as partes.
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
                className="group p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-blue-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-blue-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 5: FAQ */}
      <section id="faq" className="py-20 lg:py-32 bg-[#0a0a0c] border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Perguntas frequentes</h2>
            <p className="text-gray-400">Tire suas dúvidas sobre prova de acordos digitais.</p>
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
            Proteja seus acordos digitais
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Registre seus combinados de forma estruturada e tenha mais segurança para cobrar e resolver conflitos.
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
                Notificação extrajudicial com integridade digital garantida.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Jurídico</h4>
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


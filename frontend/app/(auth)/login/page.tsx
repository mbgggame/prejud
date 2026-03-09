"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, ArrowLeft, Mail, Lock, Chrome } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';


export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [showSenha, setShowSenha] = useState<boolean>(false);
  const [manterConectado, setManterConectado] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { login } = useAuth();

  const validate = (): string => {
    if (!email.trim()) return "Informe seu e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido.";
    if (!senha) return "Informe sua senha.";
    return "";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    
    console.log("🚀 Iniciando login...");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    
    try {
      console.log("🔑 Tentando login com:", email);
      await login(email, senha);
      console.log("✅ Login bem-sucedido!");
      // Aguardar atualização do estado antes de redirecionar
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err: unknown) {
      console.error("❌ Erro no login:", err);
      const errorCode = (err as { code?: string })?.code || "";
      if (errorCode === "auth/user-not-found") setError("Usuário não encontrado.");
      else if (errorCode === "auth/wrong-password") setError("Senha incorreta.");
      else if (errorCode === "auth/invalid-email") setError("E-mail inválido.");
      else if (errorCode === "auth/user-disabled") setError("Conta desativada.");
      else if (errorCode === "auth/too-many-requests") setError("Muitas tentativas. Tente mais tarde.");
      else if (errorCode === "auth/network-request-failed") setError("Falha de rede. Verifique o emulador.");
      else setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    alert("Login com Google em breve!");
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handleSenhaChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSenha(e.target.value);
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setManterConectado(e.target.checked);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex flex-col">
      <header className="p-4">
        <div className="max-w-md mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm">Voltar para o início</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Acesse sua conta</h1>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition-all flex items-center justify-center gap-2 mb-6"
            >
              <Chrome size={20} />
              Entrar com Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0B0B0D] text-gray-400">ou</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-lg text-sm text-center bg-red-500/10 border border-red-500/20 text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={handleSenhaChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manterConectado}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-gray-500 bg-white/5 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-400">Manter conectado</span>
                </label>

                <Link href="/recuperar-senha" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  Esqueci minha senha
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition-all hover:scale-[1.02]"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-gray-400 text-sm">
                Não tem conta?{' '}
                <Link href="/registro" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Criar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
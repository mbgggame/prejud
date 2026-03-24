"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff, User, Mail, Lock, CheckCircle } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/services/firebase";

export default function RegistroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [aceitoTermos, setAceitoTermos] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    if (!nome.trim()) return "Informe seu nome.";
    if (nome.trim().length < 2) return "Nome muito curto.";
    if (!email.trim()) return "Informe seu e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido.";
    if (!senha) return "Informe uma senha.";
    if (senha.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
    if (!/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha)) return "Use letras e números.";
    if (senha !== confirmarSenha) return "As senhas não conferem.";
    if (!aceitoTermos) return "Você precisa aceitar os termos.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const nomeTrim = nome.trim();
      const emailTrim = email.trim();

      // Criar usuário no Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, emailTrim, senha);

      // Salvar nome no perfil
      if (nomeTrim) {
        await updateProfile(cred.user, { displayName: nomeTrim });
      }

      setError("Conta criada com sucesso!");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      const code = String(err?.code || "");
      if (code === "auth/email-already-in-use") setError("Este e-mail já está em uso.");
      else if (code === "auth/invalid-email") setError("E-mail inválido.");
      else if (code === "auth/weak-password") setError("Senha fraca. Use pelo menos 6 caracteres.");
      else if (code === "auth/network-request-failed") setError("Falha de rede. Verifique se o emulador está ligado.");
      else setError("Não foi possível criar sua conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Crie sua conta</h1>
          <p className="text-gray-400">Leva menos de 1 minuto.</p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className={`p-4 rounded-lg text-sm text-center ${
                error.includes("sucesso") 
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type={showSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                  placeholder="Mínimo 8 caracteres"
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type={showConfirmar ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                  placeholder="Repita a senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar(!showConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showConfirmar ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                aceitoTermos 
                  ? "bg-purple-600 border-purple-600" 
                  : "border-gray-500 group-hover:border-purple-500"
              }`}>
                {aceitoTermos && <CheckCircle size={14} className="text-white" />}
              </div>
              <input
                type="checkbox"
                checked={aceitoTermos}
                onChange={(e) => setAceitoTermos(e.target.checked)}
                className="hidden"
              />
              <span className="text-sm text-gray-400">
                Aceito os <Link href="/termos" className="text-purple-400 hover:text-purple-300">Termos</Link> e <Link href="/privacidade" className="text-purple-400 hover:text-purple-300">Política de Privacidade</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition-all hover:scale-[1.02]"
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Já tem conta?{" "}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

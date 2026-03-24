"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

function BrazilClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-[#111827] dark:text-slate-300 dark:shadow-none">
      <Clock className="h-4 w-4 text-slate-500" />
      <span>{time}</span>
      <span className="text-xs text-slate-400">BRT</span>
    </div>
  );
}

export default function FreelancerConfiguracoesPage() {
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [pix, setPix] = useState("");
  const [saving, setSaving] = useState(false);

const [initialData, setInitialData] = useState({
  nome: "",
  telefone: "",
  pix: "",
});

const hasChanges =
  nome !== initialData.nome ||
  telefone !== initialData.telefone ||
  pix !== initialData.pix;
  useEffect(() => {
  const loadData = async () => {
    if (!user?.uid) return;

    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        const loaded = {
          nome: data.nome || "",
          telefone: data.telefone || "",
          pix: data.pix || "",
        };

        setNome(loaded.nome);
        setTelefone(loaded.telefone);
        setPix(loaded.pix);
        setInitialData(loaded);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  };

  loadData();
}, [user?.uid]);
const handleSave = async () => {
  if (!user?.uid) return;

  setSaving(true);

  try {
    const ref = doc(db, "users", user.uid);

    const payload = {
      nome: nome.trim(),
      telefone: telefone.trim(),
      pix: pix.trim(),
      email: user.email,
      updatedAt: new Date(),
    };

    const snap = await getDoc(ref);

    if (snap.exists()) {
      await updateDoc(ref, payload);
    } else {
      await setDoc(ref, {
        uid: user.uid,
        createdAt: new Date(),
        ...payload,
      });
    }

    setInitialData({
      nome,
      telefone,
      pix,
    });

    console.log("Salvo com sucesso");
  } catch (err) {
    console.error("Erro ao salvar:", err);
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-[#020617]/90">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-3 px-5 sm:min-h-[84px] sm:px-6">
          <div className="min-w-0 flex items-center gap-4">
            <Link href="/dashboard" className="group flex min-w-0 items-center gap-3">
              <img
                src="/prejud-logo-1200x300 preto.svg"
                alt="PreJud"
                className="h-7 w-auto object-contain dark:hidden"
              />
              <img
                src="/prejud-logo-1200x300.svg"
                alt="PreJud"
                className="hidden h-7 w-auto object-contain dark:block"
              />
            </Link>

            <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                Área do Freelancer
              </p>
              <p className="truncate text-xs text-slate-500">
                Configurações da conta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <BrazilClock />
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-[#162033]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0F172A] dark:shadow-none">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-10">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
                <ShieldCheck className="h-4 w-4" />
                Configurações da conta
              </span>

              <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
                Ajuste seu perfil e seus dados financeiros com clareza
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Mantenha seus dados organizados para operar o dashboard com mais
                segurança, agilidade e um padrão profissional.
              </p>
            </div>

            <div className="flex items-start lg:justify-end">
              <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827] dark:shadow-none">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-700/50 dark:bg-[#0F172A]">
                    <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Conta verificada
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Revise nome, contato e chave PIX para manter sua operação
                      pronta para receber e acompanhar acordos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0F172A] dark:shadow-none">
            <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6 sm:py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-[#111827]">
                  <User className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                </div>

                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl">
                    Perfil
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Dados principais da sua conta freelancer
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Nome completo
                </label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Telefone
                </label>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  E-mail
                </label>
                <input
                  value={user?.email ?? ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-[#0B1220] dark:text-slate-400"
                />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0F172A] dark:shadow-none">
            <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6 sm:py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-[#111827]">
                  <CreditCard className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                </div>

                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl">
                    Financeiro
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Configure sua chave PIX para recebimentos
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Chave PIX
                </label>
                <input
                  value={pix}
                  onChange={(e) => setPix(e.target.value)}
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-800"
                />
              </div>

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-[#111827]">
                <p className="text-sm leading-6 text-slate-500">
                  Use uma chave válida para agilizar cobranças e recebimentos
                  vinculados aos seus acordos.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
  <button
    type="button"
    onClick={handleSave}
    disabled={saving}
    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#0F172A] dark:text-white dark:hover:bg-white/5"
  >
    <Save className="h-4 w-4" />
    {saving ? "Salvando..." : "Salvar alterações"}
  </button>
</div>
      </main>
    </div>
  );
}





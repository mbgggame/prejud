"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AditivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    titulo: string;
    descricao: string;
    novoValor: string;
    novoPrazo: string;
    justificativa: string;
  }) => void;
}

export function AditivoModal({ isOpen, onClose, onSubmit }: AditivoModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [novoPrazo, setNovoPrazo] = useState("");
  const [justificativa, setJustificativa] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ titulo, descricao, novoValor, novoPrazo, justificativa });
    setTitulo("");
    setDescricao("");
    setNovoValor("");
    setNovoPrazo("");
    setJustificativa("");
  };

  const isValid = titulo && descricao && justificativa;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0B0B0D] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Gerar aditivo do acordo</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Título do aditivo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
              placeholder="Ex: Alteração de escopo - inclusão de blog"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Nova descrição / alteração do escopo <span className="text-red-400">*</span>
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none focus:outline-none focus:border-purple-500/50"
              placeholder="Descreva as alterações no escopo do trabalho..."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Novo valor (opcional)</label>
            <input
              type="text"
              value={novoValor}
              onChange={(e) => setNovoValor(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
              placeholder="R$ 0,00"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Novo prazo (opcional)</label>
            <input
              type="date"
              value={novoPrazo}
              onChange={(e) => setNovoPrazo(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white [color-scheme:dark] focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Justificativa / observações <span className="text-red-400">*</span>
            </label>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none focus:outline-none focus:border-purple-500/50"
              placeholder="Explique o motivo das alterações..."
              required
            />
          </div>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-300">
            Um aditivo será enviado ao cliente para confirmação das alterações.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
          >
            Gerar aditivo
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

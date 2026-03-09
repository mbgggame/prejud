"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ProrrogacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { novoPrazo: string; motivo: string }) => void;
  currentDeadline: string;
}

export function ProrrogacaoModal({
  isOpen,
  onClose,
  onSubmit,
  currentDeadline,
}: ProrrogacaoModalProps) {
  const [novoPrazo, setNovoPrazo] = useState("");
  const [motivo, setMotivo] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ novoPrazo, motivo });
    setNovoPrazo("");
    setMotivo("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0B0B0D] border border-white/10 rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Prorrogar prazo de entrega</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Prazo atual</label>
            <input
              type="text"
              value={currentDeadline}
              disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Novo prazo proposto <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={novoPrazo}
              onChange={(e) => setNovoPrazo(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white [color-scheme:dark] focus:outline-none focus:border-purple-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Motivo da prorrogação <span className="text-red-400">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none focus:outline-none focus:border-purple-500/50"
              placeholder="Explique o motivo da prorrogação..."
              required
            />
          </div>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-300">
            Uma solicitação de prorrogação será enviada ao cliente para confirmação.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!novoPrazo || !motivo}
            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
          >
            Enviar solicitação
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

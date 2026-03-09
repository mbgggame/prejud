"use client";

import { useState } from "react";
import { X, Send, AlertTriangle, FileText } from "lucide-react";

interface NotificacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    tipo: "cobranca" | "atraso" | "advertencia" | "personalizada";
    assunto: string;
    mensagem: string;
    exigirResposta: boolean;
  }) => void;
}

export function NotificacaoModal({ isOpen, onClose, onSubmit }: NotificacaoModalProps) {
  const [tipo, setTipo] = useState<"cobranca" | "atraso" | "advertencia" | "personalizada">("cobranca");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [exigirResposta, setExigirResposta] = useState(false);

  const tiposNotificacao = [
    { id: "cobranca" as const, label: "Cobrança", descricao: "Solicitação formal de pagamento" },
    { id: "atraso" as const, label: "Atraso", descricao: "Notificação sobre atraso na entrega" },
    { id: "advertencia" as const, label: "Advertência", descricao: "Advertência formal sobre descumprimento" },
    { id: "personalizada" as const, label: "Personalizada", descricao: "Mensagem personalizada" },
  ];

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ tipo, assunto, mensagem, exigirResposta });
    setTipo("cobranca");
    setAssunto("");
    setMensagem("");
    setExigirResposta(false);
  };

  const isValid = assunto && mensagem;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0B0B0D] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Emitir notificação</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tipo de notificação</label>
            <div className="grid grid-cols-2 gap-2">
              {tiposNotificacao.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTipo(t.id)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    tipo === t.id
                      ? "bg-blue-600/20 border border-blue-500/50"
                      : "bg-white/5 border border-transparent hover:bg-white/10"
                  }`}
                >
                  <p className={`text-sm font-medium ${tipo === t.id ? "text-blue-400" : "text-white"}`}>
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{t.descricao}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Assunto <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
              placeholder="Assunto da notificação"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Mensagem <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={5}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none focus:outline-none focus:border-purple-500/50"
                placeholder="Digite a mensagem da notificação..."
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <input
              type="checkbox"
              id="exigirResposta"
              checked={exigirResposta}
              onChange={(e) => setExigirResposta(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="exigirResposta" className="text-sm text-gray-300 cursor-pointer">
              Exigir resposta do cliente
            </label>
          </div>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Esta notificação será registrada na timeline do caso e poderá ser usada como prova em caso de disputa.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Emitir notificação
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

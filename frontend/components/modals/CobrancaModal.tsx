"use client";

import { useState } from "react";
import { X, DollarSign, Calendar, FileText } from "lucide-react";

interface CobrancaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    valor: string;
    dataVencimento: string;
    descricao: string;
    metodoPagamento: string;
  }) => void;
  defaultValue?: string;
}

export function CobrancaModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValue = "",
}: CobrancaModalProps) {
  const [valor, setValor] = useState(defaultValue);
  const [dataVencimento, setDataVencimento] = useState("");
  const [descricao, setDescricao] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("pix");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ valor, dataVencimento, descricao, metodoPagamento });
    setValor(defaultValue);
    setDataVencimento("");
    setDescricao("");
    setMetodoPagamento("pix");
  };

  const isValid = valor && dataVencimento;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0B0B0D] border border-white/10 rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Criar cobrança</h3>
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
              Valor <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                placeholder="R$ 0,00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Data de vencimento <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white [color-scheme:dark] focus:outline-none focus:border-purple-500/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Descrição / Observações</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none focus:outline-none focus:border-purple-500/50"
                placeholder="Informações adicionais sobre a cobrança..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Método de pagamento</label>
            <div className="grid grid-cols-3 gap-2">
              {["pix", "boleto", "cartao"].map((metodo) => (
                <button
                  key={metodo}
                  onClick={() => setMetodoPagamento(metodo)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    metodoPagamento === metodo
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {metodo === "pix" && "PIX"}
                  {metodo === "boleto" && "Boleto"}
                  {metodo === "cartao" && "Cartão"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-300">
            A cobrança será enviada ao cliente com as instruções de pagamento.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
          >
            Criar cobrança
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

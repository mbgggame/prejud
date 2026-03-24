'use client';

import { jsPDF } from 'jspdf';

interface ContractPreviewProps {
  contract: string;
}

export default function ContractPreview({ contract }: ContractPreviewProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contract);
      alert('Contrato copiado!');
    } catch (err) {
      alert('Erro ao copiar');
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();

      const margin = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const usableWidth = pageWidth - margin * 2;

      const lines = doc.splitTextToSize(contract, usableWidth);

      doc.setFont('Times', 'Normal');
      doc.setFontSize(10);

      doc.text(lines, margin, 10);

      doc.save('contrato-prejud.pdf');
    } catch (err) {
      alert('Erro ao gerar PDF');
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          📄 Prévia do Contrato
        </h2>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="text-sm bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg"
          >
            Copiar
          </button>

          <button
            onClick={handleDownloadPDF}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg"
          >
            Baixar PDF
          </button>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-[#0F172A] rounded-xl p-4 max-h-[600px] overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed">
          {contract}
        </pre>
      </div>
    </div>
  );
}
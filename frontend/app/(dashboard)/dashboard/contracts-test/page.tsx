'use client';

import { useState } from 'react';
import ContractPreview from '@/components/contracts/ContractPreview';
import { useContractGeneration } from '@/hooks/useContractGeneration';

export default function ContractsTestPage() {
  const { loading, contract, error, generateContract } = useContractGeneration();

  const [form, setForm] = useState({
    freelancer_name: '',
    freelancer_document: '',
    client_name: '',
    client_document: '',
    service_description: '',
    start_date: '',
    end_date: '',
    amount: '',
    payment_terms: '',
    revision_limit: 1,
    city: '',
    state: '',
    notes: '',
  });

  function handleChange(e: any) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Teste de Geração de Contrato</h1>

      <div className="grid gap-3 mb-6">
        <input name="freelancer_name" placeholder="Nome do Freelancer" onChange={handleChange} className="input" />
        <input name="freelancer_document" placeholder="CPF/CNPJ Freelancer" onChange={handleChange} className="input" />
        <input name="client_name" placeholder="Nome do Cliente" onChange={handleChange} className="input" />
        <input name="client_document" placeholder="CPF/CNPJ Cliente" onChange={handleChange} className="input" />
        <textarea name="service_description" placeholder="Descrição do serviço" onChange={handleChange} className="input" />
        <input name="start_date" placeholder="Data início (YYYY-MM-DD)" onChange={handleChange} className="input" />
        <input name="end_date" placeholder="Data fim (YYYY-MM-DD)" onChange={handleChange} className="input" />
        <input name="amount" placeholder="Valor" onChange={handleChange} className="input" />
        <input name="payment_terms" placeholder="Forma de pagamento" onChange={handleChange} className="input" />
        <input name="city" placeholder="Cidade" onChange={handleChange} className="input" />
        <input name="state" placeholder="Estado" onChange={handleChange} className="input" />
        <textarea name="notes" placeholder="Observações" onChange={handleChange} className="input" />
      </div>

      <button
        onClick={() => generateContract(form)}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6"
      >
        {loading ? 'Gerando...' : 'Gerar Contrato'}
      </button>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {contract && <ContractPreview contract={contract} />}
    </div>
  );
}
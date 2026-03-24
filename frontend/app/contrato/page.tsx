// Pagina de contrato com hash e timeline
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAgreementEvents } from '@/services/firebaseAgreementService';

export default function ContractPage() {
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    setAgreementId(id);

    if (id) {
      const fetchData = async () => {
        try {
          // Buscar dados do acordo
          const ref = doc(db, 'agreements', id);
          const snap = await getDoc(ref);
          
          if (snap.exists()) {
            const agreementData = snap.data();
            setData(agreementData);
            
            // Buscar timeline
            const events = await getAgreementEvents(id);
            const formattedTimeline = (events || []).map((event: any) => ({
              type: event.type,
              date: new Date((event as any).createdAt || (event as any).timestamp).toLocaleDateString('pt-BR'),
              message: event.metadata?.message || event.metadata?.description || ''
            }));
            setTimeline(formattedTimeline);
          }
        } catch (err) {
          console.error('Erro ao carregar dados:', err);
        }
        setLoading(false);
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ padding: 40 }}><p>Carregando...</p></div>;
  }

  if (!agreementId) {
    return (
      <div style={{ padding: 40 }}>
        <h1>ID do contrato nao informado</h1>
        <p>Use: /contrato?id=SEU_ID_AQUI</p>
      </div>
    );
  }

  if (!data) {
    return notFound();
  }

  // Gerar hash se nao existir
  const contractHash = data.contractHash || data.hash || 'Hash nao disponivel - contrato gerado antes da atualizacao';

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      {/* Protocolo */}
      <div style={{ 
        background: '#f0fdf4', 
        border: '2px solid #10b981', 
        borderRadius: 8, 
        padding: 16, 
        marginBottom: 24 
      }}>
        <p style={{ margin: '0 0 8px', fontSize: 14, color: '#065f46', fontWeight: 600 }}>
          Protocolo do Acordo
        </p>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: '#1e3a8a', fontFamily: 'monospace' }}>
          {data.protocol || 'N/A'}
        </p>
      </div>

      <h1 style={{ fontSize: 24, marginBottom: 20, color: '#1f2937' }}>
        Contrato de Prestacao de Servicos
      </h1>

      {/* Hash */}
      <div style={{ 
        background: '#f0fdf4', 
        border: '2px solid #10b981', 
        borderRadius: 8, 
        padding: 16, 
        marginBottom: 24 
      }}>
        <p style={{ margin: '0 0 8px', fontSize: 14, color: '#065f46', fontWeight: 600 }}>
          Hash SHA-256 de Integridade
        </p>
        <p style={{ margin: 0, fontSize: 11, color: '#047857', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {contractHash}
        </p>
        {!data.contractHash && (
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#059669' }}>
            Nota: Este contrato foi gerado antes da implementacao do hash.
          </p>
        )}
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 12, color: '#1f2937' }}>Historico do Acordo</h2>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            {timeline.map((event, index) => (
              <div key={index} style={{ 
                padding: 12, 
                borderBottom: index < timeline.length - 1 ? '1px solid #e5e7eb' : 'none',
                background: index % 2 === 0 ? '#f9fafb' : 'white'
              }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6b7280' }}>{event.date}</p>
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{event.type}</p>
                {event.message && (
                  <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>{event.message}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contrato */}
      <div style={{ 
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'inherit', margin: 0 }}>
          {data.contractText || 'Contrato nao disponivel'}
        </pre>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
        <p style={{ margin: 0, fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
          Documento gerado automaticamente pelo PreJud<br/>
          Protocolo: {data.protocol || 'N/A'} | Hash: {typeof contractHash === 'string' ? contractHash.substring(0, 16) : 'N/A'}...
        </p>
      </div>
    </div>
  );
}

// Redirecionamento da rota antiga para a nova com query string (client-side)
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Pegar o ID da URL diretamente
    const pathParts = window.location.pathname.split('/');
    const agreementId = pathParts[pathParts.length - 1];
    
    if (agreementId && agreementId !== '[agreementId]') {
      router.replace('/contrato?id=' + agreementId);
    }
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p>Redirecionando...</p>
    </div>
  );
}

// Servico de envio de contrato - PreJud
// Chama API Route para envio seguro (server-side)

export function generateContractLink(agreementId: string) {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/contrato?id=${agreementId}`;
}

export async function sendContractToClient(
  agreementId: string,
  clientEmail?: string
) {
  try {
    const response = await fetch('/api/send-contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agreementId,
        clientEmail,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Falha ao enviar contrato');
    }

    console.log('Contrato enviado com sucesso:', result);
    return result;

  } catch (err) {
    console.error('Erro ao enviar contrato:', err);
    throw new Error('Erro ao enviar contrato: ' + (err as Error).message);
  }
}

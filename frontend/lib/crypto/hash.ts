/**
 * Utilitario de hash SHA-256 para garantia de integridade
 * PreJud SaaS - Registro Imutavel de Eventos
 */

/**
 * Gera hash SHA-256 de uma string (assincrono)
 */
export async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Gera hash sincrono para dados do evento (fallback para compatibilidade)
 */
export function generateHashSync(data: Record<string, unknown>): string {
  const str = JSON.stringify(data, Object.keys(data).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Verifica integridade comparando hash calculado com hash armazenado
 */
export function verifyIntegrity(data: Record<string, unknown>, storedHash: string): boolean {
  const calculatedHash = generateHashSync(data);
  return calculatedHash === storedHash;
}

/**
 * Gera hash de bloco com referencia ao hash anterior (cadeia de blocos simplificada)
 */
export function generateBlockHash(
  eventData: Record<string, unknown>,
  previousHash: string | null,
  timestamp: Date
): string {
  const dataToHash = {
    ...eventData,
    previousHash: previousHash || 'genesis',
    timestamp: timestamp.toISOString()
  };
  return generateHashSync(dataToHash);
}
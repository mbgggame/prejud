/**
 * Componente IntegrityVerifier - PreJud SaaS
 * UI de verificacao de integridade da cadeia de hashes SHA-256
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  FileSearch,
  Link as LinkIcon,
  Hash
} from 'lucide-react';
import { verifyChainIntegrity } from '@/services/timelineService';

interface IntegrityVerifierProps {
  agreementId: string;
  eventCount: number;
}

interface VerificationResult {
  isValid: boolean;
  eventsChecked: number;
  invalidEvents: string[];
  timestamp: Date;
}

export function IntegrityVerifier({ agreementId, eventCount }: IntegrityVerifierProps) {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const check = await verifyChainIntegrity(agreementId);
      setResult({
        ...check,
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
    if (!result) return <Shield className="h-6 w-6 text-slate-400" />;
    return result.isValid 
      ? <ShieldCheck className="h-6 w-6 text-green-500" />
      : <ShieldAlert className="h-6 w-6 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (loading) return <Badge variant="secondary">Verificando...</Badge>;
    if (!result) return <Badge variant="outline">Nao verificado</Badge>;
    return result.isValid 
      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Integro</Badge>
      : <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Comprometido</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <CardTitle className="text-lg">Verificacao de Integridade</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Descricao */}
        <p className="text-sm text-slate-600">
          Verifica a cadeia criptografica SHA-256 de todos os eventos do acordo, 
          garantindo que nenhum registro foi alterado desde sua criacao.
        </p>

        {/* Botao de verificacao */}
        <Button 
          onClick={handleVerify} 
          disabled={loading || eventCount === 0}
          className="w-full"
          variant={result?.isValid ? "outline" : "default"}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando {eventCount} eventos...
            </>
          ) : result ? (
            <>
              <FileSearch className="h-4 w-4 mr-2" />
              Verificar novamente
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Iniciar verificacao
            </>
          )}
        </Button>

        {/* Resultado da verificacao */}
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.isValid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {result.isValid ? (
                <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="space-y-2 flex-1">
                <h4 className={`font-medium ${
                  result.isValid ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.isValid 
                    ? 'Cadeia de integridade validada' 
                    : 'Falha na verificacao de integridade'}
                </h4>
                
                <div className="text-sm space-y-1">
                  <p className="text-slate-600">
                    <span className="font-medium">Eventos verificados:</span> {result.eventsChecked}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Verificado em:</span>{' '}
                    {result.timestamp.toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Lista de eventos invalidos */}
                {!result.isValid && result.invalidEvents.length > 0 && (
                  <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                    <p className="text-sm font-medium text-red-800 mb-2">
                      Eventos com hash invalido:
                    </p>
                    <ul className="text-xs font-mono text-red-700 space-y-1">
                      {result.invalidEvents.map(id => (
                        <li key={id} className="flex items-center gap-2">
                          <Hash className="h-3 w-3" />
                          {id}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Info da cadeia */}
                {result.isValid && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-green-700">
                    <LinkIcon className="h-4 w-4" />
                    <span>
                      Todos os hashes estao vinculados corretamente em cadeia 
                      (cada evento referencia o hash anterior)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {eventCount === 0 && !result && (
          <p className="text-center text-sm text-slate-400 py-4">
            Nenhum evento para verificar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
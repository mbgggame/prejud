// API Route - Geração de contrato via IA (OpenAI)
// RODA NO SERVER (seguro)

import { NextResponse } from 'next/server';
import { generateContractFromProtocol } from '@/services/contractGenerationService';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Body vazio' },
        { status: 400 }
      );
    }

    const result = await generateContractFromProtocol(body);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('Erro na geração do contrato:', error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Erro interno',
      },
      { status: 500 }
    );
  }
}
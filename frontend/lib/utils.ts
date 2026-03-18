/**
 * Utilitarios gerais - PreJud SaaS
 * Funcoes auxiliares reutilizaveis
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Mescla classes do Tailwind de forma inteligente
 * Evita conflitos e duplicacoes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata valor monetario para BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata data para padrao brasileiro
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
}

/**
 * Trunca texto com ellipsis
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

/**
 * Gera ID unico
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Delay/timeout async
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
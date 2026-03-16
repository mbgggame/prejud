// Componente ReputationBadge - PreJud SaaS
// Conforme Manual Técnico v1.0 - Seção 8

'use client';

import React from 'react';
import { useReputation } from '@/lib/hooks/useReputation';

interface ReputationBadgeProps {
  userId: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  userId,
  showDetails = false,
  size = 'md'
}) => {
  const { reputation, loading, scoreColor, scoreLabel } = useReputation(userId);

  if (loading) {
    return (
      <div className="reputation-badge reputation-badge--loading">
        <span>Carregando...</span>
      </div>
    );
  }

  if (!reputation) {
    return (
      <div className="reputation-badge reputation-badge--empty">
        <span>Sem reputação</span>
      </div>
    );
  }

  return (
    <div className="reputation-badge">
      <div className="reputation-badge__score" style={{ backgroundColor: scoreColor }}>
        {reputation.score}
      </div>
      <span className="reputation-badge__label">{scoreLabel}</span>
    </div>
  );
};

export default ReputationBadge;

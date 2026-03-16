// Componente ReputationScore - PreJud SaaS
// Conforme Manual Técnico v1.0 - Seção 10

'use client';

import React from 'react';
import { SCORE_SCALE } from '@/lib/agreement/reputation';

interface ReputationScoreProps {
  score: number;
  showScale?: boolean;
}

export const ReputationScore: React.FC<ReputationScoreProps> = ({
  score,
  showScale = true
}) => {
  const currentScale = SCORE_SCALE.find(
    s => score >= s.min && score <= s.max
  ) || SCORE_SCALE[0];

  return (
    <div className="reputation-score">
      <div className="reputation-score__header">
        <span style={{ color: currentScale.color }}>{score}</span>
        <span style={{ color: currentScale.color }}>{currentScale.label}</span>
      </div>

      {showScale && (
        <div className="reputation-score__scale">
          {SCORE_SCALE.map((segment) => (
            <div
              key={segment.class}
              style={{ 
                backgroundColor: segment.color,
                flex: 1
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReputationScore;

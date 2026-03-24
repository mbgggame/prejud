'use client';

import React, { useMemo } from 'react';
import { SCORE_SCALE } from '@/lib/agreement/reputation';

interface ReputationScoreProps {
  score: number;
  showScale?: boolean;
  className?: string;
}

type ScoreSegment = {
  min: number;
  max: number;
  label: string;
  color: string;
  class: string;
};

const DEFAULT_SEGMENT: ScoreSegment = {
  min: 0,
  max: 100,
  label: 'Não classificado',
  color: '#6B7280',
  class: 'unknown',
};

export const ReputationScore: React.FC<ReputationScoreProps> = ({
  score,
  showScale = true,
  className = '',
}) => {
  const safeScale = useMemo<ScoreSegment[]>(() => {
    return Array.isArray(SCORE_SCALE) && SCORE_SCALE.length > 0
      ? SCORE_SCALE
      : [DEFAULT_SEGMENT];
  }, []);

  const overallMin = safeScale[0]?.min ?? 0;
  const overallMax = safeScale[safeScale.length - 1]?.max ?? 100;

  const normalizedScore = useMemo(() => {
    if (!Number.isFinite(score)) return overallMin;
    return Math.min(Math.max(score, overallMin), overallMax);
  }, [score, overallMin, overallMax]);

  const currentScale = useMemo(() => {
    return (
      safeScale.find(
        (segment) =>
          normalizedScore >= segment.min && normalizedScore <= segment.max
      ) || DEFAULT_SEGMENT
    );
  }, [normalizedScore, safeScale]);

  const progressPercent = useMemo(() => {
    if (overallMax <= overallMin) return 0;
    return ((normalizedScore - overallMin) / (overallMax - overallMin)) * 100;
  }, [normalizedScore, overallMin, overallMax]);

  return (
    <div
      className={`reputation-score ${className}`.trim()}
      role="group"
      aria-label={`Pontuação de reputação: ${normalizedScore}, classificação ${currentScale.label}`}
    >
      <div className="reputation-score__header">
        <span
          className="reputation-score__value"
          style={{ color: currentScale.color }}
          aria-label={`Pontuação ${normalizedScore}`}
        >
          {normalizedScore}
        </span>

        <span
          className="reputation-score__label"
          style={{ color: currentScale.color }}
          aria-label={`Classificação ${currentScale.label}`}
        >
          {currentScale.label}
        </span>
      </div>

      {showScale && (
        <div className="reputation-score__wrapper">
          <div
            className="reputation-score__scale"
            role="progressbar"
            aria-valuemin={overallMin}
            aria-valuemax={overallMax}
            aria-valuenow={normalizedScore}
            aria-label="Escala de reputação"
          >
            {safeScale.map((segment) => (
              <div
                key={segment.class}
                className="reputation-score__segment"
                title={`${segment.label}: ${segment.min} a ${segment.max}`}
                style={{
                  backgroundColor: segment.color,
                  flex: segment.max - segment.min + 1,
                }}
              />
            ))}

            <div
              className="reputation-score__marker"
              style={{ left: `${progressPercent}%` }}
              aria-hidden="true"
            />
          </div>

          <div className="reputation-score__range" aria-hidden="true">
            <span>{overallMin}</span>
            <span>{overallMax}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReputationScore;
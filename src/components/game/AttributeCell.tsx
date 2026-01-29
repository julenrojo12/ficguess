import type { MatchResult } from '../../types/game.types';
import styles from './AttributeCell.module.css';

interface AttributeCellProps {
  value: string;
  result: MatchResult;
  animationDelay?: number;
}

export function AttributeCell({
  value,
  result,
  animationDelay = 0,
}: AttributeCellProps) {
  const resultClass = {
    correct: styles.correct,
    partial: styles.partial,
    incorrect: styles.incorrect,
    higher: styles.incorrect,
    lower: styles.incorrect,
  }[result];

  return (
    <div
      className={`${styles.cell} ${resultClass}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <span className={styles.value}>{value}</span>
    </div>
  );
}

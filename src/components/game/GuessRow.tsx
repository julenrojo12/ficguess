import type { Character, AttributeComparison } from '../../types/game.types';
import { AttributeCell } from './AttributeCell';
import styles from './GuessRow.module.css';

interface GuessRowProps {
  character: Character;
  comparisons: AttributeComparison[];
  rowIndex: number;
}

export function GuessRow({ character, comparisons, rowIndex }: GuessRowProps) {
  const baseDelay = rowIndex * 100;

  return (
    <div className={styles.row}>
      <div className={styles.character}>
        {character.image_url ? (
          <img
            src={character.image_url}
            alt={character.name}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {character.name.charAt(0)}
          </div>
        )}
        <span className={styles.name}>{character.name}</span>
      </div>

      <div className={styles.attributes}>
        {comparisons.map((comparison, index) => (
          <AttributeCell
            key={comparison.schema_id}
            value={comparison.display_result}
            result={comparison.result}
            animationDelay={baseDelay + index * 100}
          />
        ))}
      </div>
    </div>
  );
}

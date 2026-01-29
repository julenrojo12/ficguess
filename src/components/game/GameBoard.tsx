import type {
  Game,
  Character,
  AttributeSchema,
  AttributeComparison,
} from '../../types/game.types';
import { GuessRow } from './GuessRow';
import { CharacterInput } from './CharacterInput';
import { GameResult } from './GameResult';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  game: Game;
  schemas: AttributeSchema[];
  guesses: Character[];
  comparisons: AttributeComparison[][];
  availableCharacters: Character[];
  targetCharacter: Character;
  currentAttempt: number;
  isWon: boolean;
  isLost: boolean;
  isGameOver: boolean;
  onGuess: (character: Character) => void;
  onPlayAgain: () => void;
}

export function GameBoard({
  game,
  schemas,
  guesses,
  comparisons,
  availableCharacters,
  targetCharacter,
  currentAttempt,
  isWon,
  isLost: _isLost,
  isGameOver,
  onGuess,
  onPlayAgain,
}: GameBoardProps) {
  const visibleSchemas = schemas
    .filter((s) => s.is_visible)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <div className={styles.board}>
      <div className={styles.header}>
        <h1 className={styles.title}>{game.name}</h1>
        <p className={styles.subtitle}>
          Intento {currentAttempt} de {game.max_attempts}
        </p>
      </div>

      {/* Encabezados de atributos */}
      <div className={styles.attributeHeaders}>
        <div className={styles.characterHeader}>Personaje</div>
        {visibleSchemas.map((schema) => (
          <div key={schema.id} className={styles.attributeHeader}>
            {schema.display_name}
          </div>
        ))}
      </div>

      {/* Lista de intentos */}
      <div className={styles.guesses}>
        {guesses.map((character, index) => (
          <GuessRow
            key={character.id}
            character={character}
            comparisons={comparisons[index]}
            rowIndex={index}
          />
        ))}
      </div>

      {/* Input de busqueda */}
      {!isGameOver && (
        <div className={styles.inputSection}>
          <CharacterInput
            characters={availableCharacters}
            onSelect={onGuess}
            disabled={isGameOver}
            placeholder="Escribe el nombre de un personaje..."
          />
        </div>
      )}

      {/* Modal de resultado */}
      <GameResult
        isOpen={isGameOver}
        isWon={isWon}
        targetCharacter={targetCharacter}
        attempts={currentAttempt}
        maxAttempts={game.max_attempts}
        onPlayAgain={onPlayAgain}
      />
    </div>
  );
}

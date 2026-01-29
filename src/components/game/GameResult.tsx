import type { Character } from '../../types/game.types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import styles from './GameResult.module.css';

interface GameResultProps {
  isOpen: boolean;
  isWon: boolean;
  targetCharacter: Character;
  attempts: number;
  maxAttempts: number;
  onPlayAgain: () => void;
}

export function GameResult({
  isOpen,
  isWon,
  targetCharacter,
  attempts,
  maxAttempts,
  onPlayAgain,
}: GameResultProps) {
  const getResultEmoji = () => {
    if (!isWon) return '😔';
    if (attempts === 1) return '🏆';
    if (attempts <= 3) return '🎉';
    return '✅';
  };

  const getResultText = () => {
    if (!isWon) return 'No lograste adivinarlo';
    if (attempts === 1) return 'Increible! A la primera!';
    if (attempts <= 3) return 'Excelente!';
    return 'Lo lograste!';
  };

  const generateShareText = () => {
    const squares = Array(attempts)
      .fill('🟩')
      .concat(Array(maxAttempts - attempts).fill('⬜'))
      .join('');

    return `FicGuess - ${targetCharacter.name}\n${squares}\n${attempts}/${maxAttempts}`;
  };

  const handleShare = async () => {
    const text = generateShareText();

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Resultado copiado al portapapeles');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onPlayAgain} title={getResultText()}>
      <div className={styles.content}>
        <div className={styles.emoji}>{getResultEmoji()}</div>

        <div className={styles.character}>
          {targetCharacter.image_url ? (
            <img
              src={targetCharacter.image_url}
              alt={targetCharacter.name}
              className={styles.characterImage}
            />
          ) : (
            <div className={styles.characterPlaceholder}>
              {targetCharacter.name.charAt(0)}
            </div>
          )}
          <h3 className={styles.characterName}>{targetCharacter.name}</h3>
        </div>

        <p className={styles.attempts}>
          {isWon ? (
            <>
              Adivinaste en <strong>{attempts}</strong> de {maxAttempts} intentos
            </>
          ) : (
            <>
              El personaje era <strong>{targetCharacter.name}</strong>
            </>
          )}
        </p>

        <div className={styles.actions}>
          <Button onClick={handleShare} variant="secondary">
            Compartir
          </Button>
          <Button onClick={onPlayAgain} variant="primary">
            Jugar de nuevo
          </Button>
        </div>
      </div>
    </Modal>
  );
}

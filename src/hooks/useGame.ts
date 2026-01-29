import { useState, useCallback, useMemo } from 'react';
import type {
  Game,
  Character,
  AttributeSchema,
  AttributeComparison,
} from '../types/game.types';
import { compareCharacters, isCorrectGuess } from '../utils/compareAttributes';

interface UseGameOptions {
  game: Game;
  schemas: AttributeSchema[];
  characters: Character[];
  targetCharacter: Character;
}

interface UseGameReturn {
  // Estado
  guesses: Character[];
  comparisons: AttributeComparison[][];
  currentAttempt: number;
  isWon: boolean;
  isLost: boolean;
  isGameOver: boolean;
  remainingAttempts: number;

  // Acciones
  makeGuess: (character: Character) => void;
  resetGame: (newTarget?: Character) => void;

  // Helpers
  isCharacterGuessed: (characterId: string) => boolean;
  availableCharacters: Character[];
}

export function useGame({
  game,
  schemas,
  characters,
  targetCharacter: initialTarget,
}: UseGameOptions): UseGameReturn {
  const [guesses, setGuesses] = useState<Character[]>([]);
  const [comparisons, setComparisons] = useState<AttributeComparison[][]>([]);
  const [targetCharacter, setTargetCharacter] = useState(initialTarget);
  const [isWon, setIsWon] = useState(false);

  const currentAttempt = guesses.length;
  const isLost = !isWon && currentAttempt >= game.max_attempts;
  const isGameOver = isWon || isLost;
  const remainingAttempts = game.max_attempts - currentAttempt;

  const guessedIds = useMemo(
    () => new Set(guesses.map((g) => g.id)),
    [guesses]
  );

  const availableCharacters = useMemo(
    () => characters.filter((c) => !guessedIds.has(c.id) && c.is_active),
    [characters, guessedIds]
  );

  const isCharacterGuessed = useCallback(
    (characterId: string) => guessedIds.has(characterId),
    [guessedIds]
  );

  const makeGuess = useCallback(
    (character: Character) => {
      if (isGameOver || isCharacterGuessed(character.id)) {
        return;
      }

      const newComparisons = compareCharacters(
        schemas,
        character,
        targetCharacter
      );

      setGuesses((prev) => [...prev, character]);
      setComparisons((prev) => [...prev, newComparisons]);

      if (isCorrectGuess(newComparisons)) {
        setIsWon(true);
      }
    },
    [isGameOver, isCharacterGuessed, schemas, targetCharacter]
  );

  const resetGame = useCallback(
    (newTarget?: Character) => {
      setGuesses([]);
      setComparisons([]);
      setIsWon(false);

      if (newTarget) {
        setTargetCharacter(newTarget);
      } else {
        // Seleccionar un personaje aleatorio
        const candidates = characters.filter((c) => c.is_daily_candidate);
        const randomIndex = Math.floor(Math.random() * candidates.length);
        setTargetCharacter(candidates[randomIndex] || characters[0]);
      }
    },
    [characters]
  );

  return {
    guesses,
    comparisons,
    currentAttempt,
    isWon,
    isLost,
    isGameOver,
    remainingAttempts,
    makeGuess,
    resetGame,
    isCharacterGuessed,
    availableCharacters,
  };
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GameBoard } from '../components/game';
import { Loading, Button } from '../components/common';
import { getGameBySlug } from '../api/games';
import {
  getCharactersByGameId,
  getAttributeSchemasByGameId,
  getRandomCharacter,
} from '../api/characters';
import { useGame } from '../hooks/useGame';
import type { Game, Character, AttributeSchema } from '../types/game.types';
import styles from './Play.module.css';

export function Play() {
  const { slug } = useParams<{ slug: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [schemas, setSchemas] = useState<AttributeSchema[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [targetCharacter, setTargetCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGame() {
      if (!slug) return;

      try {
        setIsLoading(true);
        setError(null);

        const gameData = await getGameBySlug(slug);

        if (!gameData) {
          setError('Juego no encontrado');
          return;
        }

        const [schemasData, charactersData, randomCharacter] = await Promise.all(
          [
            getAttributeSchemasByGameId(gameData.id),
            getCharactersByGameId(gameData.id),
            getRandomCharacter(gameData.id),
          ]
        );

        if (!randomCharacter) {
          setError('Este juego no tiene personajes');
          return;
        }

        setGame(gameData);
        setSchemas(schemasData);
        setCharacters(charactersData);
        setTargetCharacter(randomCharacter);
      } catch (err) {
        console.error('Error loading game:', err);
        setError('Error al cargar el juego');
      } finally {
        setIsLoading(false);
      }
    }

    loadGame();
  }, [slug]);

  if (isLoading) {
    return <Loading fullScreen text="Cargando juego..." />;
  }

  if (error || !game || !targetCharacter) {
    return (
      <div className={styles.errorPage}>
        <h1>{error || 'Error'}</h1>
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <PlayGame
      game={game}
      schemas={schemas}
      characters={characters}
      initialTarget={targetCharacter}
    />
  );
}

interface PlayGameProps {
  game: Game;
  schemas: AttributeSchema[];
  characters: Character[];
  initialTarget: Character;
}

function PlayGame({ game, schemas, characters, initialTarget }: PlayGameProps) {
  const {
    guesses,
    comparisons,
    currentAttempt,
    isWon,
    isLost,
    isGameOver,
    availableCharacters,
    makeGuess,
    resetGame,
  } = useGame({
    game,
    schemas,
    characters,
    targetCharacter: initialTarget,
  });

  const handlePlayAgain = async () => {
    const newTarget = await getRandomCharacter(game.id);
    if (newTarget) {
      resetGame(newTarget);
    }
  };

  return (
    <div className={styles.page}>
      <GameBoard
        game={game}
        schemas={schemas}
        guesses={guesses}
        comparisons={comparisons}
        availableCharacters={availableCharacters}
        targetCharacter={initialTarget}
        currentAttempt={currentAttempt}
        isWon={isWon}
        isLost={isLost}
        isGameOver={isGameOver}
        onGuess={makeGuess}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}

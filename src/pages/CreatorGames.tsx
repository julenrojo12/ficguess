import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Loading } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { getMyGames } from '../api/games';
import type { Game } from '../types/game.types';
import styles from './CreatorGames.module.css';

export function CreatorGames() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function loadGames() {
      if (!user) return;

      try {
        const data = await getMyGames(user.id);
        setGames(data);
      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadGames();
    }
  }, [user]);

  if (authLoading || isLoading) {
    return <Loading fullScreen text="Cargando..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis Juegos</h1>
        <Link to="/creator/games/new">
          <Button>Crear nuevo juego</Button>
        </Link>
      </div>

      {games.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎮</div>
          <h2>Aun no tienes juegos</h2>
          <p>Crea tu primer juego y comparte personajes de tu universo favorito con la comunidad.</p>
          <Link to="/creator/games/new">
            <Button size="lg">Crear mi primer juego</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/creator/games/${game.id}`}
              className={styles.cardLink}
            >
              <Card variant="interactive" padding="md">
                <div className={styles.cardHeader}>
                  {game.cover_image_url ? (
                    <img
                      src={game.cover_image_url}
                      alt={game.name}
                      className={styles.cardImage}
                    />
                  ) : (
                    <div className={styles.cardImagePlaceholder}>
                      {game.name.charAt(0)}
                    </div>
                  )}
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardTitle}>{game.name}</h3>
                    <p className={styles.cardUniverse}>{game.universe}</p>
                  </div>
                </div>
                <div className={styles.cardStats}>
                  <span className={game.is_published ? styles.published : styles.draft}>
                    {game.is_published ? 'Publicado' : 'Borrador'}
                  </span>
                  <span>{game.play_count} partidas</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

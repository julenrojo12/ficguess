import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Loading } from '../components/common';
import { getGames, getFeaturedGames } from '../api/games';
import { useAuth } from '../hooks/useAuth';
import type { GameWithStats } from '../types/game.types';
import styles from './Home.module.css';

export function Home() {
  const { user } = useAuth();
  const [featuredGames, setFeaturedGames] = useState<GameWithStats[]>([]);
  const [popularGames, setPopularGames] = useState<GameWithStats[]>([]);
  const [recentGames, setRecentGames] = useState<GameWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGames() {
      try {
        const [featured, popular, recent] = await Promise.all([
          getFeaturedGames(),
          getGames({ limit: 8, orderBy: 'play_count' }),
          getGames({ limit: 8, orderBy: 'created_at' }),
        ]);

        setFeaturedGames(featured);
        setPopularGames(popular);
        setRecentGames(recent);
      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadGames();
  }, []);

  if (isLoading) {
    return <Loading fullScreen text="Cargando juegos..." />;
  }

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Adivina personajes de tus universos favoritos
        </h1>
        <p className={styles.heroSubtitle}>
          Juega el desafio diario de otro creadores o crea tu propio juego y compártelo con tus amigos.
        </p>
        <div className={styles.heroActions}>
          <Link to="/browse">
            <Button size="lg">Explorar juegos</Button>
          </Link>
          <Link to={user ? '/creator/games' : '/register'}>
            <Button variant="secondary" size="lg">
              Crear mi juego
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Games */}
      {featuredGames.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Juegos Destacados</h2>
          <div className={styles.gameGrid}>
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Games */}
      {popularGames.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Mas Jugados</h2>
            <Link to="/browse?sort=popular" className={styles.seeAll}>
              Ver todos
            </Link>
          </div>
          <div className={styles.gameGrid}>
            {popularGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Games */}
      {recentGames.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recientes</h2>
            <Link to="/browse?sort=recent" className={styles.seeAll}>
              Ver todos
            </Link>
          </div>
          <div className={styles.gameGrid}>
            {recentGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {popularGames.length === 0 && recentGames.length === 0 && (
        <section className={styles.emptyState}>
          <p>Aun no hay juegos disponibles.</p>
          <Link to={user ? '/creator/games' : '/register'}>
            <Button>Se el primero en crear uno</Button>
          </Link>
        </section>
      )}
    </div>
  );
}

function GameCard({ game }: { game: GameWithStats }) {
  return (
    <Link to={`/play/${game.slug}`} className={styles.cardLink}>
      <Card variant="interactive" padding="none">
        <div className={styles.cardImage}>
          {game.cover_image_url ? (
            <img src={game.cover_image_url} alt={game.name} />
          ) : (
            <div className={styles.cardImagePlaceholder}>
              {game.name.charAt(0)}
            </div>
          )}
        </div>
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{game.name}</h3>
          <p className={styles.cardUniverse}>{game.universe}</p>
          <div className={styles.cardStats}>
            <span>{game.total_plays} partidas</span>
            {game.total_plays > 0 && <span>{game.win_rate}% win rate</span>}
          </div>
        </div>
      </Card>
    </Link>
  );
}

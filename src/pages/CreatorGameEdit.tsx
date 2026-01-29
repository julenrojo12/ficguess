import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Loading } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabase';
import { publishGame, deleteGame } from '../api/games';
import { getCharactersByGameId, getAttributeSchemasByGameId } from '../api/characters';
import type { Game, Character, AttributeSchema } from '../types/game.types';
import styles from './CreatorGameEdit.module.css';

export function CreatorGameEdit() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [schemas, setSchemas] = useState<AttributeSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function loadGame() {
      if (!id || !user) return;

      try {
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('id', id)
          .single();

        if (gameError) throw gameError;

        if (gameData.creator_id !== user.id) {
          setError('No tienes permiso para editar este juego');
          return;
        }

        const [charactersData, schemasData] = await Promise.all([
          getCharactersByGameId(id),
          getAttributeSchemasByGameId(id),
        ]);

        setGame(gameData);
        setCharacters(charactersData);
        setSchemas(schemasData);
      } catch (err) {
        console.error('Error loading game:', err);
        setError('Error al cargar el juego');
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadGame();
    }
  }, [id, user]);

  const handlePublish = async () => {
    if (!game) return;

    if (characters.length === 0) {
      alert('Necesitas agregar al menos un personaje antes de publicar');
      return;
    }

    if (schemas.length === 0) {
      alert('Necesitas definir los atributos antes de publicar');
      return;
    }

    try {
      await publishGame(game.id);
      setGame({ ...game, is_published: true });
    } catch (err) {
      console.error('Error publishing game:', err);
      alert('Error al publicar el juego');
    }
  };

  const handleDelete = async () => {
    if (!game) return;

    if (!confirm('¿Estas seguro de que quieres eliminar este juego? Esta accion no se puede deshacer.')) {
      return;
    }

    try {
      await deleteGame(game.id);
      navigate('/creator/games');
    } catch (err) {
      console.error('Error deleting game:', err);
      alert('Error al eliminar el juego');
    }
  };

  if (authLoading || isLoading) {
    return <Loading fullScreen text="Cargando juego..." />;
  }

  if (error) {
    return (
      <div className={styles.errorPage}>
        <h1>{error}</h1>
        <Link to="/creator/games">
          <Button>Volver a mis juegos</Button>
        </Link>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <Link to="/creator/games" className={styles.backLink}>
            ← Mis juegos
          </Link>
          <h1 className={styles.title}>{game.name}</h1>
          <p className={styles.universe}>{game.universe}</p>
        </div>
        <div className={styles.headerActions}>
          <span className={game.is_published ? styles.published : styles.draft}>
            {game.is_published ? 'Publicado' : 'Borrador'}
          </span>
          {game.is_published ? (
            <Link to={`/play/${game.slug}`}>
              <Button variant="secondary">Ver juego</Button>
            </Link>
          ) : (
            <Button onClick={handlePublish}>Publicar</Button>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Atributos */}
        <Card padding="lg">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Atributos</h2>
            <Link to={`/creator/games/${game.id}/schemas`}>
              <Button variant="secondary" size="sm">
                {schemas.length === 0 ? 'Definir atributos' : 'Editar'}
              </Button>
            </Link>
          </div>
          {schemas.length === 0 ? (
            <p className={styles.emptyText}>
              Define los atributos que tendran tus personajes (nombre, genero, habilidad, etc.)
            </p>
          ) : (
            <div className={styles.schemaList}>
              {schemas.map((schema) => (
                <div key={schema.id} className={styles.schemaItem}>
                  <span className={styles.schemaName}>{schema.display_name}</span>
                  <span className={styles.schemaType}>{schema.type}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Personajes */}
        <Card padding="lg">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Personajes ({characters.length})</h2>
            <Link to={`/creator/games/${game.id}/characters`}>
              <Button variant="secondary" size="sm">
                {characters.length === 0 ? 'Agregar personajes' : 'Gestionar'}
              </Button>
            </Link>
          </div>
          {characters.length === 0 ? (
            <p className={styles.emptyText}>
              Agrega los personajes que los jugadores tendran que adivinar
            </p>
          ) : (
            <div className={styles.characterList}>
              {characters.slice(0, 5).map((char) => (
                <div key={char.id} className={styles.characterItem}>
                  {char.image_url ? (
                    <img src={char.image_url} alt={char.name} className={styles.characterImage} />
                  ) : (
                    <div className={styles.characterImagePlaceholder}>
                      {char.name.charAt(0)}
                    </div>
                  )}
                  <span>{char.name}</span>
                </div>
              ))}
              {characters.length > 5 && (
                <p className={styles.moreText}>y {characters.length - 5} mas...</p>
              )}
            </div>
          )}
        </Card>

        {/* Estadisticas */}
        <Card padding="lg">
          <h2 className={styles.sectionTitle}>Estadisticas</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{game.play_count}</span>
              <span className={styles.statLabel}>Partidas</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{game.win_count}</span>
              <span className={styles.statLabel}>Victorias</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {game.play_count > 0
                  ? Math.round((game.win_count / game.play_count) * 100)
                  : 0}%
              </span>
              <span className={styles.statLabel}>Win Rate</span>
            </div>
          </div>
        </Card>

        {/* Configuracion */}
        <Card padding="lg">
          <h2 className={styles.sectionTitle}>Configuracion</h2>
          <div className={styles.configList}>
            <div className={styles.configItem}>
              <span>Intentos maximos</span>
              <span>{game.max_attempts}</span>
            </div>
            <div className={styles.configItem}>
              <span>Pistas</span>
              <span>{game.hints_enabled ? 'Activadas' : 'Desactivadas'}</span>
            </div>
            <div className={styles.configItem}>
              <span>Modo diario</span>
              <span>{game.daily_mode_enabled ? 'Activado' : 'Desactivado'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Zona de peligro */}
      <Card padding="lg" className={styles.dangerZone}>
        <h2 className={styles.sectionTitle}>Zona de peligro</h2>
        <p className={styles.dangerText}>
          Eliminar este juego es una accion permanente y no se puede deshacer.
        </p>
        <Button variant="secondary" onClick={handleDelete}>
          Eliminar juego
        </Button>
      </Card>
    </div>
  );
}

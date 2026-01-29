import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, Loading, Input, Tag } from '../components/common';
import { getGames, getTags } from '../api/games';
import type { GameWithStats, Tag as TagType } from '../types/game.types';
import styles from './Browse.module.css';

export function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState<GameWithStats[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');

  // Obtener tags seleccionados de la URL (separados por coma)
  const selectedTagsParam = searchParams.get('tags');
  const selectedTags = selectedTagsParam ? selectedTagsParam.split(',') : [];
  const sortBy = searchParams.get('sort') || 'popular';

  // Cargar tags al montar el componente
  useEffect(() => {
    getTags()
      .then(setTags)
      .catch((error) => console.error('Error loading tags:', error));
  }, []);

  useEffect(() => {
    async function loadGames() {
      setIsLoading(true);
      try {
        const data = await getGames({
          orderBy: sortBy === 'recent' ? 'created_at' : 'play_count',
          tagSlugs: selectedTags.length > 0 ? selectedTags : undefined,
          search: search || undefined,
        });
        setGames(data);
      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setIsLoading(false);
      }
    }

    const debounce = setTimeout(loadGames, 300);
    return () => clearTimeout(debounce);
  }, [selectedTagsParam, sortBy, search]);

  const handleTagClick = (tagSlug: string) => {
    const newParams = new URLSearchParams(searchParams);
    const newSelectedTags = selectedTags.includes(tagSlug)
      ? selectedTags.filter((t) => t !== tagSlug)
      : [...selectedTags, tagSlug];

    if (newSelectedTags.length === 0) {
      newParams.delete('tags');
    } else {
      newParams.set('tags', newSelectedTags.join(','));
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    setSearchParams(newParams);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Explorar Juegos</h1>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <Tag
              key={tag.slug}
              label={tag.name}
              icon={tag.icon}
              onClick={() => handleTagClick(tag.slug)}
              selected={selectedTags.includes(tag.slug)}
            />
          ))}
        </div>

        <div className={styles.controls}>
          <Input
            type="search"
            placeholder="Buscar juegos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />

          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="popular">Mas jugados</option>
            <option value="recent">Mas recientes</option>
          </select>
        </div>
      </div>

      {/* Games Grid */}
      {isLoading ? (
        <Loading text="Buscando juegos..." />
      ) : games.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No se encontraron juegos</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/play/${game.slug}`}
              className={styles.cardLink}
            >
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
                  <div className={styles.cardTags}>
                    {game.tag_names.slice(0, 2).map((tag) => (
                      <Tag key={tag} label={tag} size="sm" />
                    ))}
                  </div>
                  <div className={styles.cardStats}>
                    <span>{game.total_plays} partidas</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

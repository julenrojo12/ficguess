import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { createGame, getTags } from '../api/games';
import type { Tag } from '../types/game.types';
import styles from './CreatorGameNew.module.css';

export function CreatorGameNew() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    universe: '',
    cover_image_url: '',
    max_attempts: 6,
    hints_enabled: false,
    daily_mode_enabled: false,
    tag_ids: [] as number[],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    getTags()
      .then(setTags)
      .catch((err) => console.error('Error loading tags:', err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleTagToggle = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!formData.universe.trim()) {
      setError('El universo es obligatorio');
      return;
    }

    if (!user) return;

    setIsLoading(true);

    try {
      const game = await createGame(user.id, formData);
      navigate(`/creator/games/${game.id}`);
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Error al crear el juego. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Crear nuevo juego</h1>

      <Card padding="lg" className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Nombre del juego"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Adivina el personaje de Harry Potter"
            required
          />

          <Input
            label="Universo"
            name="universe"
            value={formData.universe}
            onChange={handleChange}
            placeholder="Ej: Harry Potter, Star Wars, One Piece..."
            required
          />

          <div className={styles.field}>
            <label className={styles.label}>Descripcion (opcional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe tu juego..."
              className={styles.textarea}
              rows={3}
            />
          </div>

          <Input
            label="URL de imagen de portada (opcional)"
            name="cover_image_url"
            value={formData.cover_image_url}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
          />

          <div className={styles.field}>
            <label className={styles.label}>Categorias</label>
            <div className={styles.tags}>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`${styles.tagButton} ${
                    formData.tag_ids.includes(tag.id) ? styles.tagSelected : ''
                  }`}
                  onClick={() => handleTagToggle(tag.id)}
                >
                  {tag.icon} {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Intentos maximos</label>
              <select
                name="max_attempts"
                value={formData.max_attempts}
                onChange={handleChange}
                className={styles.select}
              >
                <option value={4}>4 intentos</option>
                <option value={5}>5 intentos</option>
                <option value={6}>6 intentos</option>
                <option value={8}>8 intentos</option>
                <option value={10}>10 intentos</option>
              </select>
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="hints_enabled"
                checked={formData.hints_enabled}
                onChange={handleCheckboxChange}
              />
              <span>Habilitar pistas</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="daily_mode_enabled"
                checked={formData.daily_mode_enabled}
                onChange={handleCheckboxChange}
              />
              <span>Habilitar modo diario</span>
            </label>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/creator/games')}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Crear juego
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

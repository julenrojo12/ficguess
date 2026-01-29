import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Loading, Input } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabase';
import { getCharactersByGameId, getAttributeSchemasByGameId } from '../api/characters';
import type { Game, Character, AttributeSchema } from '../types/game.types';
import styles from './CreatorGameCharacters.module.css';

interface CharacterFormData {
  id?: string;
  name: string;
  image_url: string;
  description: string;
  attributes: Record<string, string | number | boolean | string[]>;
}

export function CreatorGameCharacters() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [schemas, setSchemas] = useState<AttributeSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [editingCharacter, setEditingCharacter] = useState<CharacterFormData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function loadData() {
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
        console.error('Error loading data:', err);
        setError('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [id, user]);

  const getEmptyCharacter = (): CharacterFormData => {
    const attributes: Record<string, string | number | boolean | string[]> = {};
    schemas.forEach((schema) => {
      switch (schema.type) {
        case 'number':
        case 'year':
          attributes[schema.name] = 0;
          break;
        case 'boolean':
          attributes[schema.name] = false;
          break;
        case 'multi':
          attributes[schema.name] = [];
          break;
        default:
          attributes[schema.name] = '';
      }
    });
    return { name: '', image_url: '', description: '', attributes };
  };

  const handleCreateNew = () => {
    if (schemas.length === 0) {
      alert('Primero debes definir los atributos del juego');
      navigate(`/creator/games/${id}/schemas`);
      return;
    }
    setEditingCharacter(getEmptyCharacter());
    setIsCreating(true);
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter({
      id: character.id,
      name: character.name,
      image_url: character.image_url || '',
      description: character.description || '',
      attributes: { ...character.attributes },
    });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingCharacter(null);
    setIsCreating(false);
  };

  const handleAttributeChange = (schemaName: string, value: string | number | boolean | string[]) => {
    if (!editingCharacter) return;
    setEditingCharacter({
      ...editingCharacter,
      attributes: { ...editingCharacter.attributes, [schemaName]: value },
    });
  };

  const handleMultiSelectToggle = (schemaName: string, value: string) => {
    if (!editingCharacter) return;
    const current = (editingCharacter.attributes[schemaName] as string[]) || [];
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    handleAttributeChange(schemaName, newValue);
  };

  const handleSave = async () => {
    if (!editingCharacter || !game) return;

    if (!editingCharacter.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    setIsSaving(true);

    try {
      const characterData = {
        game_id: game.id,
        name: editingCharacter.name.trim(),
        image_url: editingCharacter.image_url.trim() || null,
        description: editingCharacter.description.trim() || null,
        attributes: editingCharacter.attributes,
      };

      if (isCreating) {
        const { data, error } = await supabase
          .from('characters')
          .insert(characterData)
          .select()
          .single();

        if (error) throw error;
        setCharacters([...characters, data]);
      } else {
        const { data, error } = await supabase
          .from('characters')
          .update(characterData)
          .eq('id', editingCharacter.id)
          .select()
          .single();

        if (error) throw error;
        setCharacters(characters.map((c) => (c.id === editingCharacter.id ? data : c)));
      }

      setEditingCharacter(null);
      setIsCreating(false);
    } catch (err: unknown) {
      console.error('Error saving character:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar';
      if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
        alert('Ya existe un personaje con ese nombre');
      } else {
        alert('Error al guardar el personaje');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (characterId: string) => {
    if (!confirm('¿Eliminar este personaje?')) return;

    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);

      if (error) throw error;
      setCharacters(characters.filter((c) => c.id !== characterId));
    } catch (err) {
      console.error('Error deleting character:', err);
      alert('Error al eliminar el personaje');
    }
  };

  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) {
    return <Loading fullScreen text="Cargando..." />;
  }

  if (error || !game) {
    return (
      <div className={styles.errorPage}>
        <h1>{error || 'Error'}</h1>
        <Link to="/creator/games">
          <Button>Volver a mis juegos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link to={`/creator/games/${game.id}`} className={styles.backLink}>
            ← Volver al juego
          </Link>
          <h1 className={styles.title}>Personajes de {game.name}</h1>
          <p className={styles.subtitle}>
            {characters.length} personaje{characters.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleCreateNew} disabled={!!editingCharacter}>
          Agregar personaje
        </Button>
      </div>

      {/* Formulario de edicion */}
      {editingCharacter && (
        <Card padding="lg" className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {isCreating ? 'Nuevo personaje' : 'Editar personaje'}
          </h2>
          <div className={styles.form}>
            <div className={styles.formRow}>
              <Input
                label="Nombre"
                value={editingCharacter.name}
                onChange={(e) =>
                  setEditingCharacter({ ...editingCharacter, name: e.target.value })
                }
                placeholder="Nombre del personaje"
                required
              />
              <Input
                label="URL de imagen (opcional)"
                value={editingCharacter.image_url}
                onChange={(e) =>
                  setEditingCharacter({ ...editingCharacter, image_url: e.target.value })
                }
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <h3 className={styles.attributesTitle}>Atributos</h3>
            <div className={styles.attributesGrid}>
              {schemas.map((schema) => (
                <div key={schema.id} className={styles.attributeField}>
                  <label className={styles.label}>{schema.display_name}</label>
                  {renderAttributeInput(schema, editingCharacter, handleAttributeChange, handleMultiSelectToggle)}
                </div>
              ))}
            </div>

            <div className={styles.formActions}>
              <Button variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave} isLoading={isSaving}>
                {isCreating ? 'Crear' : 'Guardar'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Buscador */}
      {characters.length > 5 && !editingCharacter && (
        <div className={styles.searchBar}>
          <Input
            type="search"
            placeholder="Buscar personaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Lista de personajes */}
      {characters.length === 0 && !editingCharacter ? (
        <Card padding="lg" className={styles.emptyState}>
          <p>No has agregado ningun personaje todavia.</p>
          {schemas.length === 0 ? (
            <p className={styles.emptyHint}>
              Primero debes <Link to={`/creator/games/${game.id}/schemas`}>definir los atributos</Link> del juego.
            </p>
          ) : (
            <p className={styles.emptyHint}>
              Agrega personajes para que los jugadores puedan adivinarlos.
            </p>
          )}
        </Card>
      ) : (
        <div className={styles.characterList}>
          {filteredCharacters.map((character) => (
            <Card key={character.id} padding="md" className={styles.characterCard}>
              <div className={styles.characterInfo}>
                {character.image_url ? (
                  <img
                    src={character.image_url}
                    alt={character.name}
                    className={styles.characterImage}
                  />
                ) : (
                  <div className={styles.characterImagePlaceholder}>
                    {character.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className={styles.characterName}>{character.name}</h3>
                  <p className={styles.characterMeta}>
                    {Object.entries(character.attributes)
                      .slice(0, 3)
                      .map(([key, value]) => {
                        const schema = schemas.find((s) => s.name === key);
                        const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                        return `${schema?.display_name || key}: ${displayValue}`;
                      })
                      .join(' • ')}
                  </p>
                </div>
              </div>
              <div className={styles.characterActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(character)}
                  disabled={!!editingCharacter}
                >
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(character.id)}
                  disabled={!!editingCharacter}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function renderAttributeInput(
  schema: AttributeSchema,
  character: CharacterFormData,
  onChange: (name: string, value: string | number | boolean | string[]) => void,
  onMultiToggle: (name: string, value: string) => void
) {
  const value = character.attributes[schema.name];

  switch (schema.type) {
    case 'boolean':
      return (
        <select
          value={String(value)}
          onChange={(e) => onChange(schema.name, e.target.value === 'true')}
          className={styles.select}
        >
          <option value="true">Si</option>
          <option value="false">No</option>
        </select>
      );

    case 'number':
    case 'year':
      return (
        <input
          type="number"
          value={value as number}
          onChange={(e) => onChange(schema.name, parseInt(e.target.value) || 0)}
          className={styles.input}
        />
      );

    case 'select':
      return (
        <select
          value={value as string}
          onChange={(e) => onChange(schema.name, e.target.value)}
          className={styles.select}
        >
          <option value="">Seleccionar...</option>
          {schema.possible_values?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case 'multi':
      return (
        <div className={styles.multiSelect}>
          {schema.possible_values?.map((opt) => (
            <label key={opt} className={styles.multiOption}>
              <input
                type="checkbox"
                checked={(value as string[])?.includes(opt)}
                onChange={() => onMultiToggle(schema.name, opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={value as string}
          onChange={(e) => onChange(schema.name, e.target.value)}
          className={styles.input}
          placeholder={schema.display_name}
        />
      );
  }
}

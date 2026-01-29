import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Loading, Input } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabase';
import { getAttributeSchemasByGameId } from '../api/characters';
import type { Game, AttributeSchema, AttributeType, ComparisonType } from '../types/game.types';
import styles from './CreatorGameSchemas.module.css';

const ATTRIBUTE_TYPES: { value: AttributeType; label: string; description: string }[] = [
  { value: 'text', label: 'Texto', description: 'Texto simple (ej: nombre, afiliacion)' },
  { value: 'number', label: 'Numero', description: 'Valor numerico (ej: edad, poder)' },
  { value: 'year', label: 'Ano', description: 'Ano (ej: ano de nacimiento)' },
  { value: 'select', label: 'Seleccion', description: 'Una opcion de varias (ej: genero)' },
  { value: 'multi', label: 'Multiple', description: 'Varias opciones (ej: habilidades)' },
  { value: 'boolean', label: 'Si/No', description: 'Verdadero o falso (ej: esta vivo?)' },
];

const COMPARISON_TYPES: { value: ComparisonType; label: string }[] = [
  { value: 'exact', label: 'Exacta' },
  { value: 'partial', label: 'Parcial' },
  { value: 'range', label: 'Rango (mayor/menor)' },
  { value: 'contains', label: 'Contiene' },
];

interface SchemaFormData {
  id?: string;
  name: string;
  display_name: string;
  type: AttributeType;
  comparison_type: ComparisonType;
  possible_values: string;
  is_required: boolean;
  is_visible: boolean;
}

const emptySchema: SchemaFormData = {
  name: '',
  display_name: '',
  type: 'text',
  comparison_type: 'exact',
  possible_values: '',
  is_required: true,
  is_visible: true,
};

export function CreatorGameSchemas() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(null);
  const [schemas, setSchemas] = useState<AttributeSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [editingSchema, setEditingSchema] = useState<SchemaFormData | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

        const schemasData = await getAttributeSchemasByGameId(id);

        setGame(gameData);
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

  const handleCreateNew = () => {
    setEditingSchema({ ...emptySchema });
    setIsCreating(true);
  };

  const handleEdit = (schema: AttributeSchema) => {
    setEditingSchema({
      id: schema.id,
      name: schema.name,
      display_name: schema.display_name,
      type: schema.type,
      comparison_type: schema.comparison_type,
      possible_values: schema.possible_values?.join(', ') || '',
      is_required: schema.is_required,
      is_visible: schema.is_visible,
    });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingSchema(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!editingSchema || !game) return;

    if (!editingSchema.name.trim() || !editingSchema.display_name.trim()) {
      alert('El nombre y nombre a mostrar son obligatorios');
      return;
    }

    setIsSaving(true);

    try {
      const schemaData = {
        game_id: game.id,
        name: editingSchema.name.trim().toLowerCase().replace(/\s+/g, '_'),
        display_name: editingSchema.display_name.trim(),
        type: editingSchema.type,
        comparison_type: editingSchema.comparison_type,
        possible_values: editingSchema.possible_values
          ? editingSchema.possible_values.split(',').map((v) => v.trim()).filter(Boolean)
          : null,
        is_required: editingSchema.is_required,
        is_visible: editingSchema.is_visible,
        order_index: isCreating ? schemas.length : schemas.findIndex((s) => s.id === editingSchema.id),
      };

      if (isCreating) {
        const { data, error } = await supabase
          .from('attribute_schemas')
          .insert(schemaData)
          .select()
          .single();

        if (error) throw error;
        setSchemas([...schemas, data]);
      } else {
        const { data, error } = await supabase
          .from('attribute_schemas')
          .update(schemaData)
          .eq('id', editingSchema.id)
          .select()
          .single();

        if (error) throw error;
        setSchemas(schemas.map((s) => (s.id === editingSchema.id ? data : s)));
      }

      setEditingSchema(null);
      setIsCreating(false);
    } catch (err) {
      console.error('Error saving schema:', err);
      alert('Error al guardar el atributo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (schemaId: string) => {
    if (!confirm('¿Eliminar este atributo?')) return;

    try {
      const { error } = await supabase
        .from('attribute_schemas')
        .delete()
        .eq('id', schemaId);

      if (error) throw error;
      setSchemas(schemas.filter((s) => s.id !== schemaId));
    } catch (err) {
      console.error('Error deleting schema:', err);
      alert('Error al eliminar el atributo');
    }
  };

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
          <h1 className={styles.title}>Atributos de {game.name}</h1>
          <p className={styles.subtitle}>
            Define las caracteristicas que tendran tus personajes
          </p>
        </div>
        <Button onClick={handleCreateNew} disabled={!!editingSchema}>
          Agregar atributo
        </Button>
      </div>

      {/* Formulario de edicion */}
      {editingSchema && (
        <Card padding="lg" className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {isCreating ? 'Nuevo atributo' : 'Editar atributo'}
          </h2>
          <div className={styles.form}>
            <div className={styles.formRow}>
              <Input
                label="Nombre interno"
                value={editingSchema.name}
                onChange={(e) =>
                  setEditingSchema({ ...editingSchema, name: e.target.value })
                }
                placeholder="ej: genero"
              />
              <Input
                label="Nombre a mostrar"
                value={editingSchema.display_name}
                onChange={(e) =>
                  setEditingSchema({ ...editingSchema, display_name: e.target.value })
                }
                placeholder="ej: Genero"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>Tipo de dato</label>
                <select
                  value={editingSchema.type}
                  onChange={(e) =>
                    setEditingSchema({
                      ...editingSchema,
                      type: e.target.value as AttributeType,
                    })
                  }
                  className={styles.select}
                >
                  {ATTRIBUTE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Tipo de comparacion</label>
                <select
                  value={editingSchema.comparison_type}
                  onChange={(e) =>
                    setEditingSchema({
                      ...editingSchema,
                      comparison_type: e.target.value as ComparisonType,
                    })
                  }
                  className={styles.select}
                >
                  {COMPARISON_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(editingSchema.type === 'select' || editingSchema.type === 'multi') && (
              <Input
                label="Valores posibles (separados por coma)"
                value={editingSchema.possible_values}
                onChange={(e) =>
                  setEditingSchema({ ...editingSchema, possible_values: e.target.value })
                }
                placeholder="ej: Masculino, Femenino, Otro"
              />
            )}

            <div className={styles.checkboxes}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={editingSchema.is_required}
                  onChange={(e) =>
                    setEditingSchema({ ...editingSchema, is_required: e.target.checked })
                  }
                />
                <span>Obligatorio</span>
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={editingSchema.is_visible}
                  onChange={(e) =>
                    setEditingSchema({ ...editingSchema, is_visible: e.target.checked })
                  }
                />
                <span>Visible en el juego</span>
              </label>
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

      {/* Lista de schemas */}
      {schemas.length === 0 && !editingSchema ? (
        <Card padding="lg" className={styles.emptyState}>
          <p>No has definido ningun atributo todavia.</p>
          <p className={styles.emptyHint}>
            Los atributos son las caracteristicas que definen a tus personajes (genero, edad, habilidades, etc.)
          </p>
        </Card>
      ) : (
        <div className={styles.schemaList}>
          {schemas.map((schema, index) => (
            <Card key={schema.id} padding="md" className={styles.schemaCard}>
              <div className={styles.schemaInfo}>
                <span className={styles.schemaOrder}>{index + 1}</span>
                <div>
                  <h3 className={styles.schemaName}>{schema.display_name}</h3>
                  <p className={styles.schemaMeta}>
                    {ATTRIBUTE_TYPES.find((t) => t.value === schema.type)?.label} •{' '}
                    {COMPARISON_TYPES.find((t) => t.value === schema.comparison_type)?.label}
                    {schema.possible_values && ` • ${schema.possible_values.length} opciones`}
                  </p>
                </div>
              </div>
              <div className={styles.schemaActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(schema)}
                  disabled={!!editingSchema}
                >
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(schema.id)}
                  disabled={!!editingSchema}
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

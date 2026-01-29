// Tipos de atributos soportados
export type AttributeType =
  | 'text'      // Texto simple
  | 'number'    // Numerico
  | 'year'      // Ano
  | 'select'    // Seleccion unica
  | 'multi'     // Seleccion multiple
  | 'boolean';  // Si/No

// Tipos de comparacion
export type ComparisonType =
  | 'exact'     // Coincidencia exacta
  | 'partial'   // Coincidencia parcial
  | 'range'     // Mayor/menor/igual
  | 'contains'; // Contiene texto

// Resultado de la comparacion
export type MatchResult =
  | 'correct'   // Verde - correcto
  | 'partial'   // Amarillo - parcialmente correcto
  | 'incorrect' // Gris - incorrecto
  | 'higher'    // Para numeros - el valor objetivo es mayor
  | 'lower';    // Para numeros - el valor objetivo es menor

// Esquema de atributo (definicion)
export interface AttributeSchema {
  id: string;
  game_id: string;
  name: string;           // Identificador interno
  display_name: string;   // Nombre mostrado al usuario
  type: AttributeType;
  possible_values?: string[];  // Para select/multi
  comparison_type: ComparisonType;
  icon?: string;
  color?: string;
  order_index: number;
  is_required: boolean;
  is_visible: boolean;
}

// Resultado de comparacion de un atributo
export interface AttributeComparison {
  schema_id: string;
  schema_name: string;
  display_name: string;
  guessed_value: string | number | boolean | string[];
  target_value: string | number | boolean | string[];
  result: MatchResult;
  display_result: string;
}

// Juego
export interface Game {
  id: string;
  creator_id: string;
  name: string;
  slug: string;
  description?: string;
  universe: string;
  cover_image_url?: string;
  max_attempts: number;
  hints_enabled: boolean;
  daily_mode_enabled: boolean;
  is_published: boolean;
  is_featured: boolean;
  play_count: number;
  win_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// Juego con estadisticas y datos del creador
export interface GameWithStats extends Game {
  creator_username?: string;
  creator_avatar?: string;
  total_plays: number;
  total_wins: number;
  win_rate: number;
  character_count: number;
  tag_names: string[];
}

// Personaje
export interface Character {
  id: string;
  game_id: string;
  name: string;
  image_url?: string;
  description?: string;
  attributes: Record<string, string | number | boolean | string[]>;
  is_active: boolean;
  is_daily_candidate: boolean;
  difficulty_score: number;
  created_at: string;
  updated_at: string;
}

// Tag/Categoria
export interface Tag {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

// Sesion de juego
export interface PlaySession {
  id: string;
  game_id: string;
  target_character_id: string;
  session_token: string;
  guesses: string[];  // IDs de personajes intentados
  is_won: boolean;
  is_completed: boolean;
  attempts_count: number;
  game_mode: 'random' | 'daily';
  started_at: string;
  completed_at?: string;
}

// Creador
export interface Creator {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

// Estado del juego activo
export interface GameState {
  game: Game;
  schemas: AttributeSchema[];
  characters: Character[];
  targetCharacter: Character;
  guesses: Character[];
  comparisons: AttributeComparison[][];
  isWon: boolean;
  isLost: boolean;
  isLoading: boolean;
  currentAttempt: number;
}

// Formulario de creacion de juego
export interface GameFormData {
  name: string;
  description?: string;
  universe: string;
  cover_image_url?: string;
  max_attempts: number;
  hints_enabled: boolean;
  daily_mode_enabled: boolean;
  tag_ids: number[];
}

// Formulario de personaje
export interface CharacterFormData {
  name: string;
  image_url?: string;
  description?: string;
  attributes: Record<string, string | number | boolean | string[]>;
}

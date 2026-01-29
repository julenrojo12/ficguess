-- FicGuess Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- ===========================================
-- TABLA: creators (usuarios creadores)
-- ===========================================
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creators_username ON creators(username);

-- ===========================================
-- TABLA: tags (categorias/etiquetas)
-- ===========================================
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags predefinidos
INSERT INTO tags (name, slug, icon) VALUES
    ('Anime', 'anime', '🎌'),
    ('Peliculas', 'movies', '🎬'),
    ('Series TV', 'tv-series', '📺'),
    ('Videojuegos', 'videogames', '🎮'),
    ('Comics', 'comics', '📚'),
    ('Libros', 'books', '📖'),
    ('Ciencia Ficcion', 'sci-fi', '🚀'),
    ('Fantasia', 'fantasy', '🧙'),
    ('Superheroes', 'superheroes', '🦸'),
    ('Disney', 'disney', '🏰')
ON CONFLICT (slug) DO NOTHING;

-- ===========================================
-- TABLA: games (juegos/quizzes)
-- ===========================================
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    universe TEXT NOT NULL,
    cover_image_url TEXT,
    max_attempts INTEGER DEFAULT 6,
    hints_enabled BOOLEAN DEFAULT false,
    daily_mode_enabled BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    play_count INTEGER DEFAULT 0,
    win_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_games_creator ON games(creator_id);
CREATE INDEX IF NOT EXISTS idx_games_published ON games(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_games_play_count ON games(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);

-- ===========================================
-- TABLA: game_tags (relacion many-to-many)
-- ===========================================
CREATE TABLE IF NOT EXISTS game_tags (
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_game_tags_tag ON game_tags(tag_id);

-- ===========================================
-- TABLA: attribute_schemas (definicion de atributos por juego)
-- ===========================================
CREATE TABLE IF NOT EXISTS attribute_schemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'number', 'year', 'select', 'multi', 'boolean')),
    possible_values JSONB,
    comparison_type TEXT DEFAULT 'exact' CHECK (comparison_type IN ('exact', 'partial', 'range', 'contains')),
    icon TEXT,
    color TEXT,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    UNIQUE(game_id, name),
    UNIQUE(game_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_attribute_schemas_game ON attribute_schemas(game_id);

-- ===========================================
-- TABLA: characters (personajes)
-- ===========================================
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    attributes JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_daily_candidate BOOLEAN DEFAULT true,
    difficulty_score INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(game_id, name)
);

CREATE INDEX IF NOT EXISTS idx_characters_game ON characters(game_id);
CREATE INDEX IF NOT EXISTS idx_characters_attributes ON characters USING GIN(attributes);

-- ===========================================
-- TABLA: play_sessions (partidas de jugadores)
-- ===========================================
CREATE TABLE IF NOT EXISTS play_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    target_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    guesses JSONB DEFAULT '[]',
    is_won BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    attempts_count INTEGER DEFAULT 0,
    game_mode TEXT DEFAULT 'random' CHECK (game_mode IN ('random', 'daily')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(game_id, session_token, target_character_id)
);

CREATE INDEX IF NOT EXISTS idx_play_sessions_game ON play_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_play_sessions_token ON play_sessions(session_token);

-- ===========================================
-- FUNCIONES Y TRIGGERS
-- ===========================================

-- Funcion para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trigger_creators_updated_at ON creators;
CREATE TRIGGER trigger_creators_updated_at
    BEFORE UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_games_updated_at ON games;
CREATE TRIGGER trigger_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_characters_updated_at ON characters;
CREATE TRIGGER trigger_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Funcion para incrementar play_count
CREATE OR REPLACE FUNCTION increment_play_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE games
    SET play_count = play_count + 1
    WHERE id = NEW.game_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_play_count ON play_sessions;
CREATE TRIGGER trigger_increment_play_count
    AFTER INSERT ON play_sessions
    FOR EACH ROW EXECUTE FUNCTION increment_play_count();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribute_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Politicas para CREATORS
DROP POLICY IF EXISTS "creators_public_read" ON creators;
CREATE POLICY "creators_public_read" ON creators
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "creators_update_own" ON creators;
CREATE POLICY "creators_update_own" ON creators
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "creators_insert_own" ON creators;
CREATE POLICY "creators_insert_own" ON creators
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politicas para GAMES
DROP POLICY IF EXISTS "games_public_read" ON games;
CREATE POLICY "games_public_read" ON games
    FOR SELECT USING (is_published = true OR auth.uid() = creator_id);

DROP POLICY IF EXISTS "games_insert_own" ON games;
CREATE POLICY "games_insert_own" ON games
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "games_update_own" ON games;
CREATE POLICY "games_update_own" ON games
    FOR UPDATE USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "games_delete_own" ON games;
CREATE POLICY "games_delete_own" ON games
    FOR DELETE USING (auth.uid() = creator_id);

-- Politicas para CHARACTERS
DROP POLICY IF EXISTS "characters_public_read" ON characters;
CREATE POLICY "characters_public_read" ON characters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM games
            WHERE games.id = characters.game_id
            AND (games.is_published = true OR games.creator_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "characters_manage_own" ON characters;
CREATE POLICY "characters_manage_own" ON characters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM games
            WHERE games.id = characters.game_id
            AND games.creator_id = auth.uid()
        )
    );

-- Politicas para ATTRIBUTE_SCHEMAS
DROP POLICY IF EXISTS "schemas_public_read" ON attribute_schemas;
CREATE POLICY "schemas_public_read" ON attribute_schemas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM games
            WHERE games.id = attribute_schemas.game_id
            AND (games.is_published = true OR games.creator_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "schemas_manage_own" ON attribute_schemas;
CREATE POLICY "schemas_manage_own" ON attribute_schemas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM games
            WHERE games.id = attribute_schemas.game_id
            AND games.creator_id = auth.uid()
        )
    );

-- Politicas para PLAY_SESSIONS (anonimo)
DROP POLICY IF EXISTS "sessions_public_insert" ON play_sessions;
CREATE POLICY "sessions_public_insert" ON play_sessions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "sessions_public_select" ON play_sessions;
CREATE POLICY "sessions_public_select" ON play_sessions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "sessions_public_update" ON play_sessions;
CREATE POLICY "sessions_public_update" ON play_sessions
    FOR UPDATE USING (true);

-- Politicas para TAGS (lectura publica)
DROP POLICY IF EXISTS "tags_public_read" ON tags;
CREATE POLICY "tags_public_read" ON tags
    FOR SELECT USING (true);

-- Politicas para GAME_TAGS
DROP POLICY IF EXISTS "game_tags_public_read" ON game_tags;
CREATE POLICY "game_tags_public_read" ON game_tags
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "game_tags_manage_own" ON game_tags;
CREATE POLICY "game_tags_manage_own" ON game_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM games
            WHERE games.id = game_tags.game_id
            AND games.creator_id = auth.uid()
        )
    );

-- ===========================================
-- DATOS DE EJEMPLO (opcional)
-- ===========================================

-- Descomenta las siguientes lineas para crear un juego de ejemplo

/*
-- Crear un usuario de ejemplo (debes reemplazar el UUID con un usuario real de auth.users)
-- INSERT INTO creators (id, email, username) VALUES ('tu-uuid-aqui', 'demo@example.com', 'demo');

-- Crear un juego de ejemplo
-- INSERT INTO games (id, creator_id, name, slug, description, universe, max_attempts, is_published)
-- VALUES (
--     gen_random_uuid(),
--     'tu-uuid-aqui',
--     'Harry Potter Quiz',
--     'harry-potter-quiz',
--     'Adivina personajes del mundo magico',
--     'Harry Potter',
--     6,
--     true
-- );
*/

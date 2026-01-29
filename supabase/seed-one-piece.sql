-- Seed data: One Piece Quiz
-- Ejecuta este script en Supabase SQL Editor

DO $$
DECLARE
    game_uuid UUID := 'b2c3d4e5-f6a7-8901-bcde-f23456789012';
BEGIN

-- Crear el juego
INSERT INTO games (id, creator_id, name, slug, description, universe, max_attempts, is_published, is_featured, play_count)
VALUES (
    game_uuid,
    NULL,
    'One Piece Quiz',
    'one-piece-quiz',
    'Adivina personajes del mundo de One Piece. Usa las pistas de tripulacion, fruta del diablo y mas.',
    'One Piece',
    6,
    true,
    true,
    0
) ON CONFLICT (slug) DO UPDATE SET is_published = true;

-- Eliminar esquemas anteriores si existen
DELETE FROM attribute_schemas WHERE game_id = game_uuid;

-- Crear esquemas de atributos
INSERT INTO attribute_schemas (game_id, name, display_name, type, possible_values, comparison_type, order_index, is_required, is_visible)
VALUES
    (game_uuid, 'gender', 'Genero', 'select', '["Masculino", "Femenino"]', 'exact', 0, true, true),
    (game_uuid, 'affiliation', 'Afiliacion', 'select', '["Sombrero de Paja", "Marines", "Shichibukai", "Yonko", "Revolucionarios", "Baroque Works", "CP9", "Otro"]', 'exact', 1, true, true),
    (game_uuid, 'devil_fruit', 'Fruta', 'select', '["Paramecia", "Zoan", "Logia", "Ninguna"]', 'exact', 2, true, true),
    (game_uuid, 'origin', 'Origen', 'select', '["East Blue", "West Blue", "North Blue", "South Blue", "Grand Line", "Nuevo Mundo", "Desconocido"]', 'exact', 3, true, true),
    (game_uuid, 'bounty', 'Recompensa', 'number', NULL, 'range', 4, true, true);

-- Eliminar personajes anteriores si existen
DELETE FROM characters WHERE game_id = game_uuid;

-- Crear personajes (recompensas en millones de berries)
INSERT INTO characters (game_id, name, attributes, is_active, is_daily_candidate)
VALUES
    -- Tripulacion Sombrero de Paja
    (game_uuid, 'Monkey D. Luffy', '{"gender": "Masculino", "affiliation": "Sombrero de Paja", "devil_fruit": "Paramecia", "origin": "East Blue", "bounty": 3000}', true, true),
    (game_uuid, 'Roronoa Zoro', '{"gender": "Masculino", "affiliation": "Sombrero de Paja", "devil_fruit": "Ninguna", "origin": "East Blue", "bounty": 1111}', true, true),
    (game_uuid, 'Nami', '{"gender": "Femenino", "affiliation": "Sombrero de Paja", "devil_fruit": "Ninguna", "origin": "East Blue", "bounty": 366}', true, true),
    (game_uuid, 'Usopp', '{"gender": "Masculino", "affiliation": "Sombrero de Paja", "devil_fruit": "Ninguna", "origin": "East Blue", "bounty": 500}', true, true),
    (game_uuid, 'Sanji', '{"gender": "Masculino", "affiliation": "Sombrero de Paja", "devil_fruit": "Ninguna", "origin": "North Blue", "bounty": 1032}', true, true),
    (game_uuid, 'Tony Tony Chopper', '{"gender": "Masculino", "affiliation": "Sombrero de Paja", "devil_fruit": "Zoan", "origin": "Grand Line", "bounty": 1000}', true, true),
    (game_uuid, 'Nico Robin', '{"gender": "Femenino", "affiliation": "Sombrero de Paja", "devil_fruit": "Paramecia", "origin": "West Blue", "bounty": 930}', true, true),
    (game_uuid, 'Franky', '{"gender": "Masculino", "affiliation": "Sombrero de Paja", "devil_fruit": "Ninguna", "origin": "South Blue", "bounty": 394}', true, true),
    (game_uuid, 'Brook', '{"gender": "Masculino", "affiliation": "Sombrero de Paja", "devil_fruit": "Paramecia", "origin": "West Blue", "bounty": 383}', true, true),
    (game_uuid, 'Jinbe', '{"gender": "Masculino", "affiliation": "Sombrero de Paja", "devil_fruit": "Ninguna", "origin": "Grand Line", "bounty": 1100}', true, true),

    -- Yonko y aliados
    (game_uuid, 'Shanks', '{"gender": "Masculino", "affiliation": "Yonko", "devil_fruit": "Ninguna", "origin": "West Blue", "bounty": 4048}', true, true),
    (game_uuid, 'Barbanegra', '{"gender": "Masculino", "affiliation": "Yonko", "devil_fruit": "Logia", "origin": "Desconocido", "bounty": 3996}', true, true),
    (game_uuid, 'Kaido', '{"gender": "Masculino", "affiliation": "Yonko", "devil_fruit": "Zoan", "origin": "Grand Line", "bounty": 4611}', true, true),
    (game_uuid, 'Big Mom', '{"gender": "Femenino", "affiliation": "Yonko", "devil_fruit": "Paramecia", "origin": "Grand Line", "bounty": 4388}', true, true),

    -- Marines
    (game_uuid, 'Akainu', '{"gender": "Masculino", "affiliation": "Marines", "devil_fruit": "Logia", "origin": "Desconocido", "bounty": 0}', true, true),
    (game_uuid, 'Aokiji', '{"gender": "Masculino", "affiliation": "Marines", "devil_fruit": "Logia", "origin": "Desconocido", "bounty": 0}', true, true),
    (game_uuid, 'Kizaru', '{"gender": "Masculino", "affiliation": "Marines", "devil_fruit": "Logia", "origin": "Desconocido", "bounty": 0}', true, true),
    (game_uuid, 'Garp', '{"gender": "Masculino", "affiliation": "Marines", "devil_fruit": "Ninguna", "origin": "East Blue", "bounty": 0}', true, true),

    -- Shichibukai
    (game_uuid, 'Dracule Mihawk', '{"gender": "Masculino", "affiliation": "Shichibukai", "devil_fruit": "Ninguna", "origin": "Desconocido", "bounty": 3590}', true, true),
    (game_uuid, 'Boa Hancock', '{"gender": "Femenino", "affiliation": "Shichibukai", "devil_fruit": "Paramecia", "origin": "Grand Line", "bounty": 1659}', true, true),
    (game_uuid, 'Crocodile', '{"gender": "Masculino", "affiliation": "Baroque Works", "devil_fruit": "Logia", "origin": "Desconocido", "bounty": 1965}', true, true),
    (game_uuid, 'Doflamingo', '{"gender": "Masculino", "affiliation": "Shichibukai", "devil_fruit": "Paramecia", "origin": "North Blue", "bounty": 340}', true, true),

    -- Revolucionarios
    (game_uuid, 'Monkey D. Dragon', '{"gender": "Masculino", "affiliation": "Revolucionarios", "devil_fruit": "Desconocido", "origin": "East Blue", "bounty": 0}', true, true),
    (game_uuid, 'Sabo', '{"gender": "Masculino", "affiliation": "Revolucionarios", "devil_fruit": "Logia", "origin": "East Blue", "bounty": 602}', true, true),

    -- Otros
    (game_uuid, 'Portgas D. Ace', '{"gender": "Masculino", "affiliation": "Yonko", "devil_fruit": "Logia", "origin": "South Blue", "bounty": 550}', true, true),
    (game_uuid, 'Trafalgar Law', '{"gender": "Masculino", "affiliation": "Shichibukai", "devil_fruit": "Paramecia", "origin": "North Blue", "bounty": 3000}', true, true);

END $$;

-- Agregar tags
INSERT INTO game_tags (game_id, tag_id)
SELECT 'b2c3d4e5-f6a7-8901-bcde-f23456789012', id FROM tags WHERE slug IN ('anime', 'comics')
ON CONFLICT DO NOTHING;

-- Verificar
SELECT 'Juego creado: ' || name as resultado FROM games WHERE slug = 'one-piece-quiz';
SELECT 'Personajes: ' || COUNT(*)::text FROM characters WHERE game_id = 'b2c3d4e5-f6a7-8901-bcde-f23456789012';

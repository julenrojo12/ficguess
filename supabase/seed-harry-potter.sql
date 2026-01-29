-- Seed data: Harry Potter Quiz
-- Ejecuta este script en Supabase SQL Editor

-- Permitir temporalmente creator_id NULL
ALTER TABLE games ALTER COLUMN creator_id DROP NOT NULL;

-- ID fijo para el juego
DO $$
DECLARE
    game_uuid UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN

-- Crear el juego
INSERT INTO games (id, creator_id, name, slug, description, universe, max_attempts, is_published, is_featured, play_count)
VALUES (
    game_uuid,
    NULL,
    'Harry Potter Quiz',
    'harry-potter-quiz',
    'Adivina personajes del mundo magico de Harry Potter',
    'Harry Potter',
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
    (game_uuid, 'house', 'Casa', 'select', '["Gryffindor", "Slytherin", "Hufflepuff", "Ravenclaw", "Ninguna"]', 'exact', 1, true, true),
    (game_uuid, 'blood_status', 'Sangre', 'select', '["Pura", "Mestiza", "Muggle"]', 'exact', 2, true, true),
    (game_uuid, 'role', 'Rol', 'select', '["Estudiante", "Profesor", "Mortifago", "Orden", "Otro"]', 'exact', 3, true, true),
    (game_uuid, 'first_year', 'Año', 'number', NULL, 'range', 4, true, true);

-- Eliminar personajes anteriores si existen
DELETE FROM characters WHERE game_id = game_uuid;

-- Crear personajes
INSERT INTO characters (game_id, name, attributes, is_active, is_daily_candidate)
VALUES
    (game_uuid, 'Harry Potter', '{"gender": "Masculino", "house": "Gryffindor", "blood_status": "Mestiza", "role": "Estudiante", "first_year": 1991}', true, true),
    (game_uuid, 'Hermione Granger', '{"gender": "Femenino", "house": "Gryffindor", "blood_status": "Muggle", "role": "Estudiante", "first_year": 1991}', true, true),
    (game_uuid, 'Ron Weasley', '{"gender": "Masculino", "house": "Gryffindor", "blood_status": "Pura", "role": "Estudiante", "first_year": 1991}', true, true),
    (game_uuid, 'Draco Malfoy', '{"gender": "Masculino", "house": "Slytherin", "blood_status": "Pura", "role": "Estudiante", "first_year": 1991}', true, true),
    (game_uuid, 'Voldemort', '{"gender": "Masculino", "house": "Slytherin", "blood_status": "Mestiza", "role": "Mortifago", "first_year": 1938}', true, true),
    (game_uuid, 'Bellatrix Lestrange', '{"gender": "Femenino", "house": "Slytherin", "blood_status": "Pura", "role": "Mortifago", "first_year": 1962}', true, true),
    (game_uuid, 'Severus Snape', '{"gender": "Masculino", "house": "Slytherin", "blood_status": "Mestiza", "role": "Profesor", "first_year": 1971}', true, true),
    (game_uuid, 'Albus Dumbledore', '{"gender": "Masculino", "house": "Gryffindor", "blood_status": "Mestiza", "role": "Profesor", "first_year": 1892}', true, true),
    (game_uuid, 'Minerva McGonagall', '{"gender": "Femenino", "house": "Gryffindor", "blood_status": "Mestiza", "role": "Profesor", "first_year": 1947}', true, true),
    (game_uuid, 'Rubeus Hagrid', '{"gender": "Masculino", "house": "Gryffindor", "blood_status": "Mestiza", "role": "Profesor", "first_year": 1940}', true, true),
    (game_uuid, 'Remus Lupin', '{"gender": "Masculino", "house": "Gryffindor", "blood_status": "Mestiza", "role": "Profesor", "first_year": 1971}', true, true),
    (game_uuid, 'Neville Longbottom', '{"gender": "Masculino", "house": "Gryffindor", "blood_status": "Pura", "role": "Estudiante", "first_year": 1991}', true, true),
    (game_uuid, 'Luna Lovegood', '{"gender": "Femenino", "house": "Ravenclaw", "blood_status": "Pura", "role": "Estudiante", "first_year": 1992}', true, true),
    (game_uuid, 'Ginny Weasley', '{"gender": "Femenino", "house": "Gryffindor", "blood_status": "Pura", "role": "Estudiante", "first_year": 1992}', true, true),
    (game_uuid, 'Cedric Diggory', '{"gender": "Masculino", "house": "Hufflepuff", "blood_status": "Pura", "role": "Estudiante", "first_year": 1989}', true, true),
    (game_uuid, 'Cho Chang', '{"gender": "Femenino", "house": "Ravenclaw", "blood_status": "Pura", "role": "Estudiante", "first_year": 1990}', true, true),
    (game_uuid, 'Sirius Black', '{"gender": "Masculino", "house": "Gryffindor", "blood_status": "Pura", "role": "Orden", "first_year": 1971}', true, true),
    (game_uuid, 'Nymphadora Tonks', '{"gender": "Femenino", "house": "Hufflepuff", "blood_status": "Mestiza", "role": "Orden", "first_year": 1984}', true, true),
    (game_uuid, 'Lucius Malfoy', '{"gender": "Masculino", "house": "Slytherin", "blood_status": "Pura", "role": "Mortifago", "first_year": 1965}', true, true),
    (game_uuid, 'Dobby', '{"gender": "Masculino", "house": "Ninguna", "blood_status": "Otra", "role": "Otro", "first_year": 1900}', true, true);

END $$;

-- Verificar
SELECT 'Juego creado: ' || name as resultado FROM games WHERE slug = 'harry-potter-quiz';
SELECT 'Personajes: ' || COUNT(*)::text FROM characters WHERE game_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

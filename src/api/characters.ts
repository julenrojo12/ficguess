import { supabase } from './supabase';
import type { Character, AttributeSchema, CharacterFormData } from '../types/game.types';

export async function getCharactersByGameId(gameId: string): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('game_id', gameId)
    .eq('is_active', true);

  if (error) throw error;

  return data || [];
}

export async function getAttributeSchemasByGameId(
  gameId: string
): Promise<AttributeSchema[]> {
  const { data, error } = await supabase
    .from('attribute_schemas')
    .select('*')
    .eq('game_id', gameId)
    .order('order_index');

  if (error) throw error;

  return data || [];
}

export async function createCharacter(
  gameId: string,
  characterData: CharacterFormData
): Promise<Character> {
  const { data, error } = await supabase
    .from('characters')
    .insert({
      game_id: gameId,
      name: characterData.name,
      image_url: characterData.image_url,
      description: characterData.description,
      attributes: characterData.attributes,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateCharacter(
  characterId: string,
  characterData: Partial<CharacterFormData>
): Promise<Character> {
  const { data, error } = await supabase
    .from('characters')
    .update({
      name: characterData.name,
      image_url: characterData.image_url,
      description: characterData.description,
      attributes: characterData.attributes,
    })
    .eq('id', characterId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteCharacter(characterId: string): Promise<void> {
  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', characterId);

  if (error) throw error;
}

export async function createAttributeSchema(
  gameId: string,
  schema: Omit<AttributeSchema, 'id' | 'game_id'>
): Promise<AttributeSchema> {
  const { data, error } = await supabase
    .from('attribute_schemas')
    .insert({
      game_id: gameId,
      ...schema,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateAttributeSchema(
  schemaId: string,
  schema: Partial<AttributeSchema>
): Promise<AttributeSchema> {
  const { data, error } = await supabase
    .from('attribute_schemas')
    .update(schema)
    .eq('id', schemaId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteAttributeSchema(schemaId: string): Promise<void> {
  const { error } = await supabase
    .from('attribute_schemas')
    .delete()
    .eq('id', schemaId);

  if (error) throw error;
}

export async function getRandomCharacter(gameId: string): Promise<Character | null> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('game_id', gameId)
    .eq('is_active', true)
    .eq('is_daily_candidate', true);

  if (error) throw error;

  if (!data || data.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

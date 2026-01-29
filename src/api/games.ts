import { supabase } from './supabase';
import type { Game, GameWithStats, GameFormData, Tag } from '../types/game.types';

// Obtener todos los tags
export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) throw error;

  return data || [];
}

export async function getGames(options?: {
  limit?: number;
  orderBy?: 'play_count' | 'created_at';
  tagSlugs?: string[];
  search?: string;
}): Promise<GameWithStats[]> {
  const hasTagFilter = options?.tagSlugs && options.tagSlugs.length > 0;

  // Si hay filtro por tags, necesitamos hacer inner join
  const selectQuery = hasTagFilter
    ? `
      *,
      creators (username, avatar_url),
      game_tags!inner (tags!inner (name, slug))
    `
    : `
      *,
      creators (username, avatar_url),
      game_tags (tags (name))
    `;

  let query = supabase
    .from('games')
    .select(selectQuery)
    .eq('is_published', true);

  // Filtrar por múltiples tag slugs usando in()
  if (hasTagFilter) {
    query = query.in('game_tags.tags.slug', options.tagSlugs!);
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Eliminar duplicados (un juego puede aparecer múltiples veces si tiene varios tags seleccionados)
  const uniqueGames = new Map<string, Record<string, unknown>>();
  for (const game of data || []) {
    if (!uniqueGames.has(game.id)) {
      uniqueGames.set(game.id, game);
    }
  }

  return Array.from(uniqueGames.values()).map(transformGameData);
}

export async function getGameBySlug(slug: string): Promise<GameWithStats | null> {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      creators (username, avatar_url),
      game_tags (tags (name))
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return transformGameData(data);
}

export async function getFeaturedGames(): Promise<GameWithStats[]> {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      creators (username, avatar_url),
      game_tags (tags (name))
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .limit(4);

  if (error) throw error;

  return (data || []).map(transformGameData);
}

export async function getMyGames(creatorId: string): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function createGame(
  creatorId: string,
  gameData: GameFormData
): Promise<Game> {
  const slug = generateSlug(gameData.name);

  const { data, error } = await supabase
    .from('games')
    .insert({
      creator_id: creatorId,
      name: gameData.name,
      slug,
      description: gameData.description,
      universe: gameData.universe,
      cover_image_url: gameData.cover_image_url,
      max_attempts: gameData.max_attempts,
      hints_enabled: gameData.hints_enabled,
      daily_mode_enabled: gameData.daily_mode_enabled,
    })
    .select()
    .single();

  if (error) throw error;

  // Add tags
  if (gameData.tag_ids.length > 0) {
    await supabase.from('game_tags').insert(
      gameData.tag_ids.map((tagId) => ({
        game_id: data.id,
        tag_id: tagId,
      }))
    );
  }

  return data;
}

export async function updateGame(
  gameId: string,
  gameData: Partial<GameFormData>
): Promise<Game> {
  const { data, error } = await supabase
    .from('games')
    .update({
      name: gameData.name,
      description: gameData.description,
      universe: gameData.universe,
      cover_image_url: gameData.cover_image_url,
      max_attempts: gameData.max_attempts,
      hints_enabled: gameData.hints_enabled,
      daily_mode_enabled: gameData.daily_mode_enabled,
    })
    .eq('id', gameId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function publishGame(gameId: string): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', gameId);

  if (error) throw error;
}

export async function deleteGame(gameId: string): Promise<void> {
  const { error } = await supabase.from('games').delete().eq('id', gameId);

  if (error) throw error;
}

// Helper functions
function transformGameData(data: Record<string, unknown>): GameWithStats {
  const creators = data.creators as { username: string; avatar_url: string } | null;
  const gameTags = data.game_tags as Array<{ tags: { name: string; slug?: string } }> | null;

  return {
    ...data,
    creator_username: creators?.username,
    creator_avatar: creators?.avatar_url,
    tag_names: gameTags?.map((gt) => gt.tags.name) || [],
    total_plays: (data.play_count as number) || 0,
    total_wins: (data.win_count as number) || 0,
    win_rate:
      (data.play_count as number) > 0
        ? Math.round(((data.win_count as number) / (data.play_count as number)) * 100)
        : 0,
    character_count: 0,
  } as GameWithStats;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .concat('-', Math.random().toString(36).substring(2, 8));
}

import type {
  AttributeSchema,
  MatchResult,
  AttributeComparison,
  Character,
} from '../types/game.types';

/**
 * Compara un atributo individual entre el intento y el objetivo
 */
export function compareAttribute(
  schema: AttributeSchema,
  guessedValue: unknown,
  targetValue: unknown
): MatchResult {
  switch (schema.type) {
    case 'text':
    case 'select':
    case 'boolean':
      return guessedValue === targetValue ? 'correct' : 'incorrect';

    case 'number':
    case 'year':
      if (guessedValue === targetValue) return 'correct';
      if (typeof guessedValue === 'number' && typeof targetValue === 'number') {
        return guessedValue > targetValue ? 'higher' : 'lower';
      }
      return 'incorrect';

    case 'multi':
      return compareMultiValue(
        guessedValue as string[],
        targetValue as string[]
      );

    default:
      return 'incorrect';
  }
}

/**
 * Compara valores de tipo multi (arrays)
 */
function compareMultiValue(guessed: string[], target: string[]): MatchResult {
  if (!Array.isArray(guessed) || !Array.isArray(target)) {
    return 'incorrect';
  }

  const guessedSet = new Set(guessed);
  const targetSet = new Set(target);

  // Coincidencia exacta
  if (
    guessedSet.size === targetSet.size &&
    [...guessedSet].every((v) => targetSet.has(v))
  ) {
    return 'correct';
  }

  // Coincidencia parcial (al menos un elemento en comun)
  const hasOverlap = [...guessedSet].some((v) => targetSet.has(v));
  return hasOverlap ? 'partial' : 'incorrect';
}

/**
 * Formatea el valor para mostrar al usuario
 */
function formatResultDisplay(
  schema: AttributeSchema,
  value: unknown,
  result: MatchResult
): string {
  if (schema.type === 'boolean') {
    return value ? 'Si' : 'No';
  }

  if (schema.type === 'multi' && Array.isArray(value)) {
    return value.join(', ');
  }

  if (
    (schema.type === 'number' || schema.type === 'year') &&
    (result === 'higher' || result === 'lower')
  ) {
    // higher significa que el valor adivinado es mayor que el objetivo
    // por lo que el objetivo esta "abajo" -> flecha hacia abajo
    const arrow = result === 'higher' ? '↓' : '↑';
    return `${value} ${arrow}`;
  }

  return String(value ?? '');
}

/**
 * Compara todos los atributos entre dos personajes
 */
export function compareCharacters(
  schemas: AttributeSchema[],
  guessedCharacter: Character,
  targetCharacter: Character
): AttributeComparison[] {
  return schemas
    .filter((schema) => schema.is_visible)
    .sort((a, b) => a.order_index - b.order_index)
    .map((schema) => {
      const guessedValue = guessedCharacter.attributes[schema.name];
      const targetValue = targetCharacter.attributes[schema.name];
      const result = compareAttribute(schema, guessedValue, targetValue);

      return {
        schema_id: schema.id,
        schema_name: schema.name,
        display_name: schema.display_name,
        guessed_value: guessedValue,
        target_value: targetValue,
        result,
        display_result: formatResultDisplay(schema, guessedValue, result),
      };
    });
}

/**
 * Verifica si un intento es correcto (todos los atributos coinciden)
 */
export function isCorrectGuess(comparisons: AttributeComparison[]): boolean {
  return comparisons.every((c) => c.result === 'correct');
}

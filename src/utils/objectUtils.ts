/**
 * Performs shallow equality comparison between two objects.
 * Returns true if both objects have the same keys with strictly equal values.
 * Optimized for filter state comparison where all values are primitives.
 *
 * @param objA - First object to compare
 * @param objB - Second object to compare
 * @returns true if objects are shallowly equal, false otherwise
 *
 * @example
 * const prev = { searchTerm: '', status: 'active' };
 * const curr = { searchTerm: 'john', status: 'active' };
 * shallowEqual(prev, curr); // false
 */
export function shallowEqual<T extends Record<string, unknown>>(
  objA: T | null | undefined,
  objB: T | null | undefined
): boolean {
  if (objA === objB) return true;
  if (objA == null || objB == null) return false;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
}

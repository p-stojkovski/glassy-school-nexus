/**
 * Cache Management Utility
 * Provides centralized cache invalidation and management for localStorage-based caching
 */

export type CacheEntity = 'teachers' | 'classrooms' | 'subjects';

// Storage keys mapping
const CACHE_KEYS: Record<CacheEntity, string> = {
  teachers: 'think-english-teachers',
  classrooms: 'think-english-classrooms',
  subjects: 'think-english-subjects',
};

/**
 * Clear cache for a specific entity type
 */
export function clearCache(entity: CacheEntity): void {
  try {
    const key = CACHE_KEYS[entity];
    localStorage.removeItem(key);
    console.log(`✅ Cache cleared for ${entity}`);
  } catch (error) {
    console.warn(`Failed to clear cache for ${entity}:`, error);
  }
}

/**
 * Clear cache for multiple entity types
 */
export function clearMultipleCaches(entities: CacheEntity[]): void {
  entities.forEach(entity => clearCache(entity));
}

/**
 * Clear all entity caches
 */
export function clearAllCaches(): void {
  Object.keys(CACHE_KEYS).forEach(entity => {
    clearCache(entity as CacheEntity);
  });
}

/**
 * Check if cache exists for an entity
 */
export function hasCache(entity: CacheEntity): boolean {
  try {
    const key = CACHE_KEYS[entity];
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.warn(`Failed to check cache for ${entity}:`, error);
    return false;
  }
}

/**
 * Get cache size information for debugging
 */
export function getCacheInfo(): Record<CacheEntity, { exists: boolean; size: number }> {
  const info = {} as Record<CacheEntity, { exists: boolean; size: number }>;
  
  Object.entries(CACHE_KEYS).forEach(([entity, key]) => {
    try {
      const data = localStorage.getItem(key);
      info[entity as CacheEntity] = {
        exists: data !== null,
        size: data ? data.length : 0,
      };
    } catch (error) {
      info[entity as CacheEntity] = { exists: false, size: 0 };
    }
  });
  
  return info;
}

/**
 * Cache invalidation manager with event-like capabilities
 */
export class CacheInvalidator {
  private static callbacks: Map<CacheEntity, Set<() => void>> = new Map();
  
  /**
   * Register a callback to be called when a specific cache is invalidated
   */
  static onCacheInvalidated(entity: CacheEntity, callback: () => void): () => void {
    if (!this.callbacks.has(entity)) {
      this.callbacks.set(entity, new Set());
    }
    
    this.callbacks.get(entity)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(entity);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }
  
  /**
   * Invalidate cache and notify all registered callbacks
   */
  static invalidateCache(entity: CacheEntity): void {
    clearCache(entity);
    
    const callbacks = this.callbacks.get(entity);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.warn(`Error in cache invalidation callback for ${entity}:`, error);
        }
      });
    }
  }
  
  /**
   * Clear all callbacks (useful for cleanup)
   */
  static clearCallbacks(): void {
    this.callbacks.clear();
  }
}


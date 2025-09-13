/**
 * Cache Test Utilities
 * Utility functions for testing and debugging cache functionality
 * Use only in development for debugging purposes
 */

import { getCacheInfo, clearCache, clearAllCaches, CacheEntity } from './cacheManager';

/**
 * Log current cache status for all entities
 */
export function logCacheStatus(): void {
  console.group('📦 Cache Status');
  const cacheInfo = getCacheInfo();
  
  Object.entries(cacheInfo).forEach(([entity, info]) => {
    const status = info.exists ? '✅' : '❌';
    const size = info.exists ? `${(info.size / 1024).toFixed(2)}KB` : '0KB';
    console.log(`${status} ${entity}: ${size}`);
  });
  
  console.groupEnd();
}

/**
 * Test cache invalidation by checking if cache is cleared
 */
export function testCacheInvalidation(entity: CacheEntity): boolean {
  const beforeInfo = getCacheInfo();
  const existedBefore = beforeInfo[entity].exists;
  
  clearCache(entity);
  
  const afterInfo = getCacheInfo();
  const existsAfter = afterInfo[entity].exists;
  
  console.log(`🧪 Cache test for ${entity}:`);
  console.log(`  Before: ${existedBefore ? 'Exists' : 'None'}`);
  console.log(`  After: ${existsAfter ? 'Exists' : 'Cleared'}`);
  
  // Test passes if cache existed before and doesn't exist after
  const testPassed = existedBefore && !existsAfter;
  console.log(`  Result: ${testPassed ? '✅ PASS' : '❌ FAIL'}`);
  
  return testPassed;
}

/**
 * Populate cache with test data for testing purposes
 */
export function populateTestCache(): void {
  console.log('🔄 Populating test cache data...');
  
  // Add test data to localStorage
  const testData = {
    teachers: [{ id: 'test-teacher', name: 'Test Teacher', email: 'test@example.com' }],
    classrooms: [{ id: 'test-classroom', name: 'Test Room', capacity: 20 }],
    subjects: [{ id: 'test-subject', name: 'Test Subject', sortOrder: 1 }],
  };
  
  Object.entries(testData).forEach(([entity, data]) => {
    const key = `think-english-${entity}`;
    localStorage.setItem(key, JSON.stringify(data));
  });
  
  logCacheStatus();
}

/**
 * Run a comprehensive cache test
 */
export function runCacheTests(): void {
  console.group('🧪 Running Cache Tests');
  
  // Clear all caches first
  clearAllCaches();
  
  // Populate test data
  populateTestCache();
  
  // Test individual cache invalidation
  const entities: CacheEntity[] = ['teachers', 'classrooms', 'subjects'];
  const results = entities.map(entity => ({
    entity,
    passed: testCacheInvalidation(entity)
  }));
  
  // Summary
  console.group('📊 Test Results');
  results.forEach(({ entity, passed }) => {
    console.log(`${entity}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  const allPassed = results.every(r => r.passed);
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.groupEnd();
  
  console.groupEnd();
  
  return allPassed;
}

// Export for console debugging (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).cacheTestUtils = {
    logCacheStatus,
    testCacheInvalidation,
    populateTestCache,
    runCacheTests,
    clearAllCaches,
  };
  
  console.log('🔧 Cache test utils available at window.cacheTestUtils');
}


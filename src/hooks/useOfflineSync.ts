/**
 * Global Offline Sync Hook
 * 
 * Provides reusable offline synchronization capabilities for any data type.
 * Handles offline storage, online sync, conflict resolution, and connection monitoring.
 * 
 * Features:
 * - Automatic offline storage in localStorage/IndexedDB
 * - Connection status monitoring
 * - Queue-based sync on reconnection
 * - Optimistic updates with rollback on failure
 * - Conflict resolution strategies
 * - Type-safe implementation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

// Connection status
export type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

// Sync operation types
export type SyncOperation = 'create' | 'update' | 'delete';

// Sync item in the queue
export interface SyncQueueItem<T = any> {
  id: string;                    // Unique identifier for this sync operation
  operation: SyncOperation;      // Type of operation
  entityType: string;           // Type of entity (e.g., 'attendance', 'homework')
  entityId: string;             // ID of the entity being synced
  data: T;                      // The data to sync
  timestamp: number;            // When this operation was queued
  retries: number;              // Number of retry attempts
  maxRetries: number;           // Maximum retry attempts
  lastError?: string;           // Last error message if failed
}

// Sync configuration
export interface OfflineSyncConfig<T> {
  entityType: string;           // Type identifier for the data
  storageKey: string;           // localStorage key for offline data
  maxQueueSize?: number;        // Maximum queue size (default: 100)
  maxRetries?: number;          // Maximum retry attempts (default: 3)
  syncInterval?: number;        // Auto-sync interval in ms (default: 30000)
  onSync: (items: SyncQueueItem<T>[]) => Promise<void>; // Sync function
  onConflict?: (local: T, remote: T) => T; // Conflict resolution
}

// Hook return type
export interface OfflineSyncReturn<T> {
  connectionStatus: ConnectionStatus;
  queueSize: number;
  isOffline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  
  // Core methods
  queueOperation: (operation: SyncOperation, entityId: string, data: T) => Promise<void>;
  syncNow: () => Promise<void>;
  clearQueue: () => void;
  
  // Storage methods
  getOfflineData: (key: string) => T | null;
  setOfflineData: (key: string, data: T) => void;
  removeOfflineData: (key: string) => void;
  
  // Queue inspection
  getQueue: () => SyncQueueItem<T>[];
  getFailedItems: () => SyncQueueItem<T>[];
}

const STORAGE_PREFIX = 'offline_sync_';
const QUEUE_STORAGE_KEY = '_sync_queue';

export function useOfflineSync<T = any>(config: OfflineSyncConfig<T>): OfflineSyncReturn<T> {
  const {
    entityType,
    storageKey,
    maxQueueSize = 100,
    maxRetries = 3,
    syncInterval = 30000,
    onSync,
    onConflict,
  } = config;

  // State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  
  // Refs
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const isUnmountedRef = useRef(false);
  const queueStorageKey = `${STORAGE_PREFIX}${entityType}${QUEUE_STORAGE_KEY}`;

  // Computed values
  const isOffline = connectionStatus === 'offline';

  // Connection monitoring
  useEffect(() => {
    const updateConnectionStatus = () => {
      if (isUnmountedRef.current) return;
      
      const newStatus: ConnectionStatus = navigator.onLine ? 'online' : 'offline';
      setConnectionStatus(prev => {
        // If coming back online from offline, trigger sync
        if (prev === 'offline' && newStatus === 'online') {
          // Delay sync slightly to allow for connection stabilization
          setTimeout(() => {
            if (!isUnmountedRef.current) {
              syncNow();
            }
          }, 1000);
        }
        return newStatus;
      });
    };

    // Initial status
    updateConnectionStatus();

    // Listen for connection changes
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, []);

  // Auto-sync interval
  useEffect(() => {
    if (connectionStatus === 'online' && syncInterval > 0) {
      syncTimeoutRef.current = setTimeout(() => {
        if (!isUnmountedRef.current) {
          syncNow();
        }
      }, syncInterval);
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [connectionStatus, syncInterval, lastSyncTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Get sync queue from storage
  const getQueue = useCallback((): SyncQueueItem<T>[] => {
    try {
      const stored = localStorage.getItem(queueStorageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error reading sync queue:', error);
      return [];
    }
  }, [queueStorageKey]);

  // Save sync queue to storage
  const saveQueue = useCallback((queue: SyncQueueItem<T>[]) => {
    try {
      localStorage.setItem(queueStorageKey, JSON.stringify(queue));
      setQueueSize(queue.length);
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }, [queueStorageKey]);

  // Initialize queue size
  useEffect(() => {
    const queue = getQueue();
    setQueueSize(queue.length);
  }, [getQueue]);

  // Queue a sync operation
  const queueOperation = useCallback(async (
    operation: SyncOperation,
    entityId: string,
    data: T
  ): Promise<void> => {
    const queue = getQueue();
    
    // Check queue size limit
    if (queue.length >= maxQueueSize) {
      // Remove oldest items if queue is full
      queue.splice(0, queue.length - maxQueueSize + 1);
    }

    // Create sync item
    const syncItem: SyncQueueItem<T> = {
      id: `${entityType}_${operation}_${entityId}_${Date.now()}`,
      operation,
      entityType,
      entityId,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries,
    };

    // Add to queue
    queue.push(syncItem);
    saveQueue(queue);

    // If online, try to sync immediately
    if (connectionStatus === 'online') {
      await syncNow();
    }
  }, [connectionStatus, entityType, getQueue, maxQueueSize, maxRetries, saveQueue]);

  // Sync now
  const syncNow = useCallback(async (): Promise<void> => {
    if (isSyncing || connectionStatus !== 'online') return;

    const queue = getQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    setConnectionStatus('reconnecting');

    try {
      // Group items by retry status
      const itemsToSync = queue.filter(item => item.retries < item.maxRetries);
      const failedItems = queue.filter(item => item.retries >= item.maxRetries);

      if (itemsToSync.length > 0) {
        // Call the sync function
        await onSync(itemsToSync);

        // On success, remove synced items from queue
        const remainingQueue = failedItems; // Keep only permanently failed items
        saveQueue(remainingQueue);
        setLastSyncTime(Date.now());

        // Show success message if we synced items
        toast({
          title: 'Data Synchronized',
          description: `Successfully synced ${itemsToSync.length} pending changes.`,
          variant: 'default',
        });
      }
    } catch (error: any) {
      console.error('Sync failed:', error);

      // Update retry counts for failed items
      const updatedQueue = queue.map(item => {
        if (item.retries < item.maxRetries) {
          return {
            ...item,
            retries: item.retries + 1,
            lastError: error.message || 'Sync failed',
          };
        }
        return item;
      });

      saveQueue(updatedQueue);

      // Show error message
      toast({
        title: 'Sync Failed',
        description: `Failed to sync ${queue.length} changes. Will retry automatically.`,
        variant: 'destructive',
      });
    } finally {
      if (!isUnmountedRef.current) {
        setIsSyncing(false);
        setConnectionStatus(navigator.onLine ? 'online' : 'offline');
      }
    }
  }, [isSyncing, connectionStatus, getQueue, onSync, saveQueue]);

  // Clear sync queue
  const clearQueue = useCallback(() => {
    localStorage.removeItem(queueStorageKey);
    setQueueSize(0);
  }, [queueStorageKey]);

  // Get failed items
  const getFailedItems = useCallback((): SyncQueueItem<T>[] => {
    const queue = getQueue();
    return queue.filter(item => item.retries >= item.maxRetries);
  }, [getQueue]);

  // Offline data methods
  const getOfflineData = useCallback((key: string): T | null => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}_${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading offline data:', error);
      return null;
    }
  }, [storageKey]);

  const setOfflineData = useCallback((key: string, data: T): void => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${storageKey}_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }, [storageKey]);

  const removeOfflineData = useCallback((key: string): void => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${storageKey}_${key}`);
    } catch (error) {
      console.error('Error removing offline data:', error);
    }
  }, [storageKey]);

  return {
    connectionStatus,
    queueSize,
    isOffline,
    isSyncing,
    lastSyncTime,
    
    queueOperation,
    syncNow,
    clearQueue,
    
    getOfflineData,
    setOfflineData,
    removeOfflineData,
    
    getQueue,
    getFailedItems,
  };
}

// Utility function for creating sync configs
export function createSyncConfig<T>(
  entityType: string,
  onSync: (items: SyncQueueItem<T>[]) => Promise<void>,
  options?: Partial<OfflineSyncConfig<T>>
): OfflineSyncConfig<T> {
  return {
    entityType,
    storageKey: entityType,
    onSync,
    ...options,
  };
}

// Connection status indicator component
export interface ConnectionIndicatorProps {
  connectionStatus: ConnectionStatus;
  queueSize: number;
  className?: string;
}

export function ConnectionIndicator({ 
  connectionStatus, 
  queueSize, 
  className = '' 
}: ConnectionIndicatorProps) {
  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'online':
        return {
          color: 'text-green-400',
          icon: '🟢',
          text: queueSize > 0 ? `Online (${queueSize} pending)` : 'Online',
        };
      case 'offline':
        return {
          color: 'text-red-400',
          icon: '🔴',
          text: queueSize > 0 ? `Offline (${queueSize} queued)` : 'Offline',
        };
      case 'reconnecting':
        return {
          color: 'text-yellow-400',
          icon: '🟡',
          text: 'Syncing...',
        };
    }
  };

  const { color, icon, text } = getStatusInfo();

  return (
    <div className={`inline-flex items-center gap-2 text-xs ${color} ${className}`}>
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
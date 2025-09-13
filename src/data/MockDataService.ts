/**
 * MockDataService - Centralized data management for demo mode
 *
 * This service provides a unified interface for loading, managing, and persisting
 * mock data across all domains. It handles localStorage integration and provides
 * methods for CRUD operations, demo reset functionality, and data validation.
 */

import { loadFromStorage, saveToStorage } from '@/lib/storage';

// Import JSON data
import studentsData from './mock/students.json';
import classroomsData from './mock/classrooms.json';
import classesData from './mock/classes.json';
import teachersData from './mock/teachers.json';
import financialData from './mock/financial-obligations.json';

// Import types
import type { Student } from '@/domains/students/studentsSlice';
import type { Classroom } from '@/domains/classrooms/classroomsSlice';
import type { Class } from '@/domains/classes/classesSlice';
import type { Teacher } from '@/domains/teachers/teachersSlice';
import type {
  PaymentObligation,
  Payment,
} from '@/domains/finance/financeSlice';

export interface MockDataState {
  students: Student[];
  classrooms: Classroom[];
  classes: Class[];
  teachers: Teacher[];
  obligations: PaymentObligation[];
  payments: Payment[];
  lastUpdated: string;
  version: string;
}

export interface DataLoadOptions {
  useCache?: boolean;
  validateData?: boolean;
  fallbackToDefault?: boolean;
}

export interface DataSaveOptions {
  updateTimestamp?: boolean;
  validateBeforeSave?: boolean;
}

export class MockDataService {
  private static instance: MockDataService;
  private dataCache: MockDataState | null = null;
  private readonly storageKeys = {
    students: 'students',
    classrooms: 'classrooms',
    classes: 'classes',
    teachers: 'teachers',
    obligations: 'paymentObligations',
    payments: 'payments',
    metadata: 'mockDataMetadata',
  };

  private constructor() {}

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  /**
   * Load all mock data from localStorage or fallback to JSON files
   */
  public async loadAllData(
    options: DataLoadOptions = {}
  ): Promise<MockDataState> {
    const {
      useCache = true,
      validateData = true,
      fallbackToDefault = true,
    } = options;

    // Return cached data if available and requested
    if (useCache && this.dataCache) {
      return this.dataCache;
    }

    try {
      // Try to load from localStorage first
      const storedData = await this.loadFromStorage();

      if (storedData && validateData) {
        const isValid = this.validateDataStructure(storedData);
        if (isValid) {
          this.dataCache = storedData;
          return storedData;
        }
      }

      if (storedData && !validateData) {
        this.dataCache = storedData;
        return storedData;
      }
    } catch (error) {
      console.warn('Failed to load data from localStorage:', error);
    }

    // Fallback to default JSON data
    if (fallbackToDefault) {
      const defaultData = this.getDefaultData();
      this.dataCache = defaultData;

      // Save default data to localStorage for future use
      await this.saveAllData(defaultData, { updateTimestamp: true });

      return defaultData;
    }

    throw new Error('Unable to load mock data');
  }

  /**
   * Load data from localStorage
   */
  private async loadFromStorage(): Promise<MockDataState | null> {
    try {
      const students =
        loadFromStorage<Student[]>(this.storageKeys.students) || [];
      const classrooms =
        loadFromStorage<Classroom[]>(this.storageKeys.classrooms) || [];
      const classes = loadFromStorage<Class[]>(this.storageKeys.classes) || [];
      const teachers =
        loadFromStorage<Teacher[]>(this.storageKeys.teachers) || [];
      const obligations =
        loadFromStorage<PaymentObligation[]>(this.storageKeys.obligations) ||
        [];
      const payments =
        loadFromStorage<Payment[]>(this.storageKeys.payments) || [];
      const metadata = loadFromStorage<{
        lastUpdated: string;
        version: string;
      }>(this.storageKeys.metadata);

      // Check if we have at least some data
      if (
        students.length === 0 &&
        classrooms.length === 0 &&
        classes.length === 0
      ) {
        return null;
      }

      return {
        students,
        classrooms,
        classes,
        teachers,
        obligations,
        payments,
        lastUpdated: metadata?.lastUpdated || new Date().toISOString(),
        version: metadata?.version || '1.0.0',
      };
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  /**
   * Get default data from JSON files
   */
  private getDefaultData(): MockDataState {
    return {
      students: studentsData.students as Student[],
      classrooms: classroomsData.classrooms as Classroom[],
      classes: classesData.classes as Class[],
      teachers: teachersData.teachers as Teacher[],
      obligations: financialData.obligations as PaymentObligation[],
      payments: financialData.payments as Payment[],
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * Save all data to localStorage
   */
  public async saveAllData(
    data: MockDataState,
    options: DataSaveOptions = {}
  ): Promise<void> {
    const { updateTimestamp = true, validateBeforeSave = true } = options;

    try {
      if (validateBeforeSave && !this.validateDataStructure(data)) {
        throw new Error('Data validation failed before save');
      }

      // Update timestamp if requested
      if (updateTimestamp) {
        data.lastUpdated = new Date().toISOString();
      }

      // Save each data type to its own storage key
      saveToStorage(this.storageKeys.students, data.students);
      saveToStorage(this.storageKeys.classrooms, data.classrooms);
      saveToStorage(this.storageKeys.classes, data.classes);
      saveToStorage(this.storageKeys.teachers, data.teachers);
      saveToStorage(this.storageKeys.obligations, data.obligations);
      saveToStorage(this.storageKeys.payments, data.payments);

      // Save metadata
      saveToStorage(this.storageKeys.metadata, {
        lastUpdated: data.lastUpdated,
        version: data.version,
      });

      // Update cache
      this.dataCache = { ...data };
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }

  /**
   * Reset all data to defaults
   */
  public async resetToDefaults(): Promise<MockDataState> {
    try {
      const defaultData = this.getDefaultData();
      await this.saveAllData(defaultData, { updateTimestamp: true });
      return defaultData;
    } catch (error) {
      console.error('Error resetting to defaults:', error);
      throw error;
    }
  }

  /**
   * Clear all data from localStorage
   */
  public async clearAllData(): Promise<void> {
    try {
      Object.values(this.storageKeys).forEach((key) => {
        localStorage.removeItem(key);
      });
      this.dataCache = null;
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Get specific data type
   */
  public async getData<T extends keyof MockDataState>(
    dataType: T,
    options: DataLoadOptions = {}
  ): Promise<MockDataState[T]> {
    const allData = await this.loadAllData(options);
    return allData[dataType];
  }

  /**
   * Update specific data type
   */
  public async updateData<T extends keyof MockDataState>(
    dataType: T,
    data: MockDataState[T],
    options: DataSaveOptions = {}
  ): Promise<void> {
    const currentData = await this.loadAllData();
    const updatedData = {
      ...currentData,
      [dataType]: data,
    };
    await this.saveAllData(updatedData, options);
  }

  /**
   * Validate data structure
   */
  private validateDataStructure(data: MockDataState): boolean {
    try {
      // Check required properties
      const requiredKeys: (keyof MockDataState)[] = [
        'students',
        'classrooms',
        'classes',
        'teachers',
        'obligations',
        'payments',
      ];

      for (const key of requiredKeys) {
        if (!Array.isArray(data[key])) {
          console.warn(`Invalid data structure: ${key} is not an array`);
          return false;
        }
      }

      // Validate students have required properties
      if (data.students.length > 0) {
        const student = data.students[0];
        if (!student.id || !student.name || !student.email) {
          console.warn('Invalid student data structure');
          return false;
        }
      }

      // Validate classrooms have required properties
      if (data.classrooms.length > 0) {
        const classroom = data.classrooms[0];
        if (
          !classroom.id ||
          !classroom.name ||
          typeof classroom.capacity !== 'number'
        ) {
          console.warn('Invalid classroom data structure');
          return false;
        }
      }

      // Validate classes have required properties
      if (data.classes.length > 0) {
        const classItem = data.classes[0];
        if (!classItem.id || !classItem.name || !classItem.teacher) {
          console.warn('Invalid class data structure');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.warn('Data validation error:', error);
      return false;
    }
  }

  /**
   * Get data statistics
   */
  public async getDataStats(): Promise<{
    students: number;
    classrooms: number;
    classes: number;
    teachers: number;
    obligations: number;
    payments: number;
    lastUpdated: string;
    cacheStatus: 'cached' | 'not_cached';
    storageSize: number;
  }> {
    const data = await this.loadAllData();

    // Calculate approximate storage size
    const dataString = JSON.stringify(data);
    const storageSize = new Blob([dataString]).size;

    return {
      students: data.students.length,
      classrooms: data.classrooms.length,
      classes: data.classes.length,
      teachers: data.teachers.length,
      obligations: data.obligations.length,
      payments: data.payments.length,
      lastUpdated: data.lastUpdated,
      cacheStatus: this.dataCache ? 'cached' : 'not_cached',
      storageSize,
    };
  }

  /**
   * Export data for backup
   */
  public async exportData(): Promise<string> {
    const data = await this.loadAllData();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from backup
   */
  public async importData(
    jsonString: string,
    validateBeforeImport = true
  ): Promise<void> {
    try {
      const data = JSON.parse(jsonString) as MockDataState;

      if (validateBeforeImport && !this.validateDataStructure(data)) {
        throw new Error('Invalid data structure in import');
      }

      await this.saveAllData(data, { updateTimestamp: true });
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data: ' + (error as Error).message);
    }
  }

  /**
   * Check if localStorage is available and functional
   */
  public isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load specific domain data with caching support
   */
  public async loadDomainData<T extends keyof MockDataState>(
    domain: T,
    options: DataLoadOptions = {}
  ): Promise<MockDataState[T]> {
    const { useCache = true, fallbackToDefault = true } = options;

    // Return cached data if available and requested
    if (useCache && this.dataCache) {
      return this.dataCache[domain];
    }

    try {
      // Try to load specific domain from localStorage
      const domainData = await this.loadDomainFromStorage(domain);

      if (domainData !== null) {
        // If we don't have cached data, create partial cache for this domain
        if (!this.dataCache) {
          this.dataCache = this.createEmptyDataState();
        }
        this.dataCache[domain] = domainData;
        return domainData;
      }
    } catch (error) {
      console.warn(`Failed to load ${domain} from localStorage:`, error);
    }

    // Fallback to default data
    if (fallbackToDefault) {
      const defaultData = this.getDefaultDomainData(domain);

      // Initialize cache if needed
      if (!this.dataCache) {
        this.dataCache = this.createEmptyDataState();
      }
      this.dataCache[domain] = defaultData;

      // Save to localStorage for future use
      await this.saveDomainData(domain, defaultData);

      return defaultData;
    }

    throw new Error(`Unable to load ${domain} data`);
  }
  /**
   * Load specific domain from localStorage
   */
  private async loadDomainFromStorage<T extends keyof MockDataState>(
    domain: T
  ): Promise<MockDataState[T] | null> {
    try {
      const storageKey = this.getDomainStorageKey(domain);

      // Check if the key exists in localStorage
      const rawData = localStorage.getItem(storageKey);
      if (rawData === null) {
        // Key doesn't exist - no data has been saved yet
        return null;
      }

      // Parse the data - this includes empty arrays which are valid user state
      const data = JSON.parse(rawData) as MockDataState[T];
      return data;
    } catch (error) {
      console.error(`Error loading ${domain} from localStorage:`, error);
      return null;
    }
  }

  /**
   * Get default data for specific domain
   */
  private getDefaultDomainData<T extends keyof MockDataState>(
    domain: T
  ): MockDataState[T] {
    const defaultData = this.getDefaultData();
    return defaultData[domain];
  }

  /**
   * Save specific domain data to localStorage
   */
  public async saveDomainData<T extends keyof MockDataState>(
    domain: T,
    data: MockDataState[T],
    options: DataSaveOptions = {}
  ): Promise<void> {
    const { updateTimestamp = true } = options;
    try {
      const storageKey = this.getDomainStorageKey(domain);
      saveToStorage(storageKey, data);

      // Update cache with serialized data to avoid proxy issues
      if (!this.dataCache) {
        this.dataCache = this.createEmptyDataState();
      }
      // Serialize and parse to remove any proxy wrapping
      this.dataCache[domain] = JSON.parse(JSON.stringify(data));

      // Update metadata if requested
      if (updateTimestamp) {
        const metadata = {
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
        };
        saveToStorage(this.storageKeys.metadata, metadata);
        this.dataCache.lastUpdated = metadata.lastUpdated;
      }
    } catch (error) {
      console.error(`Error saving ${domain} to localStorage:`, error);
      throw error;
    }
  }

  /**
   * Get storage key for specific domain
   */
  private getDomainStorageKey<T extends keyof MockDataState>(
    domain: T
  ): string {
    const keyMap: Record<keyof MockDataState, string> = {
      students: this.storageKeys.students,
      classrooms: this.storageKeys.classrooms,
      classes: this.storageKeys.classes,
      teachers: this.storageKeys.teachers,
      obligations: this.storageKeys.obligations,
      payments: this.storageKeys.payments,
      lastUpdated: this.storageKeys.metadata,
      version: this.storageKeys.metadata,
    };

    return keyMap[domain] || domain.toString();
  }

  /**
   * Create empty data state structure
   */
  private createEmptyDataState(): MockDataState {
    return {
      students: [],
      classrooms: [],
      classes: [],
      teachers: [],
      obligations: [],
      payments: [],
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
    };
  }
  /**
   * Check if domain data is loaded in cache
   */
  public isDomainLoaded<T extends keyof MockDataState>(domain: T): boolean {
    if (!this.dataCache) return false;

    const data = this.dataCache[domain];

    // Safely check if data is an array (handle proxy issues)
    try {
      if (Array.isArray(data)) {
        return data.length > 0;
      }
    } catch (error) {
      // If Array.isArray fails (e.g., revoked proxy), treat as not loaded
      console.warn(
        `Unable to check array status for domain ${String(domain)}:`,
        error
      );
      return false;
    }

    return data !== undefined && data !== null;
  }

  /**
   * Preload specific domains (useful for related data)
   */
  public async preloadDomains(
    domains: (keyof MockDataState)[],
    options: DataLoadOptions = {}
  ): Promise<void> {
    const loadPromises = domains.map((domain) =>
      this.loadDomainData(domain, options)
    );

    await Promise.all(loadPromises);
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();


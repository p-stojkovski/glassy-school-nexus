export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage`, error);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage`, error);
    return null;
  }
}


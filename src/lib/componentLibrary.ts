import { ReactComponent, ComponentLibrary } from '@/types/react-components';

/**
 * Component Library Management Service
 * Handles CRUD operations for component libraries with proper separation of concerns
 */

// Storage abstraction layer
interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

// Local storage adapter implementation
class LocalStorageAdapter implements StorageAdapter {
  async get(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage set error:', error);
      throw new Error('Failed to save to storage');
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
      throw new Error('Failed to remove from storage');
    }
  }

  async list(prefix: string): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('Storage list error:', error);
      return [];
    }
  }
}

// Storage keys constants
const STORAGE_KEYS = {
  COMPONENTS: 'creaticon_components',
  LIBRARIES: 'creaticon_libraries',
  PRESETS: 'creaticon_presets',
  SETTINGS: 'creaticon_settings'
} as const;

/**
 * Component Library Service
 * Business logic layer for component management
 */
export class ComponentLibraryService {
  private storage: StorageAdapter;

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  // Component CRUD operations
  async saveComponent(component: ReactComponent): Promise<void> {
    try {
      const componentsKey = `${STORAGE_KEYS.COMPONENTS}_${component.id}`;
      await this.storage.set(componentsKey, JSON.stringify(component));
      
      // Update component index
      await this.updateComponentIndex(component);
    } catch (error) {
      throw new Error(`Failed to save component: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getComponent(id: string): Promise<ReactComponent | null> {
    try {
      const componentsKey = `${STORAGE_KEYS.COMPONENTS}_${id}`;
      const data = await this.storage.get(componentsKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get component:', error);
      return null;
    }
  }

  async getAllComponents(): Promise<ReactComponent[]> {
    try {
      const keys = await this.storage.list(STORAGE_KEYS.COMPONENTS);
      const components: ReactComponent[] = [];
      
      for (const key of keys) {
        const data = await this.storage.get(key);
        if (data) {
          try {
            const component = JSON.parse(data);
            components.push(component);
          } catch (parseError) {
            console.error(`Failed to parse component ${key}:`, parseError);
          }
        }
      }
      
      // Sort by creation date (newest first)
      return components.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get all components:', error);
      return [];
    }
  }

  async deleteComponent(id: string): Promise<void> {
    try {
      const componentsKey = `${STORAGE_KEYS.COMPONENTS}_${id}`;
      await this.storage.remove(componentsKey);
      
      // Update component index
      await this.removeFromComponentIndex(id);
    } catch (error) {
      throw new Error(`Failed to delete component: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateComponent(component: ReactComponent): Promise<void> {
    component.updatedAt = new Date().toISOString();
    await this.saveComponent(component);
  }

  // Library CRUD operations
  async createLibrary(library: Omit<ComponentLibrary, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComponentLibrary> {
    const newLibrary: ComponentLibrary = {
      ...library,
      id: generateId('lib'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const libraryKey = `${STORAGE_KEYS.LIBRARIES}_${newLibrary.id}`;
      await this.storage.set(libraryKey, JSON.stringify(newLibrary));
      return newLibrary;
    } catch (error) {
      throw new Error(`Failed to create library: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLibrary(id: string): Promise<ComponentLibrary | null> {
    try {
      const libraryKey = `${STORAGE_KEYS.LIBRARIES}_${id}`;
      const data = await this.storage.get(libraryKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get library:', error);
      return null;
    }
  }

  async getAllLibraries(): Promise<ComponentLibrary[]> {
    try {
      const keys = await this.storage.list(STORAGE_KEYS.LIBRARIES);
      const libraries: ComponentLibrary[] = [];
      
      for (const key of keys) {
        const data = await this.storage.get(key);
        if (data) {
          try {
            const library = JSON.parse(data);
            libraries.push(library);
          } catch (parseError) {
            console.error(`Failed to parse library ${key}:`, parseError);
          }
        }
      }
      
      return libraries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get all libraries:', error);
      return [];
    }
  }

  async updateLibrary(library: ComponentLibrary): Promise<void> {
    library.updatedAt = new Date().toISOString();
    
    try {
      const libraryKey = `${STORAGE_KEYS.LIBRARIES}_${library.id}`;
      await this.storage.set(libraryKey, JSON.stringify(library));
    } catch (error) {
      throw new Error(`Failed to update library: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteLibrary(id: string): Promise<void> {
    try {
      const libraryKey = `${STORAGE_KEYS.LIBRARIES}_${id}`;
      await this.storage.remove(libraryKey);
    } catch (error) {
      throw new Error(`Failed to delete library: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Component search and filtering
  async searchComponents(query: string): Promise<ReactComponent[]> {
    const components = await this.getAllComponents();
    const lowerQuery = query.toLowerCase();
    
    return components.filter(component => 
      component.name.toLowerCase().includes(lowerQuery) ||
      component.displayName.toLowerCase().includes(lowerQuery) ||
      component.description.toLowerCase().includes(lowerQuery) ||
      component.category.toLowerCase().includes(lowerQuery)
    );
  }

  async getComponentsByCategory(category: string): Promise<ReactComponent[]> {
    const components = await this.getAllComponents();
    return components.filter(component => component.category === category);
  }

  async getComponentsByFramework(framework: string): Promise<ReactComponent[]> {
    const components = await this.getAllComponents();
    return components.filter(component => component.framework === framework);
  }

  // Component statistics
  async getLibraryStats(): Promise<{
    totalComponents: number;
    totalLibraries: number;
    componentsByCategory: Record<string, number>;
    componentsByFramework: Record<string, number>;
    recentActivity: Array<{ type: 'created' | 'updated'; component: ReactComponent; timestamp: string }>;
  }> {
    const components = await this.getAllComponents();
    const libraries = await this.getAllLibraries();

    const componentsByCategory: Record<string, number> = {};
    const componentsByFramework: Record<string, number> = {};

    components.forEach(component => {
      componentsByCategory[component.category] = (componentsByCategory[component.category] || 0) + 1;
      componentsByFramework[component.framework] = (componentsByFramework[component.framework] || 0) + 1;
    });

    // Get recent activity (last 10 components)
    const recentActivity = components
      .slice(0, 10)
      .map(component => ({
        type: 'created' as const,
        component,
        timestamp: component.createdAt
      }));

    return {
      totalComponents: components.length,
      totalLibraries: libraries.length,
      componentsByCategory,
      componentsByFramework,
      recentActivity
    };
  }

  // Private helper methods
  private async updateComponentIndex(component: ReactComponent): Promise<void> {
    try {
      const indexKey = `${STORAGE_KEYS.COMPONENTS}_index`;
      const indexData = await this.storage.get(indexKey);
      const index = indexData ? JSON.parse(indexData) : [];
      
      // Add or update component in index
      const existingIndex = index.findIndex((item: any) => item.id === component.id);
      const indexItem = {
        id: component.id,
        name: component.name,
        category: component.category,
        framework: component.framework,
        createdAt: component.createdAt,
        updatedAt: component.updatedAt
      };

      if (existingIndex >= 0) {
        index[existingIndex] = indexItem;
      } else {
        index.push(indexItem);
      }

      await this.storage.set(indexKey, JSON.stringify(index));
    } catch (error) {
      console.error('Failed to update component index:', error);
    }
  }

  private async removeFromComponentIndex(id: string): Promise<void> {
    try {
      const indexKey = `${STORAGE_KEYS.COMPONENTS}_index`;
      const indexData = await this.storage.get(indexKey);
      const index = indexData ? JSON.parse(indexData) : [];
      
      const filteredIndex = index.filter((item: any) => item.id !== id);
      await this.storage.set(indexKey, JSON.stringify(filteredIndex));
    } catch (error) {
      console.error('Failed to remove from component index:', error);
    }
  }
}

// Utility functions
function generateId(prefix: string = 'comp'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export singleton instance
export const componentLibraryService = new ComponentLibraryService();

// Export utility functions
export { generateId };

// Export types for external use
export type { StorageAdapter };

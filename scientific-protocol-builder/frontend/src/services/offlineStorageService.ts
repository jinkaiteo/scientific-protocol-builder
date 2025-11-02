/**
 * Offline Storage Service using IndexedDB for PWA functionality
 * Provides persistent storage for protocols, analysis data, and app state
 */

interface ProtocolData {
  id: string;
  name: string;
  content: any;
  lastModified: Date;
  version: number;
  owner: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  analysis?: any;
}

interface AnalysisData {
  id: string;
  protocolId: string;
  results: any;
  timestamp: Date;
  version: number;
}

interface InstrumentData {
  id: string;
  name: string;
  category: string;
  status: string;
  lastUpdated: Date;
}

interface SyncQueueItem {
  id: string;
  type: 'protocol' | 'analysis' | 'instrument';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  retryCount: number;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  autoSync: boolean;
  offlineMode: boolean;
  notifications: boolean;
  analysisLevel: 'basic' | 'comprehensive';
  cacheSize: number;
}

class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private dbName = 'ProtocolBuilderDB';
  private dbVersion = 1;
  private isInitialized = false;

  private stores = {
    protocols: 'protocols',
    analysis: 'analysis',
    instruments: 'instruments',
    syncQueue: 'syncQueue',
    preferences: 'preferences',
    cache: 'cache'
  };

  /**
   * Initialize IndexedDB
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  /**
   * Create object stores for different data types
   */
  private createObjectStores(db: IDBDatabase): void {
    // Protocols store
    if (!db.objectStoreNames.contains(this.stores.protocols)) {
      const protocolStore = db.createObjectStore(this.stores.protocols, { keyPath: 'id' });
      protocolStore.createIndex('owner', 'owner', { unique: false });
      protocolStore.createIndex('lastModified', 'lastModified', { unique: false });
      protocolStore.createIndex('syncStatus', 'syncStatus', { unique: false });
    }

    // Analysis store
    if (!db.objectStoreNames.contains(this.stores.analysis)) {
      const analysisStore = db.createObjectStore(this.stores.analysis, { keyPath: 'id' });
      analysisStore.createIndex('protocolId', 'protocolId', { unique: false });
      analysisStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // Instruments store
    if (!db.objectStoreNames.contains(this.stores.instruments)) {
      const instrumentStore = db.createObjectStore(this.stores.instruments, { keyPath: 'id' });
      instrumentStore.createIndex('category', 'category', { unique: false });
      instrumentStore.createIndex('status', 'status', { unique: false });
      instrumentStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
    }

    // Sync queue store
    if (!db.objectStoreNames.contains(this.stores.syncQueue)) {
      const syncStore = db.createObjectStore(this.stores.syncQueue, { keyPath: 'id' });
      syncStore.createIndex('type', 'type', { unique: false });
      syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      syncStore.createIndex('retryCount', 'retryCount', { unique: false });
    }

    // Preferences store
    if (!db.objectStoreNames.contains(this.stores.preferences)) {
      db.createObjectStore(this.stores.preferences, { keyPath: 'key' });
    }

    // Cache store for API responses
    if (!db.objectStoreNames.contains(this.stores.cache)) {
      const cacheStore = db.createObjectStore(this.stores.cache, { keyPath: 'key' });
      cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
      cacheStore.createIndex('expiry', 'expiry', { unique: false });
    }

    console.log('Object stores created successfully');
  }

  /**
   * Protocol storage methods
   */

  async saveProtocol(protocol: ProtocolData): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.protocols], 'readwrite');
      const store = transaction.objectStore(this.stores.protocols);
      
      const protocolToSave = {
        ...protocol,
        lastModified: new Date(),
        syncStatus: protocol.syncStatus || 'pending'
      };

      const request = store.put(protocolToSave);

      request.onsuccess = () => {
        console.log('Protocol saved offline:', protocol.id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save protocol:', request.error);
        reject(request.error);
      };
    });
  }

  async getProtocol(id: string): Promise<ProtocolData | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.protocols], 'readonly');
      const store = transaction.objectStore(this.stores.protocols);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Failed to get protocol:', request.error);
        reject(request.error);
      };
    });
  }

  async getAllProtocols(owner?: string): Promise<ProtocolData[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.protocols], 'readonly');
      const store = transaction.objectStore(this.stores.protocols);
      
      let request: IDBRequest;
      if (owner) {
        const index = store.index('owner');
        request = index.getAll(owner);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const protocols = request.result.sort((a: ProtocolData, b: ProtocolData) => 
          new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        );
        resolve(protocols);
      };

      request.onerror = () => {
        console.error('Failed to get protocols:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteProtocol(id: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.protocols], 'readwrite');
      const store = transaction.objectStore(this.stores.protocols);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Protocol deleted offline:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete protocol:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Analysis storage methods
   */

  async saveAnalysis(analysis: AnalysisData): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.analysis], 'readwrite');
      const store = transaction.objectStore(this.stores.analysis);
      
      const analysisToSave = {
        ...analysis,
        timestamp: new Date()
      };

      const request = store.put(analysisToSave);

      request.onsuccess = () => {
        console.log('Analysis saved offline:', analysis.id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save analysis:', request.error);
        reject(request.error);
      };
    });
  }

  async getAnalysis(protocolId: string): Promise<AnalysisData[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.analysis], 'readonly');
      const store = transaction.objectStore(this.stores.analysis);
      const index = store.index('protocolId');
      const request = index.getAll(protocolId);

      request.onsuccess = () => {
        const analyses = request.result.sort((a: AnalysisData, b: AnalysisData) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(analyses);
      };

      request.onerror = () => {
        console.error('Failed to get analysis:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Instruments storage methods
   */

  async saveInstruments(instruments: InstrumentData[]): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.instruments], 'readwrite');
      const store = transaction.objectStore(this.stores.instruments);
      
      const promises = instruments.map(instrument => {
        const instrumentToSave = {
          ...instrument,
          lastUpdated: new Date()
        };
        return store.put(instrumentToSave);
      });

      transaction.oncomplete = () => {
        console.log('Instruments saved offline:', instruments.length);
        resolve();
      };

      transaction.onerror = () => {
        console.error('Failed to save instruments:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  async getInstruments(category?: string): Promise<InstrumentData[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.instruments], 'readonly');
      const store = transaction.objectStore(this.stores.instruments);
      
      let request: IDBRequest;
      if (category) {
        const index = store.index('category');
        request = index.getAll(category);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get instruments:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Sync queue methods
   */

  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    await this.ensureInitialized();

    const syncItem: SyncQueueItem = {
      ...item,
      id: `${item.type}_${item.action}_${Date.now()}`,
      timestamp: new Date(),
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.stores.syncQueue);
      const request = store.add(syncItem);

      request.onsuccess = () => {
        console.log('Added to sync queue:', syncItem.id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to add to sync queue:', request.error);
        reject(request.error);
      };
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readonly');
      const store = transaction.objectStore(this.stores.syncQueue);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result.sort((a: SyncQueueItem, b: SyncQueueItem) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        resolve(items);
      };

      request.onerror = () => {
        console.error('Failed to get sync queue:', request.error);
        reject(request.error);
      };
    });
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.stores.syncQueue);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Removed from sync queue:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to remove from sync queue:', request.error);
        reject(request.error);
      };
    });
  }

  async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.stores.syncQueue);
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          const updatedItem = { ...item, ...updates };
          const putRequest = store.put(updatedItem);
          
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Sync queue item not found'));
        }
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  /**
   * User preferences methods
   */

  async savePreferences(preferences: UserPreferences): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.preferences], 'readwrite');
      const store = transaction.objectStore(this.stores.preferences);
      const request = store.put({ key: 'userPreferences', value: preferences });

      request.onsuccess = () => {
        console.log('User preferences saved');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save preferences:', request.error);
        reject(request.error);
      };
    });
  }

  async getPreferences(): Promise<UserPreferences> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.preferences], 'readonly');
      const store = transaction.objectStore(this.stores.preferences);
      const request = store.get('userPreferences');

      request.onsuccess = () => {
        const defaultPreferences: UserPreferences = {
          theme: 'auto',
          autoSync: true,
          offlineMode: false,
          notifications: true,
          analysisLevel: 'basic',
          cacheSize: 50
        };

        resolve(request.result?.value || defaultPreferences);
      };

      request.onerror = () => {
        console.error('Failed to get preferences:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Cache methods for API responses
   */

  async setCacheItem(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
    await this.ensureInitialized();

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + ttlMinutes);

    const cacheItem = {
      key,
      data,
      timestamp: new Date(),
      expiry,
      ttl: ttlMinutes
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.cache], 'readwrite');
      const store = transaction.objectStore(this.stores.cache);
      const request = store.put(cacheItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCacheItem(key: string): Promise<any> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.cache], 'readonly');
      const store = transaction.objectStore(this.stores.cache);
      const request = store.get(key);

      request.onsuccess = () => {
        const item = request.result;
        if (item && new Date() < new Date(item.expiry)) {
          resolve(item.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async clearExpiredCache(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.cache], 'readwrite');
      const store = transaction.objectStore(this.stores.cache);
      const index = store.index('expiry');
      const now = new Date();
      
      const request = index.openCursor(IDBKeyRange.upperBound(now));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          console.log('Expired cache items cleared');
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Database utility methods
   */

  async getStorageSize(): Promise<{ protocols: number; analysis: number; instruments: number; total: number }> {
    await this.ensureInitialized();

    const protocols = await this.getAllProtocols();
    const analysis = await this.getAnalysis('all');
    const instruments = await this.getInstruments();

    return {
      protocols: protocols.length,
      analysis: analysis.length,
      instruments: instruments.length,
      total: protocols.length + analysis.length + instruments.length
    };
  }

  async clearAllData(): Promise<void> {
    await this.ensureInitialized();

    const storeNames = Object.values(this.stores);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, 'readwrite');
      
      storeNames.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        store.clear();
      });

      transaction.oncomplete = () => {
        console.log('All offline data cleared');
        resolve();
      };

      transaction.onerror = () => {
        console.error('Failed to clear data:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  async exportData(): Promise<string> {
    await this.ensureInitialized();

    const [protocols, instruments, preferences] = await Promise.all([
      this.getAllProtocols(),
      this.getInstruments(),
      this.getPreferences()
    ]);

    const exportData = {
      protocols,
      instruments,
      preferences,
      exportDate: new Date(),
      version: this.dbVersion
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    await this.ensureInitialized();

    try {
      const data = JSON.parse(jsonData);
      
      if (data.protocols) {
        for (const protocol of data.protocols) {
          await this.saveProtocol(protocol);
        }
      }

      if (data.instruments) {
        await this.saveInstruments(data.instruments);
      }

      if (data.preferences) {
        await this.savePreferences(data.preferences);
      }

      console.log('Data import completed successfully');
    } catch (error) {
      console.error('Data import failed:', error);
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}

// Create singleton instance
export const offlineStorageService = new OfflineStorageService();

export default offlineStorageService;
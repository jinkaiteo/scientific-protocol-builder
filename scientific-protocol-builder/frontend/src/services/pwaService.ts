/**
 * PWA Service for Progressive Web App functionality
 * Handles service worker registration, offline capabilities, and mobile features
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
}

interface CacheStatus {
  caches: number;
  online: boolean;
  version: string;
}

class PWAService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isOnline = navigator.onLine;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.setupEventListeners();
    this.initializeEventListenerMap();
  }

  private initializeEventListenerMap() {
    const events = [
      'online',
      'offline',
      'update-available',
      'install-prompt',
      'installed',
      'cache-updated',
      'sync-complete'
    ];

    events.forEach(event => {
      this.eventListeners.set(event, new Set());
    });
  }

  /**
   * Initialize PWA service and register service worker
   */
  async initialize(): Promise<void> {
    try {
      // Register service worker
      await this.registerServiceWorker();

      // Setup install prompt handling
      this.setupInstallPrompt();

      // Setup network status monitoring
      this.setupNetworkMonitoring();

      // Setup notification permissions
      await this.setupNotifications();

      // Setup background sync
      this.setupBackgroundSync();

      console.log('PWA Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PWA Service:', error);
      throw error;
    }
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', this.swRegistration);

      // Listen for updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker available');
              this.emit('update-available', { registration: this.swRegistration });
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Setup install prompt handling
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('Install prompt ready');
      this.emit('install-prompt', { available: true });
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      this.deferredPrompt = null;
      this.emit('installed', { timestamp: new Date() });
    });
  }

  /**
   * Setup network status monitoring
   */
  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('App back online');
      this.emit('online', { timestamp: new Date() });
      this.syncData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('App offline');
      this.emit('offline', { timestamp: new Date() });
    });
  }

  /**
   * Setup notification permissions
   */
  private async setupNotifications(): Promise<void> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    if (Notification.permission === 'default') {
      console.log('Notification permission not granted yet');
    }
  }

  /**
   * Setup background sync
   */
  private setupBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      console.log('Background Sync supported');
    } else {
      console.log('Background Sync not supported');
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, status } = event.data;

    switch (type) {
      case 'CACHE_STATUS':
        this.emit('cache-updated', status);
        break;
      case 'SYNC_COMPLETE':
        this.emit('sync-complete', status);
        break;
      default:
        console.log('Unknown service worker message:', event.data);
    }
  }

  /**
   * Show install prompt
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      console.log('Install prompt result:', choiceResult.outcome);
      this.deferredPrompt = null;
      
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  /**
   * Check if app can be installed
   */
  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  /**
   * Check if app is running as PWA
   */
  isRunningAsPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Get network status
   */
  getNetworkStatus(): { online: boolean; connection?: any } {
    return {
      online: this.isOnline,
      connection: (navigator as any).connection
    };
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  /**
   * Show notification
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const notificationOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge.png',
      vibrate: [200, 100, 200],
      ...options
    };

    await this.swRegistration.showNotification(options.title, notificationOptions);
  }

  /**
   * Cache protocol for offline use
   */
  async cacheProtocol(protocolData: any): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    navigator.serviceWorker.controller?.postMessage({
      type: 'CACHE_PROTOCOL',
      protocol: protocolData
    });
  }

  /**
   * Get cache status
   */
  async getCacheStatus(): Promise<CacheStatus> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_STATUS') {
          resolve(event.data.status);
        } else {
          reject(new Error('Failed to get cache status'));
        }
      };

      navigator.serviceWorker.controller?.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [messageChannel.port2]
      );

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Cache status request timeout'));
      }, 5000);
    });
  }

  /**
   * Update service worker
   */
  async updateServiceWorker(): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    try {
      await this.swRegistration.update();
      
      // Tell the new service worker to skip waiting
      navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload page to activate new service worker
      window.location.reload();
    } catch (error) {
      console.error('Service Worker update failed:', error);
      throw error;
    }
  }

  /**
   * Sync data with server
   */
  async syncData(): Promise<void> {
    if (!this.swRegistration || !this.isOnline) {
      console.log('Cannot sync: offline or no service worker');
      return;
    }

    try {
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        await this.swRegistration.sync.register('protocol-sync');
        await this.swRegistration.sync.register('analysis-sync');
        console.log('Background sync registered');
      }
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }

  /**
   * Share content using Web Share API
   */
  async shareContent(shareData: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if (!('share' in navigator)) {
      console.log('Web Share API not supported');
      return false;
    }

    try {
      await (navigator as any).share(shareData);
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return false;
    }
  }

  /**
   * Copy to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return result;
      }
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      return false;
    }
  }

  /**
   * Get device information
   */
  getDeviceInfo(): {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    hasTouch: boolean;
    orientation: string;
    platform: string;
  } {
    const userAgent = navigator.userAgent;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return {
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isTablet: /iPad|Android.*Tablet|Windows.*Touch/i.test(userAgent),
      isDesktop: !/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      hasTouch,
      orientation: window.screen.orientation?.type || 'unknown',
      platform: navigator.platform
    };
  }

  /**
   * Setup periodic background sync
   */
  async setupPeriodicSync(): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    if ('periodicSync' in this.swRegistration) {
      try {
        await (this.swRegistration as any).periodicSync.register('protocol-refresh', {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        });
        console.log('Periodic background sync registered');
      } catch (error) {
        console.error('Periodic sync registration failed:', error);
      }
    } else {
      console.log('Periodic Background Sync not supported');
    }
  }

  /**
   * Add event listener
   */
  on(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in PWA event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Check if running in standalone mode
   */
  isStandalone(): boolean {
    return this.isRunningAsPWA() || window.matchMedia('(display-mode: fullscreen)').matches;
  }

  /**
   * Get app version from manifest
   */
  async getAppVersion(): Promise<string> {
    try {
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      return manifest.version || '1.0.0';
    } catch (error) {
      console.error('Failed to get app version:', error);
      return '1.0.0';
    }
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<{ quota: number; usage: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota || 0,
        usage: estimate.usage || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0)
      };
    }
    
    return { quota: 0, usage: 0, available: 0 };
  }
}

// Create singleton instance
export const pwaService = new PWAService();

export default pwaService;
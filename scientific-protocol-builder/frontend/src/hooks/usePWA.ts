import { useState, useEffect, useCallback } from 'react';
import { pwaService } from '../services/pwaService';

interface PWAState {
  isOnline: boolean;
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  updateAvailable: boolean;
  cacheStatus: {
    caches: number;
    online: boolean;
    version: string;
  } | null;
  deviceInfo: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    hasTouch: boolean;
    orientation: string;
    platform: string;
  };
  storageUsage: {
    quota: number;
    usage: number;
    available: number;
  } | null;
}

interface PWAActions {
  install: () => Promise<boolean>;
  update: () => Promise<void>;
  shareContent: (shareData: { title?: string; text?: string; url?: string }) => Promise<boolean>;
  copyToClipboard: (text: string) => Promise<boolean>;
  showNotification: (options: { title: string; body: string; icon?: string }) => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  cacheProtocol: (protocolData: any) => Promise<void>;
  syncData: () => Promise<void>;
  clearCaches: () => Promise<void>;
  refreshCacheStatus: () => Promise<void>;
  refreshStorageUsage: () => Promise<void>;
}

export const usePWA = (): [PWAState, PWAActions] => {
  const [state, setState] = useState<PWAState>({
    isOnline: navigator.onLine,
    canInstall: false,
    isInstalled: false,
    isStandalone: false,
    updateAvailable: false,
    cacheStatus: null,
    deviceInfo: pwaService.getDeviceInfo(),
    storageUsage: null
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize PWA service
  useEffect(() => {
    const initializePWA = async () => {
      try {
        await pwaService.initialize();
        
        setState(prevState => ({
          ...prevState,
          canInstall: pwaService.canInstall(),
          isStandalone: pwaService.isStandalone(),
          isInstalled: pwaService.isRunningAsPWA()
        }));

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize PWA:', error);
      }
    };

    if (!isInitialized) {
      initializePWA();
    }
  }, [isInitialized]);

  // Setup event listeners
  useEffect(() => {
    if (!isInitialized) return;

    const handleOnline = () => {
      setState(prevState => ({ ...prevState, isOnline: true }));
    };

    const handleOffline = () => {
      setState(prevState => ({ ...prevState, isOnline: false }));
    };

    const handleInstallPrompt = () => {
      setState(prevState => ({ ...prevState, canInstall: true }));
    };

    const handleInstalled = () => {
      setState(prevState => ({ 
        ...prevState, 
        isInstalled: true, 
        canInstall: false,
        isStandalone: pwaService.isStandalone()
      }));
    };

    const handleUpdateAvailable = () => {
      setState(prevState => ({ ...prevState, updateAvailable: true }));
    };

    const handleCacheUpdated = (status: any) => {
      setState(prevState => ({ ...prevState, cacheStatus: status }));
    };

    // Register event listeners
    pwaService.on('online', handleOnline);
    pwaService.on('offline', handleOffline);
    pwaService.on('install-prompt', handleInstallPrompt);
    pwaService.on('installed', handleInstalled);
    pwaService.on('update-available', handleUpdateAvailable);
    pwaService.on('cache-updated', handleCacheUpdated);

    // Initial cache status
    refreshCacheStatus();
    refreshStorageUsage();

    return () => {
      pwaService.off('online', handleOnline);
      pwaService.off('offline', handleOffline);
      pwaService.off('install-prompt', handleInstallPrompt);
      pwaService.off('installed', handleInstalled);
      pwaService.off('update-available', handleUpdateAvailable);
      pwaService.off('cache-updated', handleCacheUpdated);
    };
  }, [isInitialized]);

  // Actions
  const install = useCallback(async (): Promise<boolean> => {
    try {
      return await pwaService.showInstallPrompt();
    } catch (error) {
      console.error('Install failed:', error);
      return false;
    }
  }, []);

  const update = useCallback(async (): Promise<void> => {
    try {
      await pwaService.updateServiceWorker();
      setState(prevState => ({ ...prevState, updateAvailable: false }));
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }, []);

  const shareContent = useCallback(async (shareData: { title?: string; text?: string; url?: string }): Promise<boolean> => {
    try {
      return await pwaService.shareContent(shareData);
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      return await pwaService.copyToClipboard(text);
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      return false;
    }
  }, []);

  const showNotification = useCallback(async (options: { title: string; body: string; icon?: string }): Promise<void> => {
    try {
      await pwaService.showNotification(options);
    } catch (error) {
      console.error('Show notification failed:', error);
      throw error;
    }
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      return await pwaService.requestNotificationPermission();
    } catch (error) {
      console.error('Request notification permission failed:', error);
      return 'denied';
    }
  }, []);

  const cacheProtocol = useCallback(async (protocolData: any): Promise<void> => {
    try {
      await pwaService.cacheProtocol(protocolData);
    } catch (error) {
      console.error('Cache protocol failed:', error);
      throw error;
    }
  }, []);

  const syncData = useCallback(async (): Promise<void> => {
    try {
      await pwaService.syncData();
    } catch (error) {
      console.error('Sync data failed:', error);
      throw error;
    }
  }, []);

  const clearCaches = useCallback(async (): Promise<void> => {
    try {
      await pwaService.clearCaches();
      await refreshCacheStatus();
    } catch (error) {
      console.error('Clear caches failed:', error);
      throw error;
    }
  }, []);

  const refreshCacheStatus = useCallback(async (): Promise<void> => {
    try {
      const cacheStatus = await pwaService.getCacheStatus();
      setState(prevState => ({ ...prevState, cacheStatus }));
    } catch (error) {
      console.error('Refresh cache status failed:', error);
    }
  }, []);

  const refreshStorageUsage = useCallback(async (): Promise<void> => {
    try {
      const storageUsage = await pwaService.getStorageUsage();
      setState(prevState => ({ ...prevState, storageUsage }));
    } catch (error) {
      console.error('Refresh storage usage failed:', error);
    }
  }, []);

  const actions: PWAActions = {
    install,
    update,
    shareContent,
    copyToClipboard,
    showNotification,
    requestNotificationPermission,
    cacheProtocol,
    syncData,
    clearCaches,
    refreshCacheStatus,
    refreshStorageUsage
  };

  return [state, actions];
};

export default usePWA;
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Snackbar, Alert, Button, Slide } from '@mui/material';
import { usePWA } from '../../hooks/usePWA';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { offlineStorageService } from '../../services/offlineStorageService';

interface PWAContextType {
  showInstallPrompt: () => void;
  isInstalled: boolean;
  isOnline: boolean;
  canInstall: boolean;
  updateAvailable: boolean;
  triggerUpdate: () => void;
  cacheProtocol: (protocol: any) => Promise<void>;
  getStorageUsage: () => Promise<any>;
}

const PWAContext = createContext<PWAContextType | null>(null);

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [pwaState, pwaActions] = usePWA();
  const [installPromptOpen, setInstallPromptOpen] = useState(false);
  const [updateSnackbarOpen, setUpdateSnackbarOpen] = useState(false);
  const [offlineSnackbarOpen, setOfflineSnackbarOpen] = useState(false);
  const [installSnackbarOpen, setInstallSnackbarOpen] = useState(false);

  // Initialize offline storage
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await offlineStorageService.initialize();
        console.log('Offline storage initialized');
        
        // Clean up expired cache
        await offlineStorageService.clearExpiredCache();
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
      }
    };

    initializeStorage();
  }, []);

  // Handle online/offline status
  useEffect(() => {
    if (!pwaState.isOnline && offlineSnackbarOpen === false) {
      setOfflineSnackbarOpen(true);
    } else if (pwaState.isOnline && offlineSnackbarOpen) {
      setOfflineSnackbarOpen(false);
      // Trigger sync when coming back online
      pwaActions.syncData();
    }
  }, [pwaState.isOnline, pwaActions, offlineSnackbarOpen]);

  // Handle update availability
  useEffect(() => {
    if (pwaState.updateAvailable && !updateSnackbarOpen) {
      setUpdateSnackbarOpen(true);
    }
  }, [pwaState.updateAvailable, updateSnackbarOpen]);

  // Handle install prompt
  useEffect(() => {
    if (pwaState.canInstall && !pwaState.isInstalled) {
      // Show install prompt after 30 seconds if user hasn't dismissed it
      const timer = setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-shown');
        if (!hasSeenPrompt) {
          setInstallPromptOpen(true);
          localStorage.setItem('pwa-install-prompt-shown', 'true');
        }
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [pwaState.canInstall, pwaState.isInstalled]);

  // Handle successful installation
  useEffect(() => {
    if (pwaState.isInstalled && !installSnackbarOpen) {
      setInstallSnackbarOpen(true);
      setInstallPromptOpen(false);
    }
  }, [pwaState.isInstalled, installSnackbarOpen]);

  const handleInstall = async () => {
    try {
      const installed = await pwaActions.install();
      if (installed) {
        setInstallPromptOpen(false);
        // Show success message will be handled by the useEffect above
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await pwaActions.update();
      setUpdateSnackbarOpen(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const showInstallPrompt = () => {
    setInstallPromptOpen(true);
  };

  const cacheProtocol = async (protocol: any) => {
    try {
      await pwaActions.cacheProtocol(protocol);
      
      // Also store in IndexedDB for offline access
      await offlineStorageService.saveProtocol({
        id: protocol.id,
        name: protocol.name,
        content: protocol.content,
        lastModified: new Date(),
        version: protocol.version || 1,
        owner: protocol.owner || 'current_user',
        syncStatus: 'synced'
      });
    } catch (error) {
      console.error('Failed to cache protocol:', error);
      throw error;
    }
  };

  const getStorageUsage = async () => {
    try {
      const [pwaStorage, offlineStorage] = await Promise.all([
        pwaActions.refreshStorageUsage(),
        offlineStorageService.getStorageSize()
      ]);

      return {
        pwa: pwaState.storageUsage,
        offline: offlineStorage
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return null;
    }
  };

  const contextValue: PWAContextType = {
    showInstallPrompt,
    isInstalled: pwaState.isInstalled,
    isOnline: pwaState.isOnline,
    canInstall: pwaState.canInstall,
    updateAvailable: pwaState.updateAvailable,
    triggerUpdate: handleUpdate,
    cacheProtocol,
    getStorageUsage
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}

      {/* Install Prompt Dialog */}
      <PWAInstallPrompt
        open={installPromptOpen}
        onClose={() => setInstallPromptOpen(false)}
        onInstall={handleInstall}
      />

      {/* Update Available Snackbar */}
      <Snackbar
        open={updateSnackbarOpen}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'down' }}
      >
        <Alert
          severity="info"
          action={
            <Button color="inherit" onClick={handleUpdate}>
              Update
            </Button>
          }
          onClose={() => setUpdateSnackbarOpen(false)}
        >
          New version available! Update for the latest features.
        </Alert>
      </Snackbar>

      {/* Offline Status Snackbar */}
      <Snackbar
        open={offlineSnackbarOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <Alert
          severity="warning"
          onClose={() => setOfflineSnackbarOpen(false)}
        >
          You're offline. Your work will sync when connection is restored.
        </Alert>
      </Snackbar>

      {/* Installation Success Snackbar */}
      <Snackbar
        open={installSnackbarOpen}
        autoHideDuration={4000}
        onClose={() => setInstallSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          onClose={() => setInstallSnackbarOpen(false)}
        >
          🎉 Protocol Builder installed successfully! Look for the app icon on your device.
        </Alert>
      </Snackbar>
    </PWAContext.Provider>
  );
};

export const usePWAContext = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
};
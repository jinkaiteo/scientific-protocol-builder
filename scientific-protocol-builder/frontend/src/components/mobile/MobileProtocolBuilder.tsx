import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  Chip,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Slide,
  Zoom,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  CloudSync as CloudSyncIcon,
  CloudOff as CloudOffIcon,
  GetApp as DownloadIcon,
  Share as ShareIcon,
  Build as BuildIcon,
  Science as ScienceIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import { usePWA } from '../../hooks/usePWA';
import { useCollaboration } from '../collaboration/CollaborationProvider';
import { MobileBlocklyWorkspace } from './MobileBlocklyWorkspace';
import { MobileAnalysisPanel } from './MobileAnalysisPanel';
import { MobileInstrumentPanel } from './MobileInstrumentPanel';
import { TouchOptimizedToolbox } from './TouchOptimizedToolbox';

interface MobileProtocolBuilderProps {
  protocolId: string;
  protocolData?: any;
  protocolName?: string;
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

export const MobileProtocolBuilder: React.FC<MobileProtocolBuilderProps> = ({
  protocolId,
  protocolData,
  protocolName,
  onSave,
  readOnly = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [pwaState, pwaActions] = usePWA();
  const { isConnected, connectedUsers } = useCollaboration();

  // Mobile-specific state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bottomNav, setBottomNav] = useState(0);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [analysisDrawerOpen, setAnalysisDrawerOpen] = useState(false);
  const [instrumentDrawerOpen, setInstrumentDrawerOpen] = useState(false);
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  // Protocol state
  const [protocolContent, setProtocolContent] = useState(protocolData?.content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Touch and gesture handling
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchEndY, setTouchEndY] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    if (!pwaState.isOnline) {
      setShowOfflineAlert(true);
    }
  }, [pwaState.isOnline]);

  // Handle protocol changes
  const handleProtocolChange = useCallback((newContent: any) => {
    setProtocolContent(newContent);
    setHasUnsavedChanges(true);
    
    // Auto-save after 3 seconds of inactivity
    const timer = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Save protocol
  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges || !onSave) return;

    try {
      const protocolData = {
        content: protocolContent,
        lastModified: new Date().toISOString(),
        version: Date.now(), // Simple versioning
      };

      await onSave(protocolData);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      // Cache for offline use
      if (pwaState.isOnline) {
        await pwaActions.cacheProtocol({
          id: protocolId,
          name: protocolName,
          ...protocolData
        });
      }
    } catch (error) {
      console.error('Failed to save protocol:', error);
    }
  }, [hasUnsavedChanges, protocolContent, onSave, protocolId, protocolName, pwaState.isOnline, pwaActions]);

  // Share protocol
  const handleShare = useCallback(async () => {
    const shareData = {
      title: `Protocol: ${protocolName || 'Untitled'}`,
      text: 'Check out this scientific protocol',
      url: window.location.href
    };

    const shared = await pwaActions.shareContent(shareData);
    if (!shared) {
      // Fallback to copy link
      await pwaActions.copyToClipboard(window.location.href);
    }
  }, [protocolName, pwaActions]);

  // Touch gesture handlers for mobile navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStartY || !touchEndY) return;
    
    const distance = touchStartY - touchEndY;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && !toolboxOpen) {
      setToolboxOpen(true);
    } else if (isRightSwipe && toolboxOpen) {
      setToolboxOpen(false);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!fullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  }, [fullscreen]);

  // Speed dial actions
  const speedDialActions = [
    {
      icon: <SaveIcon />,
      name: 'Save',
      onClick: handleSave,
      disabled: !hasUnsavedChanges
    },
    {
      icon: <ShareIcon />,
      name: 'Share',
      onClick: handleShare
    },
    {
      icon: <AssessmentIcon />,
      name: 'Analysis',
      onClick: () => setAnalysisDrawerOpen(true)
    },
    {
      icon: <ScienceIcon />,
      name: 'Instruments',
      onClick: () => setInstrumentDrawerOpen(true)
    },
    {
      icon: fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />,
      name: fullscreen ? 'Exit Fullscreen' : 'Fullscreen',
      onClick: toggleFullscreen
    }
  ];

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        background: theme.palette.background.default
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '1rem' }} noWrap>
            {protocolName || 'Protocol Builder'}
          </Typography>

          {/* Connection status */}
          <IconButton color="inherit" size="small">
            {pwaState.isOnline ? 
              <CloudSyncIcon fontSize="small" /> : 
              <CloudOffIcon fontSize="small" />
            }
          </IconButton>

          {/* Collaboration indicator */}
          {isConnected && connectedUsers.length > 1 && (
            <Chip
              label={connectedUsers.length}
              size="small"
              color="secondary"
              sx={{ ml: 1, minWidth: 32, height: 24 }}
            />
          )}
        </Toolbar>
      </AppBar>

      {/* Offline Alert */}
      <Snackbar
        open={showOfflineAlert && !pwaState.isOnline}
        autoHideDuration={6000}
        onClose={() => setShowOfflineAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setShowOfflineAlert(false)}>
          You're offline. Changes will sync when connection is restored.
        </Alert>
      </Snackbar>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Mobile Blockly Workspace */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <MobileBlocklyWorkspace
            protocolId={protocolId}
            initialContent={protocolContent}
            onChange={handleProtocolChange}
            readOnly={readOnly}
            isMobile={isMobile}
            onToolboxToggle={() => setToolboxOpen(!toolboxOpen)}
          />

          {/* Touch-Optimized Toolbox */}
          <SwipeableDrawer
            anchor="left"
            open={toolboxOpen}
            onClose={() => setToolboxOpen(false)}
            onOpen={() => setToolboxOpen(true)}
            disableSwipeToOpen={false}
            swipeAreaWidth={20}
            PaperProps={{
              sx: { 
                width: isSmallScreen ? '80%' : 320,
                maxWidth: 400
              }
            }}
          >
            <TouchOptimizedToolbox
              onBlockSelect={(blockType) => {
                // Handle block selection
                console.log('Block selected:', blockType);
                setToolboxOpen(false);
              }}
              onClose={() => setToolboxOpen(false)}
            />
          </SwipeableDrawer>
        </Box>
      </Box>

      {/* Bottom Navigation */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
        <BottomNavigation
          value={bottomNav}
          onChange={(event, newValue) => setBottomNav(newValue)}
          sx={{ height: 56 }}
        >
          <BottomNavigationAction
            label="Build"
            icon={<BuildIcon />}
            onClick={() => setToolboxOpen(true)}
          />
          <BottomNavigationAction
            label="Analysis"
            icon={<AssessmentIcon />}
            onClick={() => setAnalysisDrawerOpen(true)}
          />
          <BottomNavigationAction
            label="Instruments"
            icon={<ScienceIcon />}
            onClick={() => setInstrumentDrawerOpen(true)}
          />
          <BottomNavigationAction
            label="Settings"
            icon={<SettingsIcon />}
            onClick={() => setDrawerOpen(true)}
          />
        </BottomNavigation>
      </Paper>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ 
          position: 'fixed', 
          bottom: 80, 
          right: 16,
          zIndex: 999
        }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.onClick();
              setSpeedDialOpen(false);
            }}
            FabProps={{ disabled: action.disabled }}
          />
        ))}
      </SpeedDial>

      {/* Navigation Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: isSmallScreen ? '80%' : 280 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Protocol Builder</Typography>
          <Typography variant="caption" color="text.secondary">
            {pwaState.isOnline ? 'Online' : 'Offline Mode'}
          </Typography>
        </Box>
        
        <List>
          <ListItem button onClick={handleSave} disabled={!hasUnsavedChanges}>
            <ListItemIcon>
              <SaveIcon color={hasUnsavedChanges ? 'primary' : 'disabled'} />
            </ListItemIcon>
            <ListItemText 
              primary="Save Protocol"
              secondary={lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'No changes'}
            />
          </ListItem>

          <ListItem button onClick={handleShare}>
            <ListItemIcon><ShareIcon /></ListItemIcon>
            <ListItemText primary="Share Protocol" />
          </ListItem>

          <ListItem button onClick={() => pwaActions.syncData()} disabled={!pwaState.isOnline}>
            <ListItemIcon><CloudSyncIcon /></ListItemIcon>
            <ListItemText primary="Sync Data" secondary={pwaState.isOnline ? 'Available' : 'Offline'} />
          </ListItem>

          <ListItem button onClick={() => setAnalysisDrawerOpen(true)}>
            <ListItemIcon><AssessmentIcon /></ListItemIcon>
            <ListItemText primary="Protocol Analysis" />
          </ListItem>

          <ListItem button onClick={() => setInstrumentDrawerOpen(true)}>
            <ListItemIcon><ScienceIcon /></ListItemIcon>
            <ListItemText primary="Instruments" />
          </ListItem>

          {pwaState.canInstall && (
            <ListItem button onClick={pwaActions.install}>
              <ListItemIcon><DownloadIcon /></ListItemIcon>
              <ListItemText primary="Install App" />
            </ListItem>
          )}
        </List>

        {/* PWA Status */}
        <Box sx={{ p: 2, mt: 'auto', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            App Status
          </Typography>
          <Box display="flex" gap={1} mt={1}>
            <Chip 
              label={pwaState.isOnline ? "Online" : "Offline"} 
              size="small"
              color={pwaState.isOnline ? "success" : "warning"}
            />
            {pwaState.isStandalone && (
              <Chip label="PWA" size="small" color="primary" />
            )}
            {pwaState.cacheStatus && (
              <Chip 
                label={`${pwaState.cacheStatus.caches} caches`} 
                size="small" 
                variant="outlined" 
              />
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Analysis Panel Drawer */}
      <Drawer
        anchor="bottom"
        open={analysisDrawerOpen}
        onClose={() => setAnalysisDrawerOpen(false)}
        PaperProps={{
          sx: { 
            height: '70%',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16
          }
        }}
      >
        <Box sx={{ 
          p: 1, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6">Protocol Analysis</Typography>
          <IconButton onClick={() => setAnalysisDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <MobileAnalysisPanel
            protocolId={protocolId}
            protocolName={protocolName}
            isMobile={true}
          />
        </Box>
      </Drawer>

      {/* Instruments Panel Drawer */}
      <Drawer
        anchor="right"
        open={instrumentDrawerOpen}
        onClose={() => setInstrumentDrawerOpen(false)}
        PaperProps={{
          sx: { width: isSmallScreen ? '90%' : 400 }
        }}
      >
        <Box sx={{ 
          p: 1, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6">Instruments</Typography>
          <IconButton onClick={() => setInstrumentDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <MobileInstrumentPanel
            onInstrumentSelect={(instrument) => {
              console.log('Instrument selected:', instrument);
              setInstrumentDrawerOpen(false);
            }}
            isMobile={true}
          />
        </Box>
      </Drawer>
    </Box>
  );
};
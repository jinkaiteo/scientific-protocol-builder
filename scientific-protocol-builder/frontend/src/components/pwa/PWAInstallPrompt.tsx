import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Card,
  CardContent,
  Slide,
  useTheme,
  useMediaQuery,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
  GetApp as InstallIcon,
  PhoneAndroid as PhoneIcon,
  Laptop as LaptopIcon,
  Tablet as TabletIcon,
  Offline as OfflineIcon,
  Notifications as NotificationsIcon,
  Update as UpdateIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { usePWA } from '../../hooks/usePWA';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface PWAInstallPromptProps {
  open: boolean;
  onClose: () => void;
  onInstall: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  open,
  onClose,
  onInstall
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [pwaState] = usePWA();

  const features = [
    {
      icon: <OfflineIcon color="primary" />,
      title: 'Work Offline',
      description: 'Continue building protocols without internet connection'
    },
    {
      icon: <NotificationsIcon color="primary" />,
      title: 'Push Notifications',
      description: 'Get notified about protocol updates and collaboration'
    },
    {
      icon: <UpdateIcon color="primary" />,
      title: 'Auto Updates',
      description: 'Always have the latest features and improvements'
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: 'Secure & Fast',
      description: 'Enhanced security and lightning-fast performance'
    }
  ];

  const getDeviceIcon = () => {
    if (pwaState.deviceInfo.isMobile) return <PhoneIcon />;
    if (pwaState.deviceInfo.isTablet) return <TabletIcon />;
    return <LaptopIcon />;
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent;
    
    if (/iPhone|iPad|iPod/.test(userAgent)) {
      return (
        <Box textAlign="center" mt={2}>
          <Typography variant="body2" color="text.secondary">
            On iOS: Tap the Share button in Safari, then "Add to Home Screen"
          </Typography>
        </Box>
      );
    } else if (/Android/.test(userAgent)) {
      return (
        <Box textAlign="center" mt={2}>
          <Typography variant="body2" color="text.secondary">
            On Android: Tap "Add to Home Screen" when prompted
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box textAlign="center" mt={2}>
          <Typography variant="body2" color="text.secondary">
            Click the install button below or look for the install icon in your browser's address bar
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          m: isMobile ? 0 : 2
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {getDeviceIcon()}
            </Avatar>
            <Box>
              <Typography variant="h6">Install Protocol Builder</Typography>
              <Typography variant="caption" color="text.secondary">
                Get the full app experience
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* App Preview Card */}
        <Card variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              height: 120,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <Box textAlign="center">
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  mx: 'auto',
                  mb: 1
                }}
              >
                <InstallIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6">Scientific Protocol Builder</Typography>
              <Typography variant="caption">Progressive Web App</Typography>
            </Box>
          </Box>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Transform your device into a powerful scientific protocol development platform with 
              offline capabilities, real-time collaboration, and advanced analysis tools.
            </Typography>
          </CardContent>
        </Card>

        {/* Features List */}
        <Typography variant="subtitle1" gutterBottom>
          Why install the app?
        </Typography>
        
        <List dense>
          {features.map((feature, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemIcon>
                {feature.icon}
              </ListItemIcon>
              <ListItemText
                primary={feature.title}
                secondary={feature.description}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>

        {/* Device-specific instructions */}
        {getInstallInstructions()}

        {/* Storage and compatibility info */}
        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            📱 Space Required: ~5MB
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            🔒 Secure: HTTPS encrypted connection
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            ⚡ Performance: Native app-like experience
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} color="inherit">
          Maybe Later
        </Button>
        <Button
          onClick={onInstall}
          variant="contained"
          startIcon={<InstallIcon />}
          disabled={!pwaState.canInstall}
          sx={{ minWidth: 120 }}
        >
          Install App
        </Button>
      </DialogActions>
    </Dialog>
  );
};
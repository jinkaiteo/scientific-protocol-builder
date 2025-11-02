import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  AvatarGroup,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lock as LockIcon,
  Edit as EditIcon,
  Circle as CircleIcon,
  PersonAdd as PersonAddIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useCollaboration } from './CollaborationProvider';
import { UserInfo } from '../../services/collaborationService';
import { formatDistanceToNow } from 'date-fns';

interface CollaborationPanelProps {
  protocolId: string;
  protocolTitle?: string;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  protocolId,
  protocolTitle = 'Protocol'
}) => {
  const {
    isConnected,
    connectedUsers,
    lockedElements,
    currentSession,
    joinProtocol,
    leaveProtocol,
    currentProtocolId
  } = useCollaboration();

  const [expanded, setExpanded] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Auto-join protocol if not already joined
  React.useEffect(() => {
    if (isConnected && protocolId && currentProtocolId !== protocolId) {
      joinProtocol(protocolId).catch(console.error);
    }
  }, [isConnected, protocolId, currentProtocolId, joinProtocol]);

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleInviteUser = () => {
    // TODO: Implement user invitation
    console.log('Invite user:', inviteEmail);
    setInviteEmail('');
    setInviteDialogOpen(false);
  };

  const getStatusColor = (user: UserInfo) => {
    if (!user.joinedAt) return 'default';
    
    const now = new Date();
    const joinTime = new Date(user.joinedAt);
    const timeDiff = now.getTime() - joinTime.getTime();
    
    // Active if joined recently or has recent activity
    if (timeDiff < 5 * 60 * 1000) return 'success'; // 5 minutes
    if (timeDiff < 30 * 60 * 1000) return 'warning'; // 30 minutes
    return 'default';
  };

  const getLockedElementsForUser = (userId: string) => {
    const elements: string[] = [];
    for (const [elementId, lockUser] of lockedElements.entries()) {
      if (lockUser.userId === userId) {
        elements.push(elementId);
      }
    }
    return elements;
  };

  if (!isConnected) {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <PeopleIcon color="disabled" />
          <Typography variant="body2" color="text.secondary">
            Collaboration unavailable
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ mb: 2 }}>
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2}
        sx={{ cursor: 'pointer' }}
        onClick={handleToggleExpanded}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Badge
            badgeContent={connectedUsers.length}
            color="primary"
            max={99}
          >
            <PeopleIcon />
          </Badge>
          <Typography variant="h6">
            Collaboration
          </Typography>
          {currentSession && (
            <Chip
              label={`v${currentSession.version}`}
              size="small"
              color="secondary"
            />
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {/* User avatars preview */}
          <AvatarGroup max={4} sx={{ mr: 1 }}>
            {connectedUsers.map((user) => (
              <Tooltip
                key={user.userId}
                title={`${user.name} - ${getStatusColor(user) === 'success' ? 'Active' : 'Idle'}`}
              >
                <Avatar
                  src={user.avatar}
                  sx={{
                    width: 32,
                    height: 32,
                    border: `2px solid ${
                      getStatusColor(user) === 'success' ? '#4caf50' :
                      getStatusColor(user) === 'warning' ? '#ff9800' : '#ccc'
                    }`
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>

          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Expanded content */}
      <Collapse in={expanded}>
        <Divider />
        
        {/* Action buttons */}
        <Box p={2} display="flex" gap={1}>
          <Button
            startIcon={<PersonAddIcon />}
            variant="outlined"
            size="small"
            onClick={() => setInviteDialogOpen(true)}
          >
            Invite
          </Button>
          <Button
            startIcon={<ShareIcon />}
            variant="outlined"
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              // Could show toast notification here
            }}
          >
            Share Link
          </Button>
        </Box>

        <Divider />

        {/* Connected users list */}
        <List dense>
          {connectedUsers.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No users connected"
                secondary="Share this protocol to collaborate"
              />
            </ListItem>
          ) : (
            connectedUsers.map((user) => {
              const lockedElements = getLockedElementsForUser(user.userId);
              const statusColor = getStatusColor(user);
              
              return (
                <ListItem key={user.userId}>
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <CircleIcon
                          sx={{
                            color: statusColor === 'success' ? '#4caf50' :
                                   statusColor === 'warning' ? '#ff9800' : '#ccc',
                            fontSize: 12
                          }}
                        />
                      }
                    >
                      <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">
                          {user.name}
                        </Typography>
                        {lockedElements.length > 0 && (
                          <Tooltip title={`Editing: ${lockedElements.join(', ')}`}>
                            <Chip
                              icon={<EditIcon />}
                              label={lockedElements.length}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                        {user.joinedAt && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                          </Typography>
                        )}
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    {statusColor === 'success' && (
                      <Chip
                        label="Active"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })
          )}
        </List>

        {/* Locked elements summary */}
        {lockedElements.size > 0 && (
          <>
            <Divider />
            <Box p={2}>
              <Typography variant="subtitle2" gutterBottom>
                Currently Editing
              </Typography>
              {Array.from(lockedElements.entries()).map(([elementId, user]) => (
                <Chip
                  key={elementId}
                  icon={<LockIcon />}
                  label={`${elementId} - ${user.name}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </>
        )}

        {/* Session info */}
        {currentSession && (
          <>
            <Divider />
            <Box p={2}>
              <Typography variant="caption" color="text.secondary">
                Session Version: {currentSession.version} | 
                Protocol: {protocolTitle}
              </Typography>
            </Box>
          </>
        )}
      </Collapse>

      {/* Invite user dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)}>
        <DialogTitle>Invite Collaborator</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@university.edu"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleInviteUser}
            variant="contained"
            disabled={!inviteEmail.trim()}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
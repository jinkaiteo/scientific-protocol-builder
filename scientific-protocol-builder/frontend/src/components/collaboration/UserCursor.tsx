import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { UserInfo } from '../../services/collaborationService';

interface UserCursorProps {
  user: UserInfo;
  position: { x: number; y: number };
  color: string;
}

export const UserCursor: React.FC<UserCursorProps> = ({ user, position, color }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        pointerEvents: 'none',
        transform: 'translate(-2px, -2px)',
      }}
    >
      {/* Cursor arrow */}
      <Box
        sx={{
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `12px solid ${color}`,
          position: 'relative',
        }}
      />
      
      {/* User name label */}
      <Paper
        elevation={2}
        sx={{
          position: 'absolute',
          top: -2,
          left: 16,
          backgroundColor: color,
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          fontSize: '11px',
          fontWeight: 'bold',
          minWidth: 'max-content',
        }}
      >
        <Typography variant="caption" sx={{ color: 'white', fontSize: '11px' }}>
          {user.name}
        </Typography>
      </Paper>
    </Box>
  );
};

interface CollaborativeCursorsProps {
  users: UserInfo[];
  userPresence: Map<string, { cursor?: { x: number; y: number } | null }>;
}

export const CollaborativeCursors: React.FC<CollaborativeCursorsProps> = ({
  users,
  userPresence,
}) => {
  // Color palette for user cursors
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 999,
      }}
    >
      {users.map((user, index) => {
        const presence = userPresence.get(user.userId);
        if (!presence?.cursor) return null;

        const color = colors[index % colors.length];

        return (
          <UserCursor
            key={user.userId}
            user={user}
            position={presence.cursor}
            color={color}
          />
        );
      })}
    </Box>
  );
};
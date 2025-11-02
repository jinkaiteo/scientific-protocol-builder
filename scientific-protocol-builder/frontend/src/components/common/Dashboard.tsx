import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Biotech as BiotechIcon,
  Storage as StorageIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const quickActions = [
    {
      title: 'Create New Protocol',
      description: 'Start building a new scientific protocol',
      icon: <ScienceIcon />,
      action: () => navigate('/builder'),
      color: 'primary' as const,
    },
    {
      title: 'Manage Protocols',
      description: 'View and edit your existing protocols',
      icon: <StorageIcon />,
      action: () => navigate('/protocols'),
      color: 'secondary' as const,
    },
    {
      title: 'Instrument Setup',
      description: 'Configure laboratory instruments',
      icon: <BiotechIcon />,
      action: () => navigate('/instruments'),
      color: 'success' as const,
    },
  ];

  const recentActivity = [
    {
      title: 'PCR Protocol v2.1',
      description: 'Updated protocol parameters',
      time: '2 hours ago',
      type: 'update',
    },
    {
      title: 'Western Blot Protocol',
      description: 'Created new protocol template',
      time: '1 day ago',
      type: 'create',
    },
    {
      title: 'Thermocycler TC-100',
      description: 'Added new instrument',
      time: '2 days ago',
      type: 'instrument',
    },
  ];

  const stats = [
    {
      title: 'Total Protocols',
      value: '12',
      icon: <ScienceIcon />,
      color: 'primary',
    },
    {
      title: 'Active Instruments',
      value: '8',
      icon: <BiotechIcon />,
      color: 'success',
    },
    {
      title: 'Templates Created',
      value: '5',
      icon: <StorageIcon />,
      color: 'warning',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}! 👋
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Here's what's happening in your laboratory today.
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ color: `${stat.color}.main`, mr: 1 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4">
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ color: `${action.color}.main`, mb: 2 }}>
                      {action.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color={action.color}
                      onClick={action.action}
                      startIcon={<AddIcon />}
                    >
                      Get Started
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Recent Activity
          </Typography>
          <Paper sx={{ p: 2 }}>
            <List>
              {recentActivity.map((activity, index) => (
                <ListItem key={index} divider={index < recentActivity.length - 1}>
                  <ListItemIcon>
                    {activity.type === 'update' && <TrendingUpIcon color="primary" />}
                    {activity.type === 'create' && <AddIcon color="success" />}
                    {activity.type === 'instrument' && <BiotechIcon color="warning" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <ScheduleIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Getting Started */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              🚀 Getting Started
            </Typography>
            <Typography variant="body1" paragraph>
              New to Scientific Protocol Builder? Here are some steps to get you up and running:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="1. Set up your instruments"
                onClick={() => navigate('/instruments')}
                clickable
                color="primary"
                variant="outlined"
              />
              <Chip
                label="2. Create your first protocol"
                onClick={() => navigate('/builder')}
                clickable
                color="primary"
                variant="outlined"
              />
              <Chip
                label="3. Explore protocol templates"
                onClick={() => navigate('/protocols')}
                clickable
                color="primary"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
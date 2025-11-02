import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Science as ScienceIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Memory as MemoryIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { instrumentService, DashboardData, Instrument } from '../../services/instrumentService';
import { useAuthStore } from '../../stores/authStore';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

interface InstrumentDashboardProps {
  onInstrumentSelect?: (instrument: Instrument) => void;
}

export const InstrumentDashboard: React.FC<InstrumentDashboardProps> = ({
  onInstrumentSelect
}) => {
  const { user, token } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [recentInstruments, setRecentInstruments] = useState<Instrument[]>([]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    setupWebSocketConnection();
    
    return () => {
      instrumentService.disconnect();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await instrumentService.getDashboardData();
      setDashboardData(data);
      
      // Load recent instruments
      const recentResult = await instrumentService.searchInstruments(
        { myInstruments: true },
        'updatedAt',
        'desc',
        1,
        5
      );
      setRecentInstruments(recentResult.instruments);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocketConnection = async () => {
    if (!token) return;

    try {
      await instrumentService.connectWebSocket(token);
      setIsConnected(true);

      // Set up real-time event listeners
      instrumentService.on('dashboard-data', (data: any) => {
        if (data.success) {
          setDashboardData(data.data);
        }
      });

      instrumentService.on('instrument-status', (data: any) => {
        // Update real-time status in dashboard
        console.log('Instrument status update:', data);
      });

      // Request real-time dashboard updates
      instrumentService.requestDashboardData();
    } catch (error) {
      console.error('Failed to connect to instruments WebSocket:', error);
      setIsConnected(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
    if (isConnected) {
      instrumentService.requestDashboardData();
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: '#4caf50',
      in_use: '#ff9800',
      maintenance: '#f44336',
      calibration: '#2196f3',
      offline: '#9e9e9e',
      reserved: '#9c27b0'
    };
    return colors[status as keyof typeof colors] || '#9e9e9e';
  };

  const getCategoryIcon = (category: string) => {
    // Return appropriate icon based on category
    return <ScienceIcon />;
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          Instrument Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={
          <Button color="inherit" onClick={loadDashboardData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box p={3}>
        <Alert severity="info">
          No dashboard data available
        </Alert>
      </Box>
    );
  }

  // Prepare chart data
  const utilizationChartData = dashboardData.utilizationTrends.daily.map((value, index) => ({
    day: `Day ${index + 1}`,
    utilization: value
  }));

  const categoryChartData = dashboardData.breakdown.map(item => ({
    name: item.category.replace('_', ' ').toUpperCase(),
    value: item.count,
    color: item.color
  }));

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Instrument Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time monitoring and management of laboratory instruments
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Badge 
            color={isConnected ? 'success' : 'error'} 
            variant="dot"
          >
            <Chip 
              icon={<MemoryIcon />}
              label={isConnected ? 'Connected' : 'Offline'}
              color={isConnected ? 'success' : 'default'}
              size="small"
            />
          </Badge>
          
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Instruments
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.overview.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#2196f3' }}>
                  <ScienceIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Available Now
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {dashboardData.overview.available}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4caf50' }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    My Instruments
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.overview.myInstruments}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#ff9800' }}>
                  <SettingsIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Utilization Rate
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.overview.utilizationRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#9c27b0' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {(dashboardData.alerts.calibrationDue > 0 || dashboardData.alerts.maintenanceDue > 0) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Attention Required
          </Typography>
          {dashboardData.alerts.calibrationDue > 0 && (
            <Typography variant="body2">
              • {dashboardData.alerts.calibrationDue} instrument(s) due for calibration
            </Typography>
          )}
          {dashboardData.alerts.maintenanceDue > 0 && (
            <Typography variant="body2">
              • {dashboardData.alerts.maintenanceDue} instrument(s) due for maintenance
            </Typography>
          )}
        </Alert>
      )}

      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Utilization Trends (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={utilizationChartData}>
                <defs>
                  <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip />
                <Area 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="#2196f3" 
                  fillOpacity={1}
                  fill="url(#utilizationGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Instrument Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Instruments and Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Recent Instruments
            </Typography>
            <List>
              {recentInstruments.map((instrument, index) => (
                <React.Fragment key={instrument._id}>
                  <ListItem button onClick={() => onInstrumentSelect?.(instrument)}>
                    <ListItemIcon>
                      {getCategoryIcon(instrument.category)}
                    </ListItemIcon>
                    <ListItemText
                      primary={instrument.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {instrument.manufacturer} {instrument.model}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Chip
                              label={instrument.status.replace('_', ' ').toUpperCase()}
                              size="small"
                              sx={{ 
                                bgcolor: getStatusColor(instrument.status),
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                            {instrument.realTimeStatus?.isConnected && (
                              <Chip
                                label="LIVE"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentInstruments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            {recentInstruments.length === 0 && (
              <Typography color="text.secondary" align="center" py={2}>
                No recent instruments
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {activity.type === 'instrument_usage' ? <PlayIcon /> : <BuildIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          {activity.instrument?.name || 'Unknown Instrument'} used by{' '}
                          {activity.user?.firstName} {activity.user?.lastName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          {activity.duration && (
                            <> • Duration: {Math.round(activity.duration / (1000 * 60))} min</>
                          )}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < Math.min(dashboardData.recentActivity.length, 5) - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            {dashboardData.recentActivity.length === 0 && (
              <Typography color="text.secondary" align="center" py={2}>
                No recent activity
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Switch,
  FormControlLabel,
  Badge,
  Tooltip,
  Alert,
  LinearProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  Memory as MemoryIcon,
  Science as ScienceIcon,
  Refresh as RefreshIcon,
  Extension as ExtensionIcon,
  Calendar as CalendarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { instrumentService, Instrument, InstrumentSearchFilters } from '../../services/instrumentService';
import { InstrumentDashboard } from './InstrumentDashboard';
import { InstrumentBlockGenerator } from './InstrumentBlockGenerator';
import { useAuthStore } from '../../stores/authStore';
import { formatDistanceToNow } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`instrument-tabpanel-${index}`}
      aria-labelledby={`instrument-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export const EnhancedInstrumentManager: React.FC = () => {
  const { user, token } = useAuthStore();
  const [currentTab, setCurrentTab] = useState(0);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<InstrumentSearchFilters>({});
  const [searchText, setSearchText] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(null);
  const [blockGeneratorOpen, setBlockGeneratorOpen] = useState(false);
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  const [calibrationDialogOpen, setCalibrationDialogOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isConnectedToWS, setIsConnectedToWS] = useState(false);
  const [realTimeStatuses, setRealTimeStatuses] = useState<Map<string, any>>(new Map());

  // Pagination and sorting
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadInstruments();
    loadCategories();
    setupWebSocketConnection();

    return () => {
      instrumentService.disconnect();
    };
  }, []);

  useEffect(() => {
    loadInstruments();
  }, [searchFilters, sortBy, sortOrder, page]);

  const loadInstruments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = { ...searchFilters };
      if (searchText.trim()) {
        filters.search = searchText.trim();
      }

      const result = await instrumentService.searchInstruments(
        filters,
        sortBy,
        sortOrder,
        page,
        limit
      );

      setInstruments(result.instruments);
      setTotalPages(result.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load instruments');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await instrumentService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const setupWebSocketConnection = async () => {
    if (!token) return;

    try {
      await instrumentService.connectWebSocket(token);
      setIsConnectedToWS(true);

      // Set up real-time event listeners
      instrumentService.on('instrument-status', (data: any) => {
        setRealTimeStatuses(prev => {
          const newMap = new Map(prev);
          newMap.set(data.instrumentId, data.status);
          return newMap;
        });
      });

      instrumentService.on('instrument-connected', (data: any) => {
        console.log('Instrument connected:', data);
        loadInstruments(); // Refresh list
      });

      instrumentService.on('instrument-disconnected', (data: any) => {
        console.log('Instrument disconnected:', data);
        loadInstruments(); // Refresh list
      });

      instrumentService.on('instrument-alert', (data: any) => {
        // Handle alerts (could show toast notifications)
        console.log('Instrument alert:', data);
      });

    } catch (error) {
      console.error('Failed to connect to instruments WebSocket:', error);
      setIsConnectedToWS(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadInstruments();
  };

  const handleFilterChange = (key: string, value: any) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchFilters({});
    setSearchText('');
    setPage(1);
  };

  const handleInstrumentAction = (action: string, instrument: Instrument) => {
    setSelectedInstrument(instrument);
    
    switch (action) {
      case 'edit':
        // Open edit dialog
        break;
      case 'delete':
        handleDeleteInstrument(instrument);
        break;
      case 'connect':
        handleConnectInstrument(instrument);
        break;
      case 'disconnect':
        handleDisconnectInstrument(instrument);
        break;
      case 'reserve':
        setReservationDialogOpen(true);
        break;
      case 'calibrate':
        setCalibrationDialogOpen(true);
        break;
      case 'generate_blocks':
        setBlockGeneratorOpen(true);
        break;
      case 'view_details':
        // Navigate to details view
        break;
    }
    
    setActionMenuAnchor(null);
  };

  const handleConnectInstrument = async (instrument: Instrument) => {
    try {
      await instrumentService.connectInstrument(instrument._id);
      // Subscribe to real-time updates
      instrumentService.subscribeToInstrument(instrument._id);
    } catch (error) {
      console.error('Failed to connect instrument:', error);
    }
  };

  const handleDisconnectInstrument = async (instrument: Instrument) => {
    try {
      await instrumentService.disconnectInstrument(instrument._id);
      instrumentService.unsubscribeFromInstrument(instrument._id);
    } catch (error) {
      console.error('Failed to disconnect instrument:', error);
    }
  };

  const handleDeleteInstrument = async (instrument: Instrument) => {
    if (window.confirm(`Are you sure you want to delete ${instrument.name}?`)) {
      try {
        await instrumentService.deleteInstrument(instrument._id);
        loadInstruments();
      } catch (error) {
        console.error('Failed to delete instrument:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'success',
      in_use: 'warning',
      maintenance: 'error',
      calibration: 'info',
      offline: 'default',
      reserved: 'secondary'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      available: <CheckCircleIcon />,
      in_use: <PlayIcon />,
      maintenance: <BuildIcon />,
      calibration: <ScienceIcon />,
      offline: <StopIcon />,
      reserved: <ScheduleIcon />
    };
    return icons[status as keyof typeof icons] || <StopIcon />;
  };

  const renderInstrumentCard = (instrument: Instrument) => {
    const realTimeStatus = realTimeStatuses.get(instrument._id);
    const isConnected = realTimeStatus?.isConnected || instrument.realTimeStatus?.isConnected;

    return (
      <Grid item xs={12} sm={6} md={4} key={instrument._id}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            '&:hover': {
              boxShadow: 4,
            }
          }}
        >
          {/* Connection indicator */}
          {isConnected && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1
              }}
            >
              <Badge color="success" variant="dot">
                <Chip label="LIVE" size="small" color="success" />
              </Badge>
            </Box>
          )}

          <CardContent sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
              <Typography variant="h6" component="h2" sx={{ wordBreak: 'break-word' }}>
                {instrument.name}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  setActionMenuAnchor(e.currentTarget);
                  setSelectedInstrument(instrument);
                }}
              >
                <MoreIcon />
              </IconButton>
            </Box>

            <Typography color="text.secondary" gutterBottom>
              {instrument.manufacturer} {instrument.model}
            </Typography>

            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Chip
                icon={getStatusIcon(instrument.status)}
                label={instrument.status.replace('_', ' ').toUpperCase()}
                color={getStatusColor(instrument.status) as any}
                size="small"
              />
              <Chip
                label={instrument.category.replace('_', ' ').toUpperCase()}
                size="small"
                variant="outlined"
              />
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Location: {instrument.location.building || 'N/A'} - {instrument.location.room || 'N/A'}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Owner: {instrument.owner.firstName} {instrument.owner.lastName}
            </Typography>

            {instrument.qualityControl.requiresCalibration && (
              <Box mt={1}>
                <Typography variant="caption" color="text.secondary">
                  Next Calibration: {' '}
                  {instrument.qualityControl.nextCalibrationDue 
                    ? formatDistanceToNow(new Date(instrument.qualityControl.nextCalibrationDue), { addSuffix: true })
                    : 'Not scheduled'
                  }
                </Typography>
              </Box>
            )}

            {instrument.utilization && (
              <Box mt={1}>
                <Typography variant="caption" color="text.secondary">
                  Utilization: {instrument.utilization.utilizationRate.toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={instrument.utilization.utilizationRate}
                  sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                />
              </Box>
            )}
          </CardContent>

          <CardActions>
            <Button
              size="small"
              startIcon={<ExtensionIcon />}
              onClick={() => handleInstrumentAction('generate_blocks', instrument)}
            >
              Generate Blocks
            </Button>
            <Button
              size="small"
              startIcon={isConnected ? <StopIcon /> : <PlayIcon />}
              onClick={() => handleInstrumentAction(isConnected ? 'disconnect' : 'connect', instrument)}
              color={isConnected ? 'error' : 'primary'}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  const renderSearchAndFilters = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search instruments..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={searchFilters.category || ''}
              label="Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={searchFilters.status || ''}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="in_use">In Use</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="calibration">Calibration</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
              <MenuItem value="reserved">Reserved</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControlLabel
            control={
              <Switch
                checked={searchFilters.myInstruments || false}
                onChange={(e) => handleFilterChange('myInstruments', e.target.checked)}
              />
            }
            label="My Instruments"
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Instrument Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage laboratory instruments, generate Blockly blocks, and monitor real-time status
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Badge color={isConnectedToWS ? 'success' : 'error'} variant="dot">
            <Chip 
              icon={<MemoryIcon />}
              label={isConnectedToWS ? 'Connected' : 'Offline'}
              color={isConnectedToWS ? 'success' : 'default'}
              size="small"
            />
          </Badge>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadInstruments}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {/* Open create dialog */}}
          >
            Add Instrument
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="Dashboard" />
          <Tab label="Instruments" />
          <Tab label="Calibration" />
          <Tab label="Maintenance" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <InstrumentDashboard onInstrumentSelect={setSelectedInstrument} />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {renderSearchAndFilters()}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Grid container spacing={3}>
          {instruments.map(renderInstrumentCard)}
        </Grid>

        {instruments.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No instruments found matching your criteria
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Typography sx={{ mx: 2, alignSelf: 'center' }}>
              Page {page} of {totalPages}
            </Typography>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {/* Calibration management content */}
        <Typography variant="h6">Calibration Management</Typography>
        <Typography color="text.secondary">
          Calibration scheduling and tracking will be implemented here
        </Typography>
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        {/* Maintenance management content */}
        <Typography variant="h6">Maintenance Management</Typography>
        <Typography color="text.secondary">
          Maintenance scheduling and tracking will be implemented here
        </Typography>
      </TabPanel>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleInstrumentAction('view_details', selectedInstrument!)}>
          <EditIcon sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => handleInstrumentAction('edit', selectedInstrument!)}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleInstrumentAction('reserve', selectedInstrument!)}>
          <ScheduleIcon sx={{ mr: 1 }} /> Reserve
        </MenuItem>
        <MenuItem onClick={() => handleInstrumentAction('calibrate', selectedInstrument!)}>
          <ScienceIcon sx={{ mr: 1 }} /> Calibrate
        </MenuItem>
        <MenuItem onClick={() => handleInstrumentAction('generate_blocks', selectedInstrument!)}>
          <ExtensionIcon sx={{ mr: 1 }} /> Generate Blocks
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleInstrumentAction('delete', selectedInstrument!)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Block Generator Dialog */}
      <InstrumentBlockGenerator
        open={blockGeneratorOpen}
        onClose={() => setBlockGeneratorOpen(false)}
        instrument={selectedInstrument}
        onBlocksGenerated={(blocks) => {
          console.log('Generated blocks:', blocks);
          // Handle block integration with protocol builder
        }}
      />

      {/* Other dialogs would go here */}
    </Box>
  );
};
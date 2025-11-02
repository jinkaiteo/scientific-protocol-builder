import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Biotech as BiotechIcon,
} from '@mui/icons-material';

interface Instrument {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  status: 'active' | 'maintenance' | 'inactive';
  lastCalibration: string;
}

const InstrumentManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Mock data - in real app, this would come from API
  const instruments: Instrument[] = [
    {
      id: '1',
      name: 'Thermocycler TC-100',
      type: 'PCR Machine',
      manufacturer: 'Bio-Rad',
      model: 'C1000 Touch',
      serialNumber: 'BR-2024-001',
      location: 'Lab A, Bench 1',
      status: 'active',
      lastCalibration: '2024-01-15',
    },
    {
      id: '2',
      name: 'Microplate Reader MR-200',
      type: 'Plate Reader',
      manufacturer: 'BioTek',
      model: 'Synergy H1',
      serialNumber: 'BT-2024-002',
      location: 'Lab B, Bench 3',
      status: 'active',
      lastCalibration: '2024-01-10',
    },
    {
      id: '3',
      name: 'Centrifuge CF-300',
      type: 'Centrifuge',
      manufacturer: 'Eppendorf',
      model: '5424 R',
      serialNumber: 'EP-2024-003',
      location: 'Lab A, Bench 2',
      status: 'maintenance',
      lastCalibration: '2023-12-20',
    },
  ];

  const instrumentTypes = ['PCR Machine', 'Plate Reader', 'Centrifuge', 'Microscope', 'Spectrophotometer'];

  const filteredInstruments = instruments.filter(instrument => {
    const matchesSearch = instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instrument.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instrument.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || instrument.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleAddInstrument = () => {
    setAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
  };

  const handleAddDialogSave = () => {
    console.log('Adding new instrument...');
    // TODO: Implement add instrument functionality
    setAddDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Instrument Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddInstrument}
        >
          Add Instrument
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search instruments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        
        <TextField
          select
          label="Type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <option value="">All Types</option>
          {instrumentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </TextField>
      </Box>

      {/* Instrument Grid */}
      <Grid container spacing={3}>
        {filteredInstruments.map((instrument) => (
          <Grid item xs={12} sm={6} md={4} key={instrument.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BiotechIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h3">
                    {instrument.name}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Type:</strong> {instrument.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Manufacturer:</strong> {instrument.manufacturer}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Model:</strong> {instrument.model}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Serial:</strong> {instrument.serialNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Location:</strong> {instrument.location}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={instrument.status.toUpperCase()}
                    color={getStatusColor(instrument.status) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Last Calibration: {new Date(instrument.lastCalibration).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredInstruments.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No instruments found matching your search criteria.
        </Alert>
      )}

      {/* Add Instrument Dialog */}
      <Dialog open={addDialogOpen} onClose={handleAddDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Instrument</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Instrument Name"
              fullWidth
              required
            />
            <TextField
              select
              label="Type"
              fullWidth
              required
            >
              {instrumentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </TextField>
            <TextField
              label="Manufacturer"
              fullWidth
            />
            <TextField
              label="Model"
              fullWidth
            />
            <TextField
              label="Serial Number"
              fullWidth
            />
            <TextField
              label="Location"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button onClick={handleAddDialogSave} variant="contained">
            Add Instrument
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add instrument"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'block', sm: 'none' }
        }}
        onClick={handleAddInstrument}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default InstrumentManager;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as FileCopyIcon,
  Download as DownloadIcon,
  Public as PublicIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

interface Protocol {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  isTemplate: boolean;
}

const ProtocolManager: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Mock data - in real app, this would come from API
  const protocols: Protocol[] = [
    {
      id: '1',
      name: 'PCR Amplification Protocol',
      description: 'Standard PCR protocol for DNA amplification',
      category: 'Molecular Biology',
      tags: ['PCR', 'DNA', 'Amplification'],
      version: '2.1',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      isPublic: true,
      isTemplate: false,
    },
    {
      id: '2',
      name: 'Western Blot Analysis',
      description: 'Complete western blot protocol with optimization notes',
      category: 'Protein Analysis',
      tags: ['Western Blot', 'Protein', 'SDS-PAGE'],
      version: '1.5',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      isPublic: false,
      isTemplate: true,
    },
    {
      id: '3',
      name: 'Cell Culture Maintenance',
      description: 'Standard protocol for maintaining HEK293 cell lines',
      category: 'Cell Culture',
      tags: ['Cell Culture', 'HEK293', 'Maintenance'],
      version: '1.0',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-12',
      isPublic: true,
      isTemplate: true,
    },
  ];

  const categories = ['Molecular Biology', 'Protein Analysis', 'Cell Culture', 'Biochemistry'];

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || protocol.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, protocol: Protocol) => {
    setAnchorEl(event.currentTarget);
    setSelectedProtocol(protocol);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProtocol(null);
  };

  const handleEdit = () => {
    if (selectedProtocol) {
      navigate(`/builder/${selectedProtocol.id}`);
    }
    handleMenuClose();
  };

  const handleClone = () => {
    console.log('Cloning protocol:', selectedProtocol?.name);
    // TODO: Implement clone functionality
    handleMenuClose();
  };

  const handleDownload = () => {
    console.log('Downloading protocol:', selectedProtocol?.name);
    // TODO: Implement download functionality
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    console.log('Deleting protocol:', selectedProtocol?.name);
    // TODO: Implement delete functionality
    setDeleteDialogOpen(false);
    setSelectedProtocol(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProtocol(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Protocol Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/builder')}
        >
          New Protocol
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search protocols..."
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
          label="Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Protocol Grid */}
      <Grid container spacing={3}>
        {filteredProtocols.map((protocol) => (
          <Grid item xs={12} sm={6} md={4} key={protocol.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="h3">
                    {protocol.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {protocol.isPublic ? (
                      <PublicIcon color="primary" fontSize="small" />
                    ) : (
                      <LockIcon color="disabled" fontSize="small" />
                    )}
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, protocol)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {protocol.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Category: {protocol.category}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Version: {protocol.version}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {protocol.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                  {protocol.isTemplate && (
                    <Chip label="Template" size="small" color="secondary" />
                  )}
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Updated: {new Date(protocol.updatedAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button size="small" onClick={() => navigate(`/builder/${protocol.id}`)}>
                  Open
                </Button>
                <Button size="small" onClick={() => handleClone()}>
                  Clone
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredProtocols.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No protocols found matching your search criteria.
        </Alert>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleClone}>
          <FileCopyIcon sx={{ mr: 1 }} />
          Clone
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Protocol</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedProtocol?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProtocolManager;
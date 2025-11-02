import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Preview as PreviewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { instrumentService, Instrument, BlocklyBlock } from '../../services/instrumentService';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface InstrumentBlockGeneratorProps {
  open: boolean;
  onClose: () => void;
  instrument: Instrument | null;
  onBlocksGenerated?: (blocks: any) => void;
}

export const InstrumentBlockGenerator: React.FC<InstrumentBlockGeneratorProps> = ({
  open,
  onClose,
  instrument,
  onBlocksGenerated
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedBlocks, setGeneratedBlocks] = useState<any>(null);
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [previewMode, setPreviewMode] = useState<'visual' | 'code'>('visual');
  const [customization, setCustomization] = useState({
    includeStatusBlocks: true,
    includeConfigBlocks: true,
    includeUtilityBlocks: true,
    customPrefix: '',
    customColor: '',
  });

  useEffect(() => {
    if (open && instrument) {
      generateBlocks();
    }
  }, [open, instrument]);

  const generateBlocks = async () => {
    if (!instrument) return;

    try {
      setLoading(true);
      setError(null);
      
      const blocksData = await instrumentService.generateBlocklyBlocks(instrument._id);
      setGeneratedBlocks(blocksData);
      
      // Select all blocks by default
      const allBlockTypes = new Set(blocksData.blocks.map((block: BlocklyBlock) => block.type));
      setSelectedBlocks(allBlockTypes);
    } catch (err: any) {
      setError(err.message || 'Failed to generate Blockly blocks');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = (blockType: string) => {
    const newSelected = new Set(selectedBlocks);
    if (newSelected.has(blockType)) {
      newSelected.delete(blockType);
    } else {
      newSelected.add(blockType);
    }
    setSelectedBlocks(newSelected);
  };

  const handleSelectAll = () => {
    if (!generatedBlocks) return;
    
    const allBlockTypes = new Set(generatedBlocks.blocks.map((block: BlocklyBlock) => block.type));
    setSelectedBlocks(allBlockTypes);
  };

  const handleDeselectAll = () => {
    setSelectedBlocks(new Set());
  };

  const handleExport = () => {
    if (!generatedBlocks) return;

    const selectedBlocksData = {
      ...generatedBlocks,
      blocks: generatedBlocks.blocks.filter((block: BlocklyBlock) => 
        selectedBlocks.has(block.type)
      ),
      customization
    };

    // Create downloadable JSON file
    const dataStr = JSON.stringify(selectedBlocksData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${instrument?.name.replace(/\s+/g, '_')}_blockly_blocks.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleApplyToWorkspace = () => {
    if (!generatedBlocks) return;

    const selectedBlocksData = {
      ...generatedBlocks,
      blocks: generatedBlocks.blocks.filter((block: BlocklyBlock) => 
        selectedBlocks.has(block.type)
      ),
      customization
    };

    onBlocksGenerated?.(selectedBlocksData);
    onClose();
  };

  const renderBlockPreview = (block: BlocklyBlock) => {
    return (
      <Paper 
        key={block.type}
        sx={{ 
          p: 2, 
          mb: 2, 
          border: selectedBlocks.has(block.type) ? 2 : 1,
          borderColor: selectedBlocks.has(block.type) ? 'primary.main' : 'divider',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
        onClick={() => handleBlockToggle(block.type)}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="subtitle2" gutterBottom>
              {block.message0}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Type: {block.type}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Tooltip: {block.tooltip}
            </Typography>
            {block.args0 && block.args0.length > 0 && (
              <Box mt={1}>
                <Typography variant="caption" color="text.secondary">
                  Parameters:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                  {block.args0.map((arg, index) => (
                    <Chip
                      key={index}
                      label={`${arg.name} (${arg.type})`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 20,
              height: 20,
              bgcolor: block.colour,
              borderRadius: 1,
              ml: 2,
              flexShrink: 0
            }}
          />
        </Box>
      </Paper>
    );
  };

  const renderCodePreview = () => {
    if (!generatedBlocks) return null;

    const selectedBlocksData = generatedBlocks.blocks.filter((block: BlocklyBlock) => 
      selectedBlocks.has(block.type)
    );

    const codeString = JSON.stringify({
      instrumentId: generatedBlocks.instrumentId,
      instrumentName: generatedBlocks.instrumentName,
      category: generatedBlocks.category,
      blocks: selectedBlocksData,
      customization
    }, null, 2);

    return (
      <SyntaxHighlighter
        language="json"
        style={tomorrow}
        customStyle={{
          maxHeight: '400px',
          fontSize: '12px'
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    );
  };

  if (!instrument) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">
              Generate Blockly Blocks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {instrument.name} ({instrument.manufacturer} {instrument.model})
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant={previewMode === 'visual' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewMode('visual')}
            >
              Visual
            </Button>
            <Button
              variant={previewMode === 'code' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<CodeIcon />}
              onClick={() => setPreviewMode('code')}
            >
              Code
            </Button>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" ml={2}>
              Generating Blockly blocks...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {generatedBlocks && !loading && (
          <Box>
            {/* Customization Options */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Customization Options</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" gap={2}>
                    <TextField
                      label="Custom Prefix"
                      value={customization.customPrefix}
                      onChange={(e) => setCustomization(prev => ({ 
                        ...prev, 
                        customPrefix: e.target.value 
                      }))}
                      size="small"
                      placeholder="e.g., LAB_"
                    />
                    <TextField
                      label="Custom Color"
                      value={customization.customColor}
                      onChange={(e) => setCustomization(prev => ({ 
                        ...prev, 
                        customColor: e.target.value 
                      }))}
                      size="small"
                      placeholder="#FF6B6B"
                    />
                  </Box>
                  
                  <Box display="flex" gap={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={customization.includeStatusBlocks}
                          onChange={(e) => setCustomization(prev => ({ 
                            ...prev, 
                            includeStatusBlocks: e.target.checked 
                          }))}
                        />
                      }
                      label="Include Status Blocks"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={customization.includeConfigBlocks}
                          onChange={(e) => setCustomization(prev => ({ 
                            ...prev, 
                            includeConfigBlocks: e.target.checked 
                          }))}
                        />
                      }
                      label="Include Config Blocks"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={customization.includeUtilityBlocks}
                          onChange={(e) => setCustomization(prev => ({ 
                            ...prev, 
                            includeUtilityBlocks: e.target.checked 
                          }))}
                        />
                      }
                      label="Include Utility Blocks"
                    />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Block Selection */}
            <Box mt={2} mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">
                  Generated Blocks ({selectedBlocks.size} of {generatedBlocks.blocks.length} selected)
                </Typography>
                <Box display="flex" gap={1}>
                  <Button size="small" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button size="small" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </Box>
              </Box>

              {previewMode === 'visual' ? (
                <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                  {generatedBlocks.blocks.map((block: BlocklyBlock) => 
                    renderBlockPreview(block)
                  )}
                </Box>
              ) : (
                renderCodePreview()
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {generatedBlocks && (
          <>
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={selectedBlocks.size === 0}
            >
              Export JSON
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleApplyToWorkspace}
              disabled={selectedBlocks.size === 0}
            >
              Add to Workspace
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
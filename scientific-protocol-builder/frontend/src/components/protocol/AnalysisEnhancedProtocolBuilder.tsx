import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  Chip,
  Alert,
  Drawer,
  Button,
  Tooltip,
  Badge,
  Fab,
  Zoom,
} from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Assessment as AssessmentIcon,
  BugReport as BugReportIcon,
  Speed as SpeedIcon,
  Close as CloseIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import Blockly from 'blockly';
import { useCollaboration } from '../collaboration/CollaborationProvider';
import { CollaborationPanel } from '../collaboration/CollaborationPanel';
import { CollaborativeCursors } from '../collaboration/UserCursor';
import { ProtocolAnalysisPanel } from '../analysis/ProtocolAnalysisPanel';
import { Operation } from '../../services/collaborationService';
import { ProtocolAnalysis } from '../../services/protocolAnalysisService';

interface AnalysisEnhancedProtocolBuilderProps {
  protocolId: string;
  protocolData?: any;
  protocolName?: string;
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

export const AnalysisEnhancedProtocolBuilder: React.FC<AnalysisEnhancedProtocolBuilderProps> = ({
  protocolId,
  protocolData,
  protocolName,
  onSave,
  readOnly = false,
}) => {
  const {
    isConnected,
    connectedUsers,
    sendOperation,
    lockElement,
    unlockElement,
    lockedElements,
    updatePresence,
    userPresence,
    currentProtocolId,
  } = useCollaboration();

  const blocklyDiv = useRef<HTMLDivElement>(null);
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentlyEditing, setCurrentlyEditing] = useState<string | null>(null);
  const [localVersion, setLocalVersion] = useState(0);
  
  // Analysis features
  const [analysisDrawerOpen, setAnalysisDrawerOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ProtocolAnalysis | null>(null);
  const [analysisAlerts, setAnalysisAlerts] = useState<{
    critical: number;
    warnings: number;
    suggestions: number;
  }>({ critical: 0, warnings: 0, suggestions: 0 });
  const [showAnalysisFab, setShowAnalysisFab] = useState(true);

  // Auto-analysis on changes
  const [lastChangeTime, setLastChangeTime] = useState<number>(0);
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(true);
  const autoAnalysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse tracking for cursor sharing
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isConnected || currentProtocolId !== protocolId) return;

    const rect = blocklyDiv.current?.getBoundingClientRect();
    if (!rect) return;

    const cursor = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    updatePresence({ cursor });
  }, [isConnected, currentProtocolId, protocolId, updatePresence]);

  // Initialize Blockly workspace with analysis integration
  useEffect(() => {
    if (!blocklyDiv.current || isInitialized) return;

    try {
      const toolboxXml = `
        <xml id="toolbox" style="display: none">
          <category name="Variables" colour="#FF6B6B">
            <block type="sample_variable"></block>
            <block type="reagent_variable"></block>
            <block type="equipment_variable"></block>
            <block type="parameter_variable"></block>
          </category>
          <category name="Experiment Steps" colour="#4ECDC4">
            <block type="preparation_step"></block>
            <block type="mixing_step"></block>
            <block type="incubation_step"></block>
            <block type="measurement_step"></block>
            <block type="transfer_step"></block>
            <block type="centrifuge_step"></block>
            <block type="wash_step"></block>
            <block type="observation_step"></block>
          </category>
          <category name="Control Flow" colour="#45B7D1">
            <block type="controls_if"></block>
            <block type="controls_repeat_ext"></block>
            <block type="controls_whileUntil"></block>
            <block type="controls_for"></block>
          </category>
          <category name="Protocol Management" colour="#96CEB4">
            <block type="protocol_definition"></block>
            <block type="protocol_call"></block>
            <block type="quality_control"></block>
          </category>
          <category name="Analysis & Quality" colour="#9C27B0">
            <block type="validation_checkpoint"></block>
            <block type="risk_assessment"></block>
            <block type="optimization_point"></block>
            <block type="dependency_marker"></block>
          </category>
        </xml>
      `;

      const workspaceConfig = {
        toolbox: toolboxXml,
        collapse: true,
        comments: true,
        disable: false,
        maxBlocks: Infinity,
        trashcan: true,
        horizontalLayout: false,
        toolboxPosition: 'start',
        css: true,
        media: 'https://blockly-demo.appspot.com/static/media/',
        rtl: false,
        scrollbars: true,
        sounds: true,
        oneBasedIndex: true,
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true,
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
        },
        readOnly: readOnly,
      };

      const newWorkspace = Blockly.inject(blocklyDiv.current, workspaceConfig);
      setWorkspace(newWorkspace);

      // Load existing protocol data
      if (protocolData?.blocklyXml) {
        const xml = Blockly.Xml.textToDom(protocolData.blocklyXml);
        Blockly.Xml.domToWorkspace(xml, newWorkspace);
      }

      // Set up event listeners for collaborative editing and analysis
      if (!readOnly) {
        setupCollaborativeListeners(newWorkspace);
        setupAnalysisListeners(newWorkspace);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Blockly workspace:', error);
    }
  }, [blocklyDiv, isInitialized, protocolData, readOnly]);

  // Set up collaborative event listeners
  const setupCollaborativeListeners = (workspace: Blockly.WorkspaceSvg) => {
    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (event.isUiEvent || !isConnected || currentProtocolId !== protocolId) return;

      const operation = convertBlocklyEventToOperation(event);
      if (operation) {
        sendOperation(operation);
      }
    });

    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (event.type === Blockly.Events.SELECTED) {
        const selectedEvent = event as Blockly.Events.Selected;
        
        if (selectedEvent.newElementId && selectedEvent.newElementId !== currentlyEditing) {
          if (currentlyEditing) {
            unlockElement(currentlyEditing);
          }
          
          lockElement(selectedEvent.newElementId);
          setCurrentlyEditing(selectedEvent.newElementId);
        } else if (!selectedEvent.newElementId && currentlyEditing) {
          unlockElement(currentlyEditing);
          setCurrentlyEditing(null);
        }
      }
    });
  };

  // Set up analysis event listeners
  const setupAnalysisListeners = (workspace: Blockly.WorkspaceSvg) => {
    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (event.isUiEvent) return;

      // Track changes for auto-analysis
      setLastChangeTime(Date.now());
      
      // Debounced auto-analysis
      if (autoAnalysisEnabled) {
        if (autoAnalysisTimeoutRef.current) {
          clearTimeout(autoAnalysisTimeoutRef.current);
        }
        
        autoAnalysisTimeoutRef.current = setTimeout(() => {
          triggerAutoAnalysis();
        }, 2000); // Analyze 2 seconds after last change
      }
    });
  };

  // Convert Blockly events to collaboration operations
  const convertBlocklyEventToOperation = (event: Blockly.Events.Abstract): Omit<Operation, 'userId' | 'appliedAt' | 'version'> | null => {
    const baseOperation = {
      id: event.blockId || `op_${Date.now()}`,
      baseVersion: localVersion,
      elementId: event.blockId || '',
    };

    switch (event.type) {
      case Blockly.Events.BLOCK_CREATE:
        const createEvent = event as Blockly.Events.BlockCreate;
        return {
          ...baseOperation,
          type: 'insert' as const,
          data: {
            xml: createEvent.xml,
            ids: createEvent.ids,
          },
        };

      case Blockly.Events.BLOCK_DELETE:
        const deleteEvent = event as Blockly.Events.BlockDelete;
        return {
          ...baseOperation,
          type: 'delete' as const,
          data: {
            xml: deleteEvent.xml,
            ids: deleteEvent.ids,
          },
        };

      case Blockly.Events.BLOCK_CHANGE:
        const changeEvent = event as Blockly.Events.BlockChange;
        return {
          ...baseOperation,
          type: 'update' as const,
          property: changeEvent.element,
          data: {
            oldValue: changeEvent.oldValue,
            newValue: changeEvent.newValue,
          },
        };

      case Blockly.Events.BLOCK_MOVE:
        const moveEvent = event as Blockly.Events.BlockMove;
        return {
          ...baseOperation,
          type: 'move' as const,
          data: {
            oldParentId: moveEvent.oldParentId,
            newParentId: moveEvent.newParentId,
            oldInputName: moveEvent.oldInputName,
            newInputName: moveEvent.newInputName,
            oldCoordinate: moveEvent.oldCoordinate,
            newCoordinate: moveEvent.newCoordinate,
          },
        };

      default:
        return null;
    }
  };

  // Auto-analysis trigger
  const triggerAutoAnalysis = async () => {
    // This would trigger a lightweight analysis in the background
    // For now, we'll just update the alerts counter
    setAnalysisAlerts(prev => ({
      ...prev,
      suggestions: prev.suggestions + 1
    }));
  };

  // Analysis event handlers
  const handleAnalysisComplete = (analysis: ProtocolAnalysis) => {
    setCurrentAnalysis(analysis);
    
    // Update alerts based on analysis results
    setAnalysisAlerts({
      critical: analysis.criticalIssues.length,
      warnings: analysis.validation.warnings.length,
      suggestions: analysis.recommendations.length
    });
  };

  const handleOpenAnalysis = () => {
    setAnalysisDrawerOpen(true);
    setShowAnalysisFab(false);
  };

  const handleCloseAnalysis = () => {
    setAnalysisDrawerOpen(false);
    setShowAnalysisFab(true);
  };

  // Set up mouse tracking
  useEffect(() => {
    const div = blocklyDiv.current;
    if (!div) return;

    div.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      div.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  // Cleanup auto-analysis timeout
  useEffect(() => {
    return () => {
      if (autoAnalysisTimeoutRef.current) {
        clearTimeout(autoAnalysisTimeoutRef.current);
      }
    };
  }, []);

  // Save protocol
  const handleSave = useCallback(async () => {
    if (!workspace || !onSave) return;

    try {
      const xml = Blockly.Xml.workspaceToDom(workspace);
      const xmlText = Blockly.Xml.domToText(xml);
      
      const protocolData = {
        blocklyXml: xmlText,
        version: localVersion,
        lastModified: new Date().toISOString(),
        analysis: currentAnalysis ? {
          lastAnalyzed: currentAnalysis.analyzedAt,
          score: currentAnalysis.reliability,
          complexity: currentAnalysis.complexity,
          criticalIssues: currentAnalysis.criticalIssues.length
        } : undefined
      };

      await onSave(protocolData);
    } catch (error) {
      console.error('Failed to save protocol:', error);
    }
  }, [workspace, onSave, localVersion, currentAnalysis]);

  // Workspace controls
  const handleUndo = () => workspace?.undo(false);
  const handleRedo = () => workspace?.undo(true);
  const handleZoomIn = () => workspace?.zoomCenter(1.2);
  const handleZoomOut = () => workspace?.zoomCenter(0.8);
  const handleCenter = () => workspace?.scrollCenter();

  const isCollaborationActive = isConnected && currentProtocolId === protocolId;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Collaboration status */}
      {isCollaborationActive && (
        <Alert 
          severity="info" 
          sx={{ mb: 1 }}
          action={
            <Chip 
              label={`${connectedUsers.length} user${connectedUsers.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
            />
          }
        >
          Collaborative editing active
        </Alert>
      )}

      {/* Analysis status */}
      {(analysisAlerts.critical > 0 || analysisAlerts.warnings > 0) && (
        <Alert 
          severity={analysisAlerts.critical > 0 ? 'error' : 'warning'}
          sx={{ mb: 1 }}
          action={
            <Button color="inherit" onClick={handleOpenAnalysis}>
              View Analysis
            </Button>
          }
        >
          {analysisAlerts.critical > 0 && `${analysisAlerts.critical} critical issue${analysisAlerts.critical !== 1 ? 's' : ''}`}
          {analysisAlerts.critical > 0 && analysisAlerts.warnings > 0 && ', '}
          {analysisAlerts.warnings > 0 && `${analysisAlerts.warnings} warning${analysisAlerts.warnings !== 1 ? 's' : ''}`}
          {' found in protocol'}
        </Alert>
      )}

      {/* Toolbar */}
      <Paper elevation={1}>
        <Toolbar variant="dense">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Protocol Builder
            {protocolName && (
              <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                - {protocolName}
              </Typography>
            )}
          </Typography>
          
          <IconButton onClick={handleSave} disabled={readOnly}>
            <SaveIcon />
          </IconButton>
          <IconButton onClick={handleUndo} disabled={readOnly}>
            <UndoIcon />
          </IconButton>
          <IconButton onClick={handleRedo} disabled={readOnly}>
            <RedoIcon />
          </IconButton>
          <IconButton onClick={handleZoomIn}>
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={handleZoomOut}>
            <ZoomOutIcon />
          </IconButton>
          <IconButton onClick={handleCenter}>
            <CenterIcon />
          </IconButton>
          
          <Tooltip title="Open Protocol Analysis">
            <IconButton onClick={handleOpenAnalysis} color="primary">
              <Badge 
                badgeContent={analysisAlerts.critical + analysisAlerts.warnings} 
                color={analysisAlerts.critical > 0 ? 'error' : 'warning'}
                invisible={analysisAlerts.critical + analysisAlerts.warnings === 0}
              >
                <AssessmentIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Paper>

      {/* Main content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Collaboration panel */}
        {isCollaborationActive && (
          <Box sx={{ width: 300, p: 1, borderRight: 1, borderColor: 'divider' }}>
            <CollaborationPanel protocolId={protocolId} protocolTitle={protocolName} />
          </Box>
        )}

        {/* Blockly workspace */}
        <Box 
          sx={{ 
            flex: 1, 
            position: 'relative',
            '& .blocklyDiv': {
              height: '100% !important',
              width: '100% !important',
            }
          }}
        >
          <div 
            ref={blocklyDiv} 
            style={{ height: '100%', width: '100%' }}
          />
          
          {/* Collaborative cursors */}
          {isCollaborationActive && (
            <CollaborativeCursors 
              users={connectedUsers.filter(u => u.userId !== currentlyEditing)}
              userPresence={userPresence}
            />
          )}

          {/* Analysis Floating Action Button */}
          <Zoom in={showAnalysisFab}>
            <Fab
              color="primary"
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                zIndex: 1000,
              }}
              onClick={handleOpenAnalysis}
            >
              <Badge 
                badgeContent={analysisAlerts.critical + analysisAlerts.warnings + analysisAlerts.suggestions} 
                color={analysisAlerts.critical > 0 ? 'error' : analysisAlerts.warnings > 0 ? 'warning' : 'info'}
                invisible={analysisAlerts.critical + analysisAlerts.warnings + analysisAlerts.suggestions === 0}
              >
                <AnalyticsIcon />
              </Badge>
            </Fab>
          </Zoom>
        </Box>
      </Box>

      {/* Analysis Drawer */}
      <Drawer
        anchor="right"
        open={analysisDrawerOpen}
        onClose={handleCloseAnalysis}
        PaperProps={{
          sx: { width: '50%', minWidth: 600 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Protocol Analysis
          </Typography>
          <IconButton onClick={handleCloseAnalysis}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <ProtocolAnalysisPanel 
            protocolId={protocolId}
            protocolName={protocolName}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </Box>
      </Drawer>
    </Box>
  );
};
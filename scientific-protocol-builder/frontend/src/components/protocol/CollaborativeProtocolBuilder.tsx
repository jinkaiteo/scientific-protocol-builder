import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Paper, Toolbar, IconButton, Typography, Chip, Alert } from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
} from '@mui/icons-material';
import Blockly from 'blockly';
import { useCollaboration } from '../collaboration/CollaborationProvider';
import { CollaborationPanel } from '../collaboration/CollaborationPanel';
import { CollaborativeCursors } from '../collaboration/UserCursor';
import { Operation } from '../../services/collaborationService';

interface CollaborativeProtocolBuilderProps {
  protocolId: string;
  protocolData?: any;
  onSave?: (data: any) => void;
  readOnly?: boolean;
}

export const CollaborativeProtocolBuilder: React.FC<CollaborativeProtocolBuilderProps> = ({
  protocolId,
  protocolData,
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
  const [operationQueue, setOperationQueue] = useState<Operation[]>([]);
  const [localVersion, setLocalVersion] = useState(0);

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

  // Initialize Blockly workspace
  useEffect(() => {
    if (!blocklyDiv.current || isInitialized) return;

    try {
      // Define custom blocks for scientific protocols
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

      // Set up event listeners for collaborative editing
      if (!readOnly) {
        setupCollaborativeListeners(newWorkspace);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Blockly workspace:', error);
    }
  }, [blocklyDiv, isInitialized, protocolData, readOnly]);

  // Set up collaborative event listeners
  const setupCollaborativeListeners = (workspace: Blockly.WorkspaceSvg) => {
    // Listen for block changes
    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (event.isUiEvent || !isConnected || currentProtocolId !== protocolId) return;

      // Convert Blockly event to collaboration operation
      const operation = convertBlocklyEventToOperation(event);
      if (operation) {
        sendOperation(operation);
      }
    });

    // Listen for block selection
    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (event.type === Blockly.Events.SELECTED) {
        const selectedEvent = event as Blockly.Events.Selected;
        
        if (selectedEvent.newElementId && selectedEvent.newElementId !== currentlyEditing) {
          // Try to lock the newly selected block
          if (currentlyEditing) {
            unlockElement(currentlyEditing);
          }
          
          lockElement(selectedEvent.newElementId);
          setCurrentlyEditing(selectedEvent.newElementId);
        } else if (!selectedEvent.newElementId && currentlyEditing) {
          // Deselected - unlock the current block
          unlockElement(currentlyEditing);
          setCurrentlyEditing(null);
        }
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

  // Apply incoming operations from other users
  const applyIncomingOperation = useCallback((operation: Operation) => {
    if (!workspace) return;

    try {
      // Temporarily disable event firing to prevent recursive operations
      Blockly.Events.disable();

      switch (operation.type) {
        case 'insert':
          if (operation.data?.xml) {
            const xml = Blockly.Xml.textToDom(operation.data.xml);
            Blockly.Xml.domToWorkspace(xml, workspace);
          }
          break;

        case 'delete':
          if (operation.elementId) {
            const block = workspace.getBlockById(operation.elementId);
            if (block) {
              block.dispose();
            }
          }
          break;

        case 'update':
          if (operation.elementId && operation.data?.newValue !== undefined) {
            const block = workspace.getBlockById(operation.elementId);
            if (block && operation.property) {
              // Update block property
              (block as any)[operation.property] = operation.data.newValue;
            }
          }
          break;

        case 'move':
          if (operation.elementId && operation.data) {
            const block = workspace.getBlockById(operation.elementId);
            if (block && operation.data.newCoordinate) {
              block.moveBy(
                operation.data.newCoordinate.x - (operation.data.oldCoordinate?.x || 0),
                operation.data.newCoordinate.y - (operation.data.oldCoordinate?.y || 0)
              );
            }
          }
          break;
      }

      // Update local version
      if (operation.version) {
        setLocalVersion(operation.version);
      }
    } catch (error) {
      console.error('Failed to apply incoming operation:', error);
    } finally {
      Blockly.Events.enable();
    }
  }, [workspace]);

  // Listen for incoming operations
  useEffect(() => {
    // This would be handled by the CollaborationProvider
    // The actual implementation would listen to operation events
  }, [applyIncomingOperation]);

  // Set up mouse tracking
  useEffect(() => {
    const div = blocklyDiv.current;
    if (!div) return;

    div.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      div.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

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
      };

      await onSave(protocolData);
    } catch (error) {
      console.error('Failed to save protocol:', error);
    }
  }, [workspace, onSave, localVersion]);

  // Workspace controls
  const handleUndo = () => {
    if (workspace) {
      workspace.undo(false);
    }
  };

  const handleRedo = () => {
    if (workspace) {
      workspace.undo(true);
    }
  };

  const handleZoomIn = () => {
    if (workspace) {
      workspace.zoomCenter(1.2);
    }
  };

  const handleZoomOut = () => {
    if (workspace) {
      workspace.zoomCenter(0.8);
    }
  };

  const handleCenter = () => {
    if (workspace) {
      workspace.scrollCenter();
    }
  };

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

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Collaboration unavailable - working in offline mode
        </Alert>
      )}

      {/* Toolbar */}
      <Paper elevation={1}>
        <Toolbar variant="dense">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Protocol Builder
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
        </Toolbar>
      </Paper>

      {/* Main content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Collaboration panel */}
        {isCollaborationActive && (
          <Box sx={{ width: 300, p: 1, borderRight: 1, borderColor: 'divider' }}>
            <CollaborationPanel protocolId={protocolId} />
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

          {/* Locked element overlays */}
          {lockedElements.size > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 100,
              }}
            >
              {/* Visual indicators for locked elements would go here */}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
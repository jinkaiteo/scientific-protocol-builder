import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Zoom,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  Fab,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Menu as MenuIcon,
  TouchApp as TouchIcon,
  Gesture as GestureIcon,
} from '@mui/icons-material';
import Blockly from 'blockly';

interface MobileBlocklyWorkspaceProps {
  protocolId: string;
  initialContent?: any;
  onChange?: (content: any) => void;
  readOnly?: boolean;
  isMobile?: boolean;
  onToolboxToggle?: () => void;
}

export const MobileBlocklyWorkspace: React.FC<MobileBlocklyWorkspaceProps> = ({
  protocolId,
  initialContent,
  onChange,
  readOnly = false,
  isMobile = false,
  onToolboxToggle,
}) => {
  const theme = useTheme();
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Touch handling state
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const [touchCount, setTouchCount] = useState(0);
  const [pinchStartDistance, setPinchStartDistance] = useState(0);
  const [pinchStartZoom, setPinchStartZoom] = useState(1.0);

  // Initialize mobile-optimized Blockly workspace
  useEffect(() => {
    if (!blocklyDiv.current || isInitialized) return;

    try {
      // Mobile-optimized toolbox with larger touch targets
      const toolboxXml = `
        <xml id="toolbox" style="display: none">
          <category name="🧪 Experiment" colour="#4ECDC4" expanded="true">
            <block type="preparation_step">
              <field name="NAME">Sample Preparation</field>
            </block>
            <block type="mixing_step">
              <field name="NAME">Mix Components</field>
            </block>
            <block type="incubation_step">
              <field name="NAME">Incubate</field>
            </block>
            <block type="measurement_step">
              <field name="NAME">Measure</field>
            </block>
          </category>
          <category name="🔬 Instruments" colour="#FF6B6B">
            <block type="centrifuge_step">
              <field name="NAME">Centrifuge</field>
            </block>
            <block type="microscope_step">
              <field name="NAME">Microscope</field>
            </block>
            <block type="balance_step">
              <field name="NAME">Balance</field>
            </block>
          </category>
          <category name="🔄 Control" colour="#45B7D1">
            <block type="controls_if"></block>
            <block type="controls_repeat_ext">
              <value name="TIMES">
                <shadow type="math_number">
                  <field name="NUM">3</field>
                </shadow>
              </value>
            </block>
            <block type="controls_whileUntil"></block>
          </category>
          <category name="📊 Variables" colour="#96CEB4">
            <block type="variables_get"></block>
            <block type="variables_set"></block>
            <block type="math_number">
              <field name="NUM">0</field>
            </block>
            <block type="text">
              <field name="TEXT"></field>
            </block>
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
        sounds: false, // Disable sounds for mobile
        oneBasedIndex: true,
        
        // Mobile-optimized grid and zoom
        grid: {
          spacing: isMobile ? 25 : 20, // Larger spacing for mobile
          length: 3,
          colour: '#ccc',
          snap: true,
        },
        zoom: {
          controls: false, // We'll implement custom zoom controls
          wheel: false, // Disable mouse wheel zoom
          startScale: isMobile ? 0.8 : 1.0, // Start smaller on mobile
          maxScale: isMobile ? 2.0 : 3.0,
          minScale: 0.2,
          scaleSpeed: 1.2,
          pinch: true, // Enable pinch zoom
        },
        
        // Mobile-specific configurations
        move: {
          scrollbars: {
            horizontal: true,
            vertical: true
          },
          drag: true,
          wheel: false
        },
        
        readOnly: readOnly,
      };

      const newWorkspace = Blockly.inject(blocklyDiv.current, workspaceConfig);
      setWorkspace(newWorkspace);

      // Load initial content
      if (initialContent) {
        try {
          if (typeof initialContent === 'string') {
            const xml = Blockly.Xml.textToDom(initialContent);
            Blockly.Xml.domToWorkspace(xml, newWorkspace);
          } else if (initialContent.blocklyXml) {
            const xml = Blockly.Xml.textToDom(initialContent.blocklyXml);
            Blockly.Xml.domToWorkspace(xml, newWorkspace);
          }
        } catch (error) {
          console.error('Failed to load initial content:', error);
        }
      }

      // Set up event listeners
      if (!readOnly) {
        setupMobileEventListeners(newWorkspace);
      }

      // Set up touch handling
      setupTouchHandling(newWorkspace);

      setIsInitialized(true);
      setZoomLevel(newWorkspace.scale);

    } catch (error) {
      console.error('Failed to initialize mobile Blockly workspace:', error);
    }
  }, [blocklyDiv, isInitialized, initialContent, readOnly, isMobile]);

  // Set up mobile-optimized event listeners
  const setupMobileEventListeners = (workspace: Blockly.WorkspaceSvg) => {
    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (event.isUiEvent) return;

      // Update undo/redo state
      setCanUndo(workspace.undoStack_.length > 0);
      setCanRedo(workspace.redoStack_.length > 0);

      // Notify parent of changes
      if (onChange) {
        try {
          const xml = Blockly.Xml.workspaceToDom(workspace);
          const xmlText = Blockly.Xml.domToText(xml);
          onChange({ blocklyXml: xmlText });
        } catch (error) {
          console.error('Failed to serialize workspace:', error);
        }
      }
    });

    // Handle zoom changes
    workspace.addChangeListener((event: Blockly.Events.Abstract) => {
      if (event.type === Blockly.Events.VIEWPORT_CHANGE) {
        setZoomLevel(workspace.scale);
      }
    });
  };

  // Set up touch handling for mobile gestures
  const setupTouchHandling = (workspace: Blockly.WorkspaceSvg) => {
    const svg = workspace.getParentSvg();
    
    // Handle touch events for gestures
    svg.addEventListener('touchstart', handleTouchStart, { passive: false });
    svg.addEventListener('touchmove', handleTouchMove, { passive: false });
    svg.addEventListener('touchend', handleTouchEnd, { passive: false });
  };

  // Touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    const touches = e.touches;
    setTouchCount(touches.length);
    
    if (touches.length === 2) {
      // Start pinch zoom
      const distance = getDistance(touches[0], touches[1]);
      setPinchStartDistance(distance);
      setPinchStartZoom(zoomLevel);
    } else if (touches.length === 1) {
      // Check for double tap
      const now = Date.now();
      if (now - lastTouchTime < 300) {
        handleDoubleTap(touches[0]);
      }
      setLastTouchTime(now);
    }
  }, [zoomLevel, lastTouchTime]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    const touches = e.touches;
    
    if (touches.length === 2 && pinchStartDistance > 0) {
      // Handle pinch zoom
      const distance = getDistance(touches[0], touches[1]);
      const scale = (distance / pinchStartDistance) * pinchStartZoom;
      
      // Clamp zoom level
      const clampedScale = Math.max(0.2, Math.min(2.0, scale));
      
      if (workspace) {
        workspace.setScale(clampedScale);
        setZoomLevel(clampedScale);
      }
    }
  }, [workspace, pinchStartDistance, pinchStartZoom]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 0) {
      setPinchStartDistance(0);
      setTouchCount(0);
    }
  }, []);

  // Handle double tap to zoom
  const handleDoubleTap = useCallback((touch: Touch) => {
    if (!workspace) return;
    
    // Toggle between fit and 1.0 zoom
    const currentScale = workspace.scale;
    const targetScale = currentScale > 1.0 ? 0.8 : 1.5;
    
    workspace.setScale(targetScale);
    setZoomLevel(targetScale);
  }, [workspace]);

  // Get distance between two touch points
  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Workspace control methods
  const handleZoomIn = useCallback(() => {
    if (!workspace) return;
    const newScale = Math.min(2.0, zoomLevel * 1.2);
    workspace.setScale(newScale);
    setZoomLevel(newScale);
  }, [workspace, zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (!workspace) return;
    const newScale = Math.max(0.2, zoomLevel / 1.2);
    workspace.setScale(newScale);
    setZoomLevel(newScale);
  }, [workspace, zoomLevel]);

  const handleZoomFit = useCallback(() => {
    if (!workspace) return;
    workspace.zoomToFit();
    setZoomLevel(workspace.scale);
  }, [workspace]);

  const handleUndo = useCallback(() => {
    if (!workspace || !canUndo) return;
    workspace.undo(false);
  }, [workspace, canUndo]);

  const handleRedo = useCallback(() => {
    if (!workspace || !canRedo) return;
    workspace.undo(true);
  }, [workspace, canRedo]);

  // Speed dial actions for mobile controls
  const speedDialActions = [
    {
      icon: <UndoIcon />,
      name: 'Undo',
      onClick: handleUndo,
      disabled: !canUndo
    },
    {
      icon: <RedoIcon />,
      name: 'Redo',
      onClick: handleRedo,
      disabled: !canRedo
    },
    {
      icon: <ZoomInIcon />,
      name: 'Zoom In',
      onClick: handleZoomIn
    },
    {
      icon: <ZoomOutIcon />,
      name: 'Zoom Out',
      onClick: handleZoomOut
    },
    {
      icon: <CenterIcon />,
      name: 'Fit to Screen',
      onClick: handleZoomFit
    }
  ];

  return (
    <Box 
      sx={{ 
        height: '100%', 
        width: '100%', 
        position: 'relative',
        overflow: 'hidden',
        '& .blocklyDiv': {
          height: '100% !important',
          width: '100% !important',
        },
        '& .blocklyToolboxDiv': {
          display: 'none !important', // Hide default toolbox on mobile
        },
        // Mobile-optimized block styling
        '& .blocklyBlockCanvas .blocklyDraggable': {
          cursor: 'pointer !important',
        },
        '& .blocklyText': {
          fontSize: isMobile ? '14px !important' : '11px !important',
        },
        // Larger touch targets for mobile
        '& .blocklyIconGroup': {
          transform: isMobile ? 'scale(1.2)' : 'scale(1)',
        }
      }}
    >
      {/* Blockly workspace container */}
      <div 
        ref={blocklyDiv} 
        style={{ 
          height: '100%', 
          width: '100%',
          touchAction: 'none', // Prevent default touch behaviors
        }}
      />

      {/* Toolbox toggle button for mobile */}
      {isMobile && onToolboxToggle && (
        <Fab
          size="medium"
          color="primary"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1000,
          }}
          onClick={onToolboxToggle}
        >
          <MenuIcon />
        </Fab>
      )}

      {/* Mobile control speed dial */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Workspace Controls"
          sx={{ 
            position: 'absolute', 
            bottom: 16, 
            left: 16,
            zIndex: 999,
            '& .MuiSpeedDial-fab': {
              width: 48,
              height: 48,
            }
          }}
          icon={<SpeedDialIcon icon={<GestureIcon />} openIcon={<TouchIcon />} />}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.onClick}
              FabProps={{ 
                disabled: action.disabled,
                size: 'small'
              }}
            />
          ))}
        </SpeedDial>
      )}

      {/* Desktop controls (when not mobile) */}
      {!isMobile && (
        <Paper
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
          }}
          elevation={2}
        >
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit to Screen">
            <IconButton onClick={handleZoomFit} size="small">
              <CenterIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Undo">
            <IconButton onClick={handleUndo} disabled={!canUndo} size="small">
              <UndoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton onClick={handleRedo} disabled={!canRedo} size="small">
              <RedoIcon />
            </IconButton>
          </Tooltip>
        </Paper>
      )}

      {/* Zoom level indicator */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: isMobile ? 80 : 16,
          right: 16,
          px: 2,
          py: 1,
          zIndex: 999,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
        }}
        elevation={2}
      >
        <Typography variant="caption">
          {Math.round(zoomLevel * 100)}%
        </Typography>
      </Paper>

      {/* Touch instruction overlay (shown initially on mobile) */}
      {isMobile && !isInitialized && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'text.secondary',
            zIndex: 1001,
          }}
        >
          <TouchIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="body2">
            Tap to open toolbox<br />
            Pinch to zoom<br />
            Double-tap to focus
          </Typography>
        </Box>
      )}
    </Box>
  );
};
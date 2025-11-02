import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Toolbar,
  AppBar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
} from '@mui/icons-material';
import * as Blockly from 'blockly';

const ProtocolBuilder: React.FC = () => {
  const { protocolId } = useParams();
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      // Initialize Blockly workspace
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: {
          kind: 'categoryToolbox',
          contents: [
            {
              kind: 'category',
              name: 'Basic Steps',
              colour: '#5C7CFA',
              contents: [
                {
                  kind: 'block',
                  type: 'text',
                },
              ],
            },
            {
              kind: 'category',
              name: 'Laboratory',
              colour: '#51CF66',
              contents: [
                {
                  kind: 'block',
                  type: 'text',
                },
              ],
            },
            {
              kind: 'category',
              name: 'Measurements',
              colour: '#FF8787',
              contents: [
                {
                  kind: 'block',
                  type: 'math_number',
                },
              ],
            },
            {
              kind: 'category',
              name: 'Control Flow',
              colour: '#FFD43B',
              contents: [
                {
                  kind: 'block',
                  type: 'controls_if',
                },
                {
                  kind: 'block',
                  type: 'controls_repeat_ext',
                },
              ],
            },
          ],
        },
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
        trashcan: true,
      });
    }

    return () => {
      if (workspace.current) {
        workspace.current.dispose();
        workspace.current = null;
      }
    };
  }, []);

  const handleSave = () => {
    if (workspace.current) {
      const xml = Blockly.Xml.workspaceToDom(workspace.current);
      const xmlText = Blockly.Xml.domToText(xml);
      console.log('Saving protocol:', xmlText);
      // TODO: Implement save functionality
    }
  };

  const handleRun = () => {
    console.log('Running protocol simulation...');
    // TODO: Implement protocol execution/simulation
  };

  const handleExport = () => {
    console.log('Exporting protocol...');
    // TODO: Implement export functionality
  };

  const handleImport = () => {
    console.log('Importing protocol...');
    // TODO: Implement import functionality
  };

  const handleUndo = () => {
    if (workspace.current) {
      workspace.current.undo(false);
    }
  };

  const handleRedo = () => {
    if (workspace.current) {
      workspace.current.undo(true);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Protocol Builder {protocolId ? `- Protocol ${protocolId}` : '- New Protocol'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Undo">
              <IconButton onClick={handleUndo} size="small">
                <UndoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Redo">
              <IconButton onClick={handleRedo} size="small">
                <RedoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Import Protocol">
              <IconButton onClick={handleImport} size="small">
                <UploadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Protocol">
              <IconButton onClick={handleExport} size="small">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              onClick={handleRun}
              size="small"
            >
              Simulate
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              size="small"
            >
              Save
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        <Paper
          sx={{
            flexGrow: 1,
            height: '100%',
            borderRadius: 0,
          }}
        >
          <div
            ref={blocklyDiv}
            style={{
              height: '100%',
              width: '100%',
            }}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default ProtocolBuilder;
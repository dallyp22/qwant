import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Container, CssBaseline, ThemeProvider, createTheme, Paper } from '@mui/material';
import CircuitEditor from './components/CircuitEditor';
import VisualizationPanel from './components/VisualizationPanel';
import AdvancedControls from './components/AdvancedControls';
import CircuitDiagram from './components/CircuitDiagram';
import { QuantumStateProvider } from './context/QuantumStateContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const AppContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'row',
  gap: '2rem',
  padding: '2rem',
  height: '100vh',
  '@media (max-width: 960px)': {
    flexDirection: 'column',
  },
});

const Panel = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  minWidth: 0,
  maxHeight: '100%',
  overflowY: 'auto',
});

const ResizeHandle = styled(Box)(({ theme }) => ({
  height: '8px',
  backgroundColor: theme.palette.grey[200],
  cursor: 'row-resize',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
  margin: '-4px 0',
  zIndex: 1000,
  position: 'relative',
}));

const ModuleContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  transition: 'height 0.2s ease',
}));

function App() {
  const [editorHeight, setEditorHeight] = useState(300);
  const [diagramHeight, setDiagramHeight] = useState(300);
  const [controlsHeight, setControlsHeight] = useState(200);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  const handleMouseDown = (module: string) => (e: React.MouseEvent) => {
    setIsDragging(module);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const movementY = e.movementY;
    switch (isDragging) {
      case 'editor':
        setEditorHeight(prev => Math.max(200, prev + movementY));
        break;
      case 'diagram':
        setDiagramHeight(prev => Math.max(200, prev + movementY));
        break;
      case 'controls':
        setControlsHeight(prev => Math.max(100, prev + movementY));
        break;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // Add event listeners for mouse move and up
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QuantumStateProvider>
        <AppContainer maxWidth={false}>
          <Panel>
            <ModuleContainer style={{ height: editorHeight }}>
              <CircuitEditor />
            </ModuleContainer>
            <ResizeHandle onMouseDown={handleMouseDown('editor')} />
            
            <ModuleContainer style={{ height: diagramHeight }}>
              <CircuitDiagram />
            </ModuleContainer>
            <ResizeHandle onMouseDown={handleMouseDown('diagram')} />
            
            <ModuleContainer style={{ height: controlsHeight }}>
              <AdvancedControls />
            </ModuleContainer>
            <ResizeHandle onMouseDown={handleMouseDown('controls')} />
          </Panel>
          <Panel>
            <VisualizationPanel />
          </Panel>
        </AppContainer>
      </QuantumStateProvider>
    </ThemeProvider>
  );
}

export default App; 
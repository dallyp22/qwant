import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import CircuitEditor from './components/CircuitEditor';
import VisualizationPanel from './components/VisualizationPanel';
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
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QuantumStateProvider>
        <AppContainer maxWidth={false}>
          <Panel>
            <CircuitEditor />
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
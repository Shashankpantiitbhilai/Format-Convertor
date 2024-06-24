import React from 'react';
import { Typography, Container, createTheme, ThemeProvider } from '@mui/material';
import { styled } from '@mui/system';
import FileUpload from './components/fileUpload';
import { motion } from 'framer-motion';

// Create a custom theme with colorful options
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Purple color for primary elements
    },
    secondary: {
      main: '#f50057', // Pink color for secondary elements
    },
    error: {
      main: '#f44336', // Red color for error states
    },
    background: {
      default: '#f0f0f0', // Light gray background color
    },
  },
});

const RootContainer = styled(Container)({
  textAlign: 'center',
  paddingTop: theme.spacing(4), // Use theme spacing directly
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <RootContainer>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            Word to Table Converter
          </Typography>
        </motion.div>
        <FileUpload />
      </RootContainer>
    </ThemeProvider>
  );
}

export default App;

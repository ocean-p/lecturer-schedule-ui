import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import App from './App';
import { theme } from './utils/customTheme';
import { GoogleAuthProvider } from './utils/googleAuth';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <ThemeProvider theme={theme}>
      <GoogleAuthProvider>
        <App />
      </GoogleAuthProvider>
    </ThemeProvider>
  </Router>
);


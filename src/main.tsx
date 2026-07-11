import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import App from './App';
import './styles.css';

const savedTheme = localStorage.getItem('cryptopulse-theme');
const initialTheme = savedTheme === 'light' || savedTheme === 'dark'
  ? savedTheme
  : 'light';

document.documentElement.dataset.theme = initialTheme;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary locale="es">
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
);

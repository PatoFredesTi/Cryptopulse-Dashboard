import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary locale="es">
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { RideProvider } from './context/RideContext';
import { SocketProvider } from './context/SocketContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <RideProvider>
            <App />
            <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
          </RideProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

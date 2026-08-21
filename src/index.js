import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

reportWebVitals();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      const notifyUpdate = () => {
        if (registration.waiting) {
          window.__swWaiting = registration.waiting;
          window.dispatchEvent(new CustomEvent('swUpdateAvailable'));
        }
      };

      // Bereits wartender SW (z.B. bei erneutem Laden der Seite)
      if (registration.waiting) notifyUpdate();

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            notifyUpdate();
          }
        });
      });
    });
  });
}
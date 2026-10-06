import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Mount React application immediately
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}

// Safely register PWA service worker asynchronously without blocking render
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      try {
        registerSW({
          immediate: true,
          onNeedRefresh() {
            console.log('New content available, updating service worker...');
          },
          onOfflineReady() {
            console.log('App ready to work offline');
          },
          onRegisterError(error) {
            console.warn('Service worker registration failed:', error);
          },
        });
      } catch (err) {
        console.warn('PWA registration error:', err);
      }
    })
    .catch((err) => {
      console.warn('PWA register module failed to load:', err);
    });
}



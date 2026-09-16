import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import CompatibilityError from './components/CompatibilityError';
import { checkCryptoSupport } from './utils/compat';

const compat = checkCryptoSupport();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {compat.supported ? <App /> : <CompatibilityError reason={compat.reason} />}
    </ErrorBoundary>
  </StrictMode>,
);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import './styles.css';

// Enable scroll-reveal animations only when the browser supports them (content is never hidden otherwise).
if ('IntersectionObserver' in window) document.documentElement.classList.add('js-reveal');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

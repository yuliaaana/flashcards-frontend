import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; 
import './styles/index.css';
import MainApp from './MainApp'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <MainApp />
    </Router>
  </StrictMode>
);

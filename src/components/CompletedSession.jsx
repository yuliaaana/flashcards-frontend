import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/completedSession.css';

const CompletedSession = ({ onRestart }) => {
  const navigate = useNavigate();

  return (
    <div className="completed-session">
      <div className="completed-content">
        <h2>Learning Session Complete!</h2>
        <div className="completion-buttons">
          <button className="restart-btn" onClick={onRestart}>
            Restart Session
          </button>
          <button className="exit-btn" onClick={() => navigate('/homepage')}>
            Exit to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletedSession;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/completedSession.css';
import { useTranslation } from "react-i18next";
import "../i18n"; 

const CompletedSession = ({ onRestart }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("learn");

  return (
    <div className="completed-session">
      <div className="completed-content">
        <h2>{t("complete")}</h2>
        <div className="completion-buttons">
          <button className="restart-btn" onClick={onRestart}>
          {t("restart")}
          </button>
          <button className="exit-btn" onClick={() => navigate('/homepage')}>
          {t("exit")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletedSession;
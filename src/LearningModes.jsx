import React from "react";
import Header from './components/homepage/Header';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import './styles/learning.css';
import { useTranslation } from "react-i18next";
import "./i18n"; 

export default function LearningModes() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const location = useLocation();
  const deckName = location.state?.deckName || "";
  const { t, i18n } = useTranslation("learn");

  return (
    <>
      <Header />
    <div className="learning-modes-wrapper">
       <div className="learning-block"></div>
    <div className="learning-block learning-modes-container">
      <h2 className="ch-ttl">{t("chooseLearningMode")} {deckName ? ` ${t("for")} "${deckName}"` : ''}</h2>
      <div className="modes-list">
        <button className="mode-btn btn-conf" onClick={() => navigate(`/learn/${deckId}`)}>
          {t("flashcardMode")}
        </button>
        <button className="mode-btn btn-conf" onClick={() => navigate(`/learn/${deckId}/match`)}>
          {t("matchMode")}
        </button>
        <button className="mode-btn btn-conf" onClick={() => navigate(`/learn/${deckId}/written`)}>
          {t("writtenMode")}
        </button>
        <button className="mode-btn btn-conf" onClick={() => navigate(`/learn/${deckId}/test`)}>
          {t("testMode")}
        </button>
      </div>
    </div>
    <div className="learning-block"></div>
    </div> 
    </>
  );
}

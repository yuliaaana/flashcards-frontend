import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import "../../i18n"; // Підключаємо i18n

export default function RecentDeckCard({ deck }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("recent");

  const handleClick = () => {
    navigate(`/learn/${deck.deck.id}`);
  };

  const handleStudy = (event) => {
    event.stopPropagation();
    navigate(`/learn/${deck.deck.id}`);
  };

  return (
    <div className="card-recent cursor-pointer" onClick={handleClick}>
     
      <h5>{deck.deck.name}</h5>
      <p>Deck creator : {deck.deck.creator}</p>
      <p>Terms : {deck.deck.terms}</p>
      <button onClick={handleStudy} className="btn-study">{t("studyrecent")}</button>

    </div>
  );
}
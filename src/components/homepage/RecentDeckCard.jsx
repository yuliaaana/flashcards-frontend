import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import "../../i18n"; 
import '../../styles/recentdeck.css';

export default function RecentDeckCard({ deck }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("recent");

  console.log(deck);
  console.log(deck.deck.creator_id);

  const handleClick = () => {
    navigate(`/learn/${deck.deck.id}`);
  };

  const handleStudy = (event) => {
    event.stopPropagation();
    navigate(`/learn/${deck.deck.id}`);
  };

  const handleUserProfileClick = (event, userId) => {
    event.stopPropagation(); 
    if (deck.deck.creator_id) {
      console.log(deck.deck.creator_id);
      navigate(`/profile/${deck.deck.creator_id}`);
    } else {
      console.log('creator_id is undefined');
    }
  };

  return (
    <div className="card-recent cursor-pointer" onClick={handleClick}>
      <h5>{deck.deck.name}</h5>
      <p 
        onClick={(event) => handleUserProfileClick(event, deck.deck.creator_id)} 
        
      >
        {t("folders:createdBy")}<div className="user-link bold-on-hover">{deck.deck.creator}</div>
      </p>
      <p>{t("folders:terms")} {deck.deck.terms}</p>
      <button onClick={handleStudy} className="btn-study">{t("studyrecent")}</button>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../i18n";

export default function DeckCard({
  className,
  created_at,
  creator,
  name,
  terms,
  id,
}) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleStartStudying = () => {
    navigate(`/learn/${id}`);
  };

  const handleEditDeck = () => {
    navigate(`/edit-deck/${id}`);
  };

  return (
    <div className={className}>
      <h4 className="name">{name}</h4>
      <h5>{t("folders:yourDecks")} {terms}</h5>
      <h5>{t("folders:createdBy")} {creator}</h5>
      <h5>{t("folders:createdAt")} {created_at}</h5>
      <div className="buttons-container">
        <button
          className="buttons-items"
          type="button"
          onClick={handleStartStudying}
        >
          {t("folders:startStudying")}
        </button>
        <button className="buttons-items" type="button" onClick={handleEditDeck}>
        {t("folders:edit")}
        </button>
        <button className="buttons-items" type="button">
        {t("folders:delete")}
        </button>
      </div>
    </div>
  );
}

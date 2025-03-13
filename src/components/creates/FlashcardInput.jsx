import React from "react";
import "../../styles/createdeck.css";
import { useTranslation } from "react-i18next";
import "../../i18n"; 

export default function FlashcardInput({ id, onChange }) {
  const handleInputChange = (field, value) => {
    onChange(id, field, value);
  };
  const { t, i18n } = useTranslation("create");

  return (
    <div className="flashcard">
      <div className="flashcard-input-group flashcard-items">
        <label className="flashcard-input-underlined">
          <input 
            required 
            onChange={(e) => handleInputChange('front', e.target.value)}
          />
          <span className="flashcard-input-label">{t("enterfront")}</span>
        </label>
      </div>

      <div className="flashcard-back flashcard-items">
        <div className="flashcard-input-group flashcard-items">
          <label className="flashcard-input-underlined">
            <input 
              required 
              onChange={(e) => handleInputChange('back', e.target.value)}
            />
            <span className="flashcard-input-label">{t("enterback")}</span>
          </label>
        </div>

        <div className="flashcard-input-group flashcard-items">
          <label className="flashcard-input-underlined">
            <input 
              required 
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
            <span className="flashcard-input-label">{t("enterdescription")}</span>
          </label>
        </div>
      </div>
    </div>
  );
}
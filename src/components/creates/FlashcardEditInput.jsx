import React, { useState, useEffect } from "react";
import "../../styles/createdeck.css";
import { useTranslation } from "react-i18next";
import "../../i18n";

export default function FlashcardEditInput({ id, onChange, onDelete, front, back, description }) {
  const [isEditing, setIsEditing] = useState(true); // Стейт для редагування
  const [frontValue, setFrontValue] = useState(front);
  const [backValue, setBackValue] = useState(back);
  const [descriptionValue, setDescriptionValue] = useState(description);

  const { t, i18n } = useTranslation("create");

  // Оновлюємо значення, якщо змінився вхідний параметр
  useEffect(() => {
    setFrontValue(front);
    setBackValue(back);
    setDescriptionValue(description);
  }, [front, back, description]);

  const handleInputChange = (field, value) => {
    if (field === 'front') {
      setFrontValue(value);
    } else if (field === 'back') {
      setBackValue(value);
    } else if (field === 'description') {
      setDescriptionValue(value);
    }
    onChange(id, field, value);
  };

  const handleDelete = () => {
    onDelete(id);  // Викликає функцію onDelete, яку передано як пропс
  };

  return (
    <div className="flashcard">
      <div className="flashcard-input-group flashcard-items">
        <label className="flashcard-input-underlined">
          <input
            value={frontValue}
            onChange={(e) => handleInputChange('front', e.target.value)}
            readOnly={!isEditing}  // Якщо не в режимі редагування - input тільки для перегляду
          />
          <span className="flashcard-input-label">{t("enterfront")}</span>
        </label>
      </div>

      <div className="flashcard-back flashcard-items">
        <div className="flashcard-input-group flashcard-items">
          <label className="flashcard-input-underlined">
            <input
              value={backValue}
              onChange={(e) => handleInputChange('back', e.target.value)}
              readOnly={!isEditing}
            />
            <span className="flashcard-input-label">{t("enterback")}</span>
          </label>
        </div>

        <div className="flashcard-input-group flashcard-items">
          <label className="flashcard-input-underlined">
            <input
              value={descriptionValue}
              onChange={(e) => handleInputChange('description', e.target.value)}
              readOnly={!isEditing}
            />
            <span className="flashcard-input-label">{t("enterdescription")}</span>
          </label>
        </div>
      </div>

      {/* Кнопка Delete */}
      <div className="delete-button-container">
        <button className="btn" onClick={handleDelete}>
          <i className="material-icons">delete</i>
        </button>
      </div>
    </div>
  );
}

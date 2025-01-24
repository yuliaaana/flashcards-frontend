import React from "react";
import "../../styles/createdeck.css";

// Modified to accept props
export default function FlashcardInput({ id, onChange }) {
  const handleInputChange = (field, value) => {
    onChange(id, field, value);
  };

  return (
    <div className="flashcard">
      <div className="flashcard-input-group flashcard-items">
        <label className="flashcard-input-underlined">
          <input 
            required 
            onChange={(e) => handleInputChange('front', e.target.value)}
          />
          <span className="flashcard-input-label">Enter a front title</span>
        </label>
      </div>

      <div className="flashcard-back flashcard-items">
        <div className="flashcard-input-group flashcard-items">
          <label className="flashcard-input-underlined">
            <input 
              required 
              onChange={(e) => handleInputChange('back', e.target.value)}
            />
            <span className="flashcard-input-label">Enter a back title</span>
          </label>
        </div>

        <div className="flashcard-input-group flashcard-items">
          <label className="flashcard-input-underlined">
            <input 
              required 
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
            <span className="flashcard-input-label">Enter description</span>
          </label>
        </div>
      </div>
    </div>
  );
}
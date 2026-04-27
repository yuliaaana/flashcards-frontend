import "../../styles/deck.css";
import React, { useEffect, useState } from 'react';


export default function Flashcard({ back_description, back_title, confidence_level, created_at, deck_id, front_title, id, image_url, last_reviewed, review_count }) {
  const [isFlipped, setIsFlipped] = useState(false); 

  const handleCardClick = () => {
    setIsFlipped(!isFlipped); 
  };

  return (
    <div className="flashcard-deck">
  <div className={`flashcard-deck-items ${isFlipped ? "flipped" : ""}`} onClick={handleCardClick}>
    {!isFlipped ? (
      <div className="front">
        <h5>{front_title}</h5>
      </div>
    ) : (
      <div className="back">
        <h5>{back_title}</h5>
        <p>{back_description}</p>
        {image_url ? (
          <img src={image_url} alt="card definition" className="flashcard-image" />
        ) : null}
      </div>
    )}
  </div>

  <div className="flashcard-actions">
    <button className="btn"><i className="material-icons">edit</i></button>
    <button className="btn"><i className="material-icons">delete</i></button>
  </div>
</div>


  );
}

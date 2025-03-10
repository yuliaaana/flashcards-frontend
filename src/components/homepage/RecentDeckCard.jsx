import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecentDeckCard({ deck }) {
  const navigate = useNavigate();

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
      <button onClick={handleStudy} className="btn-study">Study this deck</button>

    </div>
  );
}
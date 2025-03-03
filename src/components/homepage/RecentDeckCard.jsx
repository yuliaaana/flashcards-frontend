// DeckCard.jsx
import React from 'react';

export default function RecentDeckCard({ deck }) {
  return (
    <div className="card-recent">
      <h5>{deck.deck.name}</h5>
      <p>{deck.deck.creator}</p>
      <p>{deck.deck.terms}</p>
    </div>
  );
}

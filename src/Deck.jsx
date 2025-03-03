import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './components/homepage/Header';
import visitDeck from './components/homepage/DecksBlock';
import './styles/deck.css';
import Flashcard from './components/creates/Flashcard';


export default function Deck() {
  const { deckId } = useParams(); 
  const [deck, setDeck] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/deck/${deckId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setDeck(data)
        //visitDeck(data)
      })
      .catch((error) => console.error('Error fetching deck data:', error));
  }, [deckId]);

  if (!deck) {
    return <div>Loading...</div>;
  }

  

  return (
    <>
      <Header />
      <div className='deck-container'>
        <div className='deck-items'></div>
        <div className='deck-items'>
          <div className="deck-details">
            <h4 className='title-deck'>{deck.deck.name}</h4>
            <p>Created by: {deck.deck.creator}</p>
            <p>Created at: {deck.deck.created_at}</p>
            {deck.flashcards.map(card => (
              <Flashcard
                key={card.id}
                {...card}
              />
            ))}
            <button 
              className='btn-start-learning'
              onClick={() => navigate(`/learn/${deckId}`)}
            >
              Start Learning
            </button>
          </div>
        </div>
        <div className='deck-items'></div>
      </div>
    </>
  );
}
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/homepage/Header';
import AnimatedBackground from './components/AnimatedBackground';
import './styles/learning.css';

export default function LearningMode() {
  const { deckId } = useParams();
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {

    fetch(`http://127.0.0.1:5000/api/deck/${deckId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setFlashcards(data.flashcards);
        if (data.flashcards.length > 0) {
          setCurrentCard(data.flashcards[Math.floor(Math.random() * data.flashcards.length)]);
        }
      })
      .catch((error) => console.error('Error fetching flashcards:', error));
  }, [deckId]);

  const handleNextCard = () => {
    setIsFlipped(false);
    const remainingCards = flashcards.filter(card => card.id !== currentCard.id);
    if (remainingCards.length > 0) {
      setCurrentCard(remainingCards[Math.floor(Math.random() * remainingCards.length)]);
    } else {
      alert('You have reviewed all the cards!');
      setCurrentCard(null);
    }
  };

  const handleConfidence = (level) => {
    console.log(`Card ID: ${currentCard.id}, Confidence Level: ${level}`);
    handleNextCard();
  };

  if (!currentCard) {
    return <div>No cards to review!</div>;
  }

  return (
    <>
    <Header />
    <div className='background'>
    <AnimatedBackground />
    <div className='learn-container'>
        
    <div className='learn-items'></div>
    <div className='learn-items'>
    <div className="learning-mode">
      <div 
        className={`flashcard-learning ${isFlipped ? 'flipped-learning' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {!isFlipped ? (
          <div className="learn-front">
            <h5>{currentCard.front_title}</h5>
          </div>
        ) : (
            <div className='back-content'>
          <div className="learn-back">
            <h5>{currentCard.back_title}</h5>
            <p>{currentCard.back_description}</p>
          </div>
          <div className="confidence-buttons">
        <button className="btn-conf" onClick={() => handleConfidence('fail')}>Fail</button>
        <button className="btn-conf" onClick={() => handleConfidence('hard')}>Hard</button>
        <button className="btn-conf" onClick={() => handleConfidence('good')}>Good</button>
        <button className="btn-conf" onClick={() => handleConfidence('excellent')}>Excellent</button>
      </div>
          </div>
        )}
      </div>
      
    </div>
    </div>
    <div className='learn-items'></div>

    </div>
    </div>
    </>
  );
}

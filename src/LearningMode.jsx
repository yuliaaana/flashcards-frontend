import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/homepage/Header';
import AnimatedBackground from './components/AnimatedBackground';
import CompletedSession from './components/CompletedSession';
import {saveRecentDecks} from './components/utils';
import './styles/learning.css';

export default function LearningMode() {
  const { deckId } = useParams();
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [round, setRound] = useState(1);
  const [currentRoundCards, setCurrentRoundCards] = useState([]);
  const [reviewedCards, setReviewedCards] = useState(new Set());
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/deck/${deckId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        saveRecentDecks(data);
        setFlashcards(data.flashcards);
        initializeRound(data.flashcards, 1);
      })
      .catch((error) => console.error('Error fetching flashcards:', error));
  }, [deckId]);

  const initializeRound = (cards, roundNumber) => {
    //console.log(`Initializing round ${roundNumber}`);
    let roundCards = [];
    
    switch(roundNumber) {
      case 1:
        roundCards = [...cards];
        //console.log('Round 1: All cards:', roundCards.length);
        break;
      case 2:
        roundCards = cards.filter(card => card.confidence_level < 4);
        //console.log('Round 2: Without excellent:', roundCards.length);
        break;
      case 3:
        roundCards = cards.filter(card => card.confidence_level <= 2);
        //console.log('Round 3: Only hard and fail:', roundCards.length);
        break;
      case 4:
        roundCards = cards.filter(card => card.confidence_level === 1);
        //console.log('Round 4: Only fail:', roundCards.length);
        break;
      default:
        //console.log('Resetting to round 1');
        roundCards = [...cards];
        roundNumber = 1;
    }
    
    if (roundCards.length === 0) {
      if (roundNumber < 4) {
        //console.log(`No cards for round ${roundNumber}, moving to next round`);
        initializeRound(cards, roundNumber + 1);
      } else {
        //console.log('Learning session complete');
        setShowCompletion(true);
      }
      return;
    }
    
    setRound(roundNumber);
    setCurrentRoundCards(roundCards);
    setReviewedCards(new Set());
    setCurrentCard(roundCards[0]);
  };

  const handleRestart = () => {
    setShowCompletion(false);
    initializeRound(flashcards, 1);
  };

  // Fix selectNextCard function
  const selectNextCard = () => {
    //console.log(`Current round: ${round}`);
    const unreviewed = currentRoundCards.filter(card => !reviewedCards.has(card.id));
    //console.log(`Unreviewed cards in round ${round}:`, unreviewed.length);
    
    if (unreviewed.length === 0) {
      const nextRound = round + 1;
      console.log(`Moving to round ${nextRound}`);
      setRound(nextRound);
      initializeRound(flashcards, nextRound);
      return;
    }
    
    const nextCard = unreviewed[0];
    setReviewedCards(prev => new Set([...prev, nextCard.id])); // Add this line
    setCurrentCard(nextCard);
  };

  const calculateNextReviewDate = (confidenceLevel) => {
    const now = new Date();
    switch (confidenceLevel) {
      case 'fail':
        return new Date(now.setDate(now.getDate() + 1));
      case 'hard':
        return new Date(now.setDate(now.getDate() + 3));
      case 'good':
        return new Date(now.setDate(now.getDate() + 7));
      case 'excellent':
        return new Date(now.setDate(now.getDate() + 14));
      default:
        return now;
    }
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    selectNextCard();
  };

  // Fix handleConfidence function
  const handleConfidence = (level) => {
    const confidenceMapping = {
      'fail': 1,
      'hard': 2,
      'good': 3,
      'excellent': 4
    };

    const updatedCard = {
      ...currentCard,
      confidence_level: confidenceMapping[level],
      next_review: calculateNextReviewDate(level).toISOString()
    };

    fetch(`http://127.0.0.1:5000/api/update-flashcard/${currentCard.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedCard),
    })
      .then(response => response.json())
      .then(data => {
        //console.log('Flashcard updated:', data);
        setFlashcards(prevCards => prevCards.map(card => card.id === data.id ? data : card));
        selectNextCard(); // Remove setReviewedCards from here since it's now in selectNextCard
      })
      .catch(error => {
        console.error('Error updating flashcard:', error);
        alert('Error updating flashcard. Please try again.');
      });
  };

  if (!currentCard) {
    return <div>No cards to review!</div>;
  }

  return (
    <>
      <Header />
      <div className='background'>
        <AnimatedBackground />
        {showCompletion ? (
          <CompletedSession onRestart={handleRestart} />
        ) : (
        <div className='learn-container'>
          <div className='learn-items'>
            
          </div>
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
      )}
      </div>
    </>
  );
}//////////////////finish screenHHH
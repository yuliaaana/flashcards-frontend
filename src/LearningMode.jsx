import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from './components/homepage/Header';
import AnimatedBackground from './components/AnimatedBackground';
import CompletedSession from './components/CompletedSession';
import {saveRecentDecks} from './components/utils';
import './styles/learning.css';
import { useTranslation } from "react-i18next";
import "./i18n"; 

//reset after 4

export default function LearningMode() {
  const { deckId } = useParams();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [round, setRound] = useState(1);
  const [currentRoundCards, setCurrentRoundCards] = useState([]);
  const [reviewedCards, setReviewedCards] = useState(new Set());
  const [showCompletion, setShowCompletion] = useState(false);
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);
  const { t, i18n } = useTranslation("learn");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/deck/${deckId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data)
        saveRecentDecks(data);
        setFlashcards(data.flashcards);
        initializeRound(data.flashcards, 1);
      })
      .catch((error) => console.error('Error fetching flashcards:', error));
  }, [deckId]);

  useEffect(() => {
    if (showCompletion && assignmentId && !assignmentSubmitted && flashcards.length > 0) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;
      const goodOrAbove = flashcards.filter(c => c.confidence_level >= 3).length;
      fetch(`http://127.0.0.1:5000/api/assignments/${assignmentId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          deck_id: parseInt(deckId),
          mode: 'flashcards',
          score: goodOrAbove,
          total: flashcards.length
        })
      }).then(() => setAssignmentSubmitted(true))
        .catch(err => console.error('Failed to submit assignment result:', err));
    }
  }, [showCompletion]);

  const initializeRound = (cards, roundNumber) => {
    console.log(`Initializing round ${roundNumber}`);
    let roundCards = [];
    
    switch(roundNumber) {
      case 1:
        roundCards = [...cards];
        break;
      case 2:
        roundCards = cards.filter(card => card.confidence_level < 4);
        break;
      case 3:
        roundCards = cards.filter(card => card.confidence_level <= 2);
        break;
      case 4:
        roundCards = cards.filter(card => card.confidence_level === 1);
        break;
      default:
        setShowCompletion(true);
    }
    
    if (roundCards.length === 0) {
      if (roundNumber < 4) {
        console.log(`No cards for round ${roundNumber}, moving to next round`);
        initializeRound(cards, roundNumber + 1);
      } else {
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
    const unreviewed = currentRoundCards.filter(card => !reviewedCards.has(card.id));
    
    if (unreviewed.length === 0) {
      const nextRound = round + 1;
      console.log(`Moving to round ${nextRound}`);
      setRound(nextRound);
      initializeRound(flashcards, nextRound);
      return;
    }
    
    const nextCard = unreviewed[0];
    setReviewedCards(prev => new Set([...prev, nextCard.id])); 
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
        setFlashcards(prevCards => prevCards.map(card => card.id === data.id ? data : card));
        selectNextCard(); 
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
                      <button className="btn-conf" onClick={() => handleConfidence('fail')}>{t("fail")}</button>
                      <button className="btn-conf" onClick={() => handleConfidence('hard')}>{t("hard")}</button>
                      <button className="btn-conf" onClick={() => handleConfidence('good')}>{t("good")}</button>
                      <button className="btn-conf" onClick={() => handleConfidence('excellent')}>{t("excellent")}</button>
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
}
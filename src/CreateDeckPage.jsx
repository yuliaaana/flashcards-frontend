import Header from './components/homepage/Header';
import './styles/createdeck.css';
import "./styles/createfolderbackground.css";
import React, { useState, useEffect } from "react";
import FlashcardInput from './components/creates/FlashcardInput';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import "./i18n"; 

export default function CreateDeckPage(){
  const navigate = useNavigate();
  const [deckName, setDeckName] = useState("");
  const [flashcards, setFlashcards] = useState([{ id: 1, front: '', back: '', description: '', imageUrl: '' }]);
  const [isPublic, setIsPublic] = useState(false); // ← додано
  const { t, i18n } = useTranslation("create");

  const handleFlashcardChange = (id, field, value) => {
    setFlashcards(prevCards => 
      prevCards.map(card => 
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  const addFlashcard = () => {
    setFlashcards(prev => [...prev, {
      id: prev.length + 1,
      front: '',
      back: '',
      description: '',
      imageUrl: ''
    }]);
  };

  const handleSubmit = () => {
    const userId = localStorage.getItem('user_id');

    if (!userId || !deckName) {
      alert('Please enter a deck name');
      return;
    }

    if (!flashcards.some(card => card.front && card.back)) {
      alert('Please add at least one complete flashcard');
      return;
    }

    const validFlashcards = flashcards.filter(card => card.front && card.back);

    fetch('http://127.0.0.1:5000/api/create-deck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        name: deckName,
        is_public: isPublic, 
        flashcards: validFlashcards.map(card => ({
          front: card.front,
          back: card.back,
          description: card.description,
          image_url: card.imageUrl || null
        }))
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Deck created:', data);
        navigate('/decks');
      })
      .catch(error => {
        console.error('Error creating deck:', error);
        alert('Error creating deck. Please try again.');
      });
  };

  return (
    <>
      <Header />
      <div className='createdeck-container'>
        <div className='createdeck-items'></div>
        <div className='createdeck-items'>
          <h4 className='title-deck-main'>{t("newdeck")}</h4>

          <div className="did-floating-label-content">
            <input 
              className="did-floating-input" 
              type="text" 
              placeholder=" " 
              value={deckName} 
              onChange={(e) => setDeckName(e.target.value)}
            />
            <label className="did-floating-label">{t("namenewdeck")}</label>
          </div>
          <div className="public-toggle">
            <label className="public-toggle-label">
              <input 
                type="checkbox" 
                checked={isPublic} 
                onChange={() => setIsPublic(!isPublic)} 
              />
              <span className="public-label-text">{isPublic ? t("publicdeck") : t("privatedeck")}
              </span>
            </label>
          </div>

          <section className="flashcards">
            {flashcards.map(card => (
              <FlashcardInput
                key={card.id}
                id={card.id}
                onChange={handleFlashcardChange}
              />
            ))}
          </section>

          <section className='buttons'>
            <div className='buttons1'>
              <button className="create-folder-buttons" onClick={addFlashcard}>
                {t("addcard")}
              </button>
            </div>
            <div className='buttons1'>
              <button className="create-folder-buttons" onClick={handleSubmit}>
                {t("createdeck")}
              </button>
            </div>
          </section>
        </div>
        <div className='createdeck-items'></div>
      </div>
    </>
  )
}

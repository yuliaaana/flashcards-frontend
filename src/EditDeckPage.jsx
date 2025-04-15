import Header from './components/homepage/Header';
import './styles/createdeck.css';
import "./styles/createfolderbackground.css";
import React, { useState, useEffect } from "react";
import FlashcardEditInput from './components/creates/FlashcardEditInput';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import "./i18n";

export default function EditDeckPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deckName, setDeckName] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const { t } = useTranslation("create");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/deck/${deckId}`)
      .then(res => res.json())
      .then(data => {
        console.log(data)
        setDeckName(data.deck.name || "");
        setIsPublic(data.deck.is_public || false);
        setFlashcards(
          (data.flashcards || []).map(card => ({
            id: card.id,
            front: card.front_title,
            back: card.back_title,
            description: card.back_description
          }))
        );
      })
      .catch(err => {
        console.error("Error fetching deck:", err);
        alert("Failed to load deck.");
      });
  }, [deckId]);

  const handleFlashcardChange = (id, field, value) => {
    setFlashcards(prevCards =>
      prevCards.map(card =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  const deleteFlashcard = (id) => {
    setFlashcards(prev => prev.filter(card => card.id !== id));
  };

  const addFlashcard = () => {
    setFlashcards(prev => [
      ...prev,
      { id: Date.now(), front: '', back: '', description: '' }
    ]);
  };

  const handleSubmit = () => {
    const userId = localStorage.getItem('user_id');
    if (!userId || !deckName.trim()) {
      alert('Please enter a deck name');
      return;
    }

    const validFlashcards = flashcards.filter(card => card.front && card.back);
    if (!validFlashcards.length) {
      alert('Please add at least one complete flashcard');
      return;
    }

    fetch(`http://127.0.0.1:5000/api/update-deck/${deckId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        name: deckName,
        is_public: isPublic,
        new_flashcards: validFlashcards.map(card => ({
          front_title: card.front,
          back_title: card.back,
          back_description: card.description,
          image_url: null
        }))
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Deck updated:', data);
        navigate('/decks');
      })
      .catch(error => {
        console.error('Error updating deck:', error);
        alert('Error updating deck. Please try again.');
      });
  };

  return (
    <>
      <Header />
      <div className='createdeck-container'>
        <div className='createdeck-items'></div>
        <div className='createdeck-items'>
          <h4 className='title-deck-main'>{t("editdeck") || "Edit Deck"}</h4>

          <div className="did-floating-label-content">
            <input
                className="did-floating-input"
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                required
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
              <span className="public-label-text">
                {isPublic ? t("publicdeck") : t("privatedeck")}
              </span>
            </label>
          </div>

          <section className="flashcards">
            {flashcards.map((card, index) => (
              <div key={card.id || index} className="flashcard-wrapper">
                <FlashcardEditInput
                  id={card.id}
                  onChange={handleFlashcardChange}
                  front={card.front}
                  back={card.back}
                  description={card.description}
                  onDelete={deleteFlashcard}
                />
              </div>
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
                {t("updatedeck") || "Update Deck"}
              </button>
            </div>
          </section>
        </div>
        <div className='createdeck-items'></div>
      </div>
    </>
  );
}

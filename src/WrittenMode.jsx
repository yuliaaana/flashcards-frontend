import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './styles/learning.css';
import Header from './components/homepage/Header';
import { useTranslation } from "react-i18next";
import "./i18n";

function shuffle(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function WrittenMode() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("definition"); // 'definition' or 'term'
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { t, i18n } = useTranslation("learn");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/deck/${deckId}`)
      .then((response) => {
        if (!response.ok) throw new Error("HTTP error! status: " + response.status);
        return response.json();
      })
      .then((data) => {
        const cards = shuffle(data.flashcards || []);
        setFlashcards(cards);
        setCurrentIndex(0);
        setInput("");
        setShowResult(false);
        setIsCorrect(null);
        setAttempts(0);
        setCompleted(false);
      })
      .catch((error) => {
        setFlashcards([]);
        setCompleted(true);
      });
  }, [deckId]);

  if (completed || !flashcards.length) {
    return (
    <>
        <Header />
      <div className="match-mode-container">
        <h2>{t("sessionComplete", "Session Complete!")}</h2>
        <h4 style={{margin: '24px 0'}}>{t("finishedAllCards", "You have finished all cards in this mode.")}</h4>
        <button className="mode-btn" onClick={() => navigate(`/learn/${deckId}/modes`)}>
          {t("backToLearningModes", "Back to Learning Modes")}
        </button>
      </div>
      </>
    );
  }

  const currentCard = flashcards[currentIndex];
  const correctAnswer = mode === "definition" ? currentCard.back_title : currentCard.front_title;
  const prompt = mode === "definition" ? currentCard.front_title : currentCard.back_title;

  const handleCheck = () => {
    if (input.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      setIsCorrect(true);
      setShowResult(true);
    } else {
      setIsCorrect(false);
      if (attempts + 1 >= 3) {
        setShowResult(true);
      } else {
        setShowResult(false);
        setAttempts(attempts + 1);
        setInput(""); // Optionally clear input for next try
        return;
      }
      setAttempts(attempts + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < flashcards.length) {
      setCurrentIndex(currentIndex + 1);
      setInput("");
      setShowResult(false);
      setIsCorrect(null);
      setAttempts(0);
    } else {
      setCompleted(true);
    }
  };

  return (
    <>
        <Header />
    <div className="write-mode-container">
      <h2>{t("writtenMode", "Written Mode")}</h2>
      <div className="write-block">
      <div className="write-subblock radio-block" style={{ marginBottom: 16 }}>
        <h3>{t("selectWritingMode", "Select writing mode:")}</h3>
        <label>
          <input
            type="radio"
            checked={mode === "definition"}
            onChange={() => setMode("definition")}
          />
          {t("writeDefinition", "Write Definition")}
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "term"}
            onChange={() => setMode("term")}
          />
          {t("writeTerm", "Write Term")}
        </label>
      </div>
      <div className="write-subblock written-card">
        <div className="written-prompt">{prompt}</div>
        <input
          className="written-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={showResult && isCorrect}
        />
        {(!showResult && attempts < 3) && (
          <button className="mode-btn" onClick={handleCheck} disabled={!input.trim()}>
            {t("check", "Check")}
          </button>
        )}
        {showResult && isCorrect && (
          <div className="written-correct">{t("correct", "Correct!")}</div>
        )}
        {(!showResult && attempts > 0 && attempts < 3) && (
          <div className="written-incorrect">{t("incorrectTryAgain", { defaultValue: "Incorrect. Try again. {{count}} attempts left", count: 3 - attempts })}</div>
        )}
        {showResult && !isCorrect && attempts >= 3 && (
          <div className="written-incorrect">{t("incorrectAnswerWas", { defaultValue: "Incorrect. The correct answer was: <b>{{answer}}</b>", answer: correctAnswer })}</div>
        )}
        {showResult && ((isCorrect) || (!isCorrect && attempts >= 3)) && (
          <button className="mode-btn" onClick={handleNext}>
            {t("next", "Next")}
          </button>
        )}
      
      <div style={{ marginTop: 24 }}>
        {t("cardOf", { defaultValue: "Card {{current}} of {{total}}", current: currentIndex + 1, total: flashcards.length })}
      </div>
      </div>
    </div>
    </div>
    </>
  );
}

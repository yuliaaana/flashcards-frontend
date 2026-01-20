import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from './components/homepage/Header';
import './styles/learning.css';
import { useTranslation } from "react-i18next";
import "./i18n";

function shuffle(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function TestLearningMode() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  // 0: loading, 1: multiple choice, 2: match, 3: written, 4: result
  const [step, setStep] = useState(0);
  const [results, setResults] = useState([]); // [{id, correct, mode, attempt, points}]
  // Remove random part
  const [finalScore, setFinalScore] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [mode, setMode] = useState("definition");
  const { t } = useTranslation("learn");

  // Distribute terms across modes so each appears exactly twice in total
  const [mcqTerms, setMcqTerms] = useState([]);
  const [matchTerms, setMatchTerms] = useState([]);
  const [writtenTerms, setWrittenTerms] = useState([]);
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/deck/${deckId}`)
      .then((response) => response.json())
      .then((data) => {
        const cards = data.flashcards || [];
        setFlashcards(cards);
        // Distribute each card to 2 different modes, never repeating in one mode
        let allIndexes = Array(cards.length).fill(0).map((_, i) => i);
        let pool = [...allIndexes, ...allIndexes]; // 2 times each index
        pool = shuffle(pool);
        const mcq = new Set(), match = new Set(), written = new Set();
        // Assign each card to 2 different modes
        while (pool.length) {
          const idx = pool.pop();
          // Find which modes this idx is not in yet
          const availableModes = [];
          if (!mcq.has(idx)) availableModes.push('mcq');
          if (!match.has(idx)) availableModes.push('match');
          if (!written.has(idx)) availableModes.push('written');
          // Pick a random available mode
          const mode = availableModes[Math.floor(Math.random() * availableModes.length)];
          if (mode === 'mcq') mcq.add(idx);
          else if (mode === 'match') match.add(idx);
          else if (mode === 'written') written.add(idx);
        }
        setMcqTerms(Array.from(mcq));
        setMatchTerms(Array.from(match));
        setWrittenTerms(Array.from(written));
        setStep(1);
      });
  }, [deckId]);

  // --- Flashcard Mode (first pass) ---
  // --- Multiple Choice for Flashcard Step ---
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqSelected, setMcqSelected] = useState(null);
  const [mcqOptions, setMcqOptions] = useState([]);
  const [mcqShowResult, setMcqShowResult] = useState(false);
  useEffect(() => {
    if (step === 1 && mcqTerms.length > 0 && flashcards.length > 0) {
      const cardIdx = mcqTerms[mcqIndex];
      const correct = flashcards[cardIdx]?.back_title;
      let incorrect = flashcards.filter((c, i) => i !== cardIdx).map(c => c.back_title);
      incorrect = shuffle(incorrect).slice(0, 3);
      const options = shuffle([correct, ...incorrect]);
      setMcqOptions(options);
      setMcqSelected(null);
      setMcqShowResult(false);
    }
  }, [step, mcqIndex, mcqTerms, flashcards]);

  const handleMcqSelect = (option) => {
    setMcqSelected(option);
    setMcqShowResult(true);
    const cardIdx = mcqTerms[mcqIndex];
    const isCorrect = option === flashcards[cardIdx].back_title;
    setResults(prev => ([...prev, { id: flashcards[cardIdx].id, correct: isCorrect, mode: 'flashcard', attempt: 1, points: isCorrect ? 0.5 : 0 }]));
  };

  const handleMcqNext = () => {
    setMcqShowResult(false);
    setMcqSelected(null);
    if (mcqIndex + 1 < mcqTerms.length) {
      setMcqIndex(mcqIndex + 1);
    } else {
      setMcqIndex(0);
      setStep(2);
    }
  };

  // --- Match Mode (second pass) ---
  const [matched, setMatched] = useState([]); // [{termId, defId}]
  const [selected, setSelected] = useState([]);
  const [shuffledTerms, setShuffledTerms] = useState([]);
  const [shuffledDefs, setShuffledDefs] = useState([]);
  useEffect(() => {
    if (step === 2 && matchTerms.length > 0 && flashcards.length > 0) {
      const pairs = matchTerms.map(idx => ({ id: flashcards[idx].id, term: flashcards[idx].front_title, definition: flashcards[idx].back_title }));
      setShuffledTerms(shuffle(pairs.map(p => ({ id: p.id, text: p.term }))));
      setShuffledDefs(shuffle(pairs.map(p => ({ id: p.id, text: p.definition }))));
      setMatched([]);
      setSelected([]);
    }
  }, [step, matchTerms, flashcards]);

  const handleMatchSelect = (type, id) => {
    if (selected.length === 0) {
      setSelected([{ type, id }]);
    } else if (selected.length === 1 && selected[0].type !== type) {
      const first = selected[0];
      if (first.id === id) {
        setMatched([...matched, { termId: type === 'term' ? id : first.id, defId: type === 'definition' ? id : first.id }]);
        setResults(prev => ([...prev, { id, correct: true, mode: 'match', attempt: 2, points: 0.5 }]));
      } else {
        setResults(prev => ([...prev, { id, correct: false, mode: 'match', attempt: 2, points: 0 }]));
      }
      setSelected([]);
    }
  };

  useEffect(() => {
    if (step === 2 && matched.length === matchTerms.length && matchTerms.length > 0) {
      setStep(3);
      setCurrentIndex(0);
      setInput("");
      setShowResult(false);
      setIsCorrect(null);
      setAttempts(0);
    }
  }, [matched, step, matchTerms]);

  // --- Written Mode (third pass) ---
  // --- Written Mode (third pass, exact copy of WrittenMode, but only for writtenTerms) ---
  const [writtenIndex, setWrittenIndex] = useState(0);
  const [writtenAttempts, setWrittenAttempts] = useState(0);
  const [writtenShowResult, setWrittenShowResult] = useState(false);
  const [writtenIsCorrect, setWrittenIsCorrect] = useState(null);
  useEffect(() => {
    if (step === 3) {
      setWrittenAttempts(0);
      setWrittenShowResult(false);
      setWrittenIsCorrect(null);
      setInput("");
    }
  }, [step, writtenIndex]);

  const handleWrittenCheck = () => {
    const cardIdx = writtenTerms[writtenIndex];
    const currentCard = flashcards[cardIdx];
    const correctAnswer = mode === "definition" ? currentCard.back_title : currentCard.front_title;
    if (input.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      setWrittenIsCorrect(true);
      setWrittenShowResult(true);
      setResults(prev => ([...prev, { id: currentCard.id, correct: true, mode: 'written', attempt: writtenAttempts + 1, points: 1 }]));
    } else {
      setWrittenIsCorrect(false);
      if (writtenAttempts + 1 >= 3) {
        setWrittenShowResult(true);
        setResults(prev => ([...prev, { id: currentCard.id, correct: false, mode: 'written', attempt: 3, points: 0 }]));
      } else {
        setWrittenShowResult(false);
        setWrittenAttempts(writtenAttempts + 1);
        setInput("");
        return;
      }
      setWrittenAttempts(writtenAttempts + 1);
    }
  };

  const handleWrittenNext = () => {
    if (writtenIndex + 1 < writtenTerms.length) {
      setWrittenIndex(writtenIndex + 1);
      setInput("");
      setWrittenShowResult(false);
      setWrittenIsCorrect(null);
      setWrittenAttempts(0);
    } else {
      setStep(4);
    }
  };

  // (No random mode)

  // --- Calculate Final Score ---
  useEffect(() => {
    if (step === 4) {
      let totalPoints = 0;
      let maxPoints = results.length; // Each question is worth 1 point
      results.forEach(r => {
        if (r.mode === 'written') {
          // Written: 1 for first try, 0.5 for second, 0.25 for third, 0 if never correct
          if (r.correct && r.attempt === 1) totalPoints += 1;
          else if (r.correct && r.attempt === 2) totalPoints += 0.5;
          else if (r.correct && r.attempt === 3) totalPoints += 0.25;
          // If incorrect after 3 attempts, 0 points
        } else {
          // MCQ and Match: 1 point for correct, 0 for incorrect
          if (r.correct) totalPoints += 1;
        }
      });
      setFinalScore({ total: totalPoints, max: maxPoints, percent: ((totalPoints / maxPoints) * 100).toFixed(2) });
    }
  }, [step, results, flashcards]);

  // --- Render UI for each step ---
  return (
    <>
      <Header />
      <div className="test-modes-wrapper">
        <div className="learning-block"></div>
        <div className="learning-block test-modes-container">
          <h2 className="ch-ttl">Test Learning Mode</h2>
          {step === 0 && <div>Loading...</div>}
          {step === 1 && flashcards.length > 0 && mcqTerms.length > 0 && (
            <div>
              <h3>Multiple Choice: {mcqIndex + 1} / {mcqTerms.length}</h3>
              <div className="flashcard-learning flc-cover" style={{margin: '0 auto 16px auto'}}>
                <div className="learn-front">
                  <h5>{flashcards[mcqTerms[mcqIndex]].front_title}</h5>
                </div>
                <div className="confidence-buttons" style={{marginTop: 24}}>
                  {mcqOptions.map((option, idx) => (
                    <button
                      key={option}
                      className={`tst-btn btn-conf${mcqSelected === option ? (option === flashcards[mcqTerms[mcqIndex]].back_title ? ' correct' : ' incorrect') : ''}`}
                      style={{margin: 8, minWidth: 200, opacity: mcqShowResult && mcqSelected !== option ? 0.7 : 1}}
                      onClick={() => !mcqShowResult && handleMcqSelect(option)}
                      disabled={mcqShowResult}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {mcqShowResult && (
                  <div style={{marginTop: 16}}>
                    {mcqSelected === flashcards[mcqTerms[mcqIndex]].back_title ? (
                      <span style={{color: 'green'}}>Correct!</span>
                    ) : (
                      <span style={{color: 'red'}}>Incorrect! Correct answer: {flashcards[mcqTerms[mcqIndex]].back_title}</span>
                    )}
                  </div>
                )}
                {mcqShowResult && (
                  <button className="mode-btn btn-conf" style={{marginTop: 16}} onClick={handleMcqNext}>
                    {mcqIndex + 1 === mcqTerms.length ? 'Next Mode' : 'Next'}
                  </button>
                )}
              </div>
            </div>
          )}
          {step === 2 && flashcards.length > 0 && matchTerms.length > 0 && (
            <div>
              <h3>{t('matchModeTitle', 'Match Mode')}</h3>
              <div className="match-columns">
                <div className="match-col">
                  <h4>{t('terms', 'Terms')}</h4>
                  {shuffledTerms.map(({ id, text }) => (
                    <button
                      key={id}
                      className={`match-btn ${matched.some(m => m.termId === id) ? 'matched' : ''} ${selected[0]?.type === 'term' && selected[0]?.id === id ? 'selected' : ''}`}
                      onClick={() => !matched.some(m => m.termId === id) && handleMatchSelect('term', id)}
                      disabled={matched.some(m => m.termId === id)}
                    >
                      {text}
                    </button>
                  ))}
                </div>
                <div className="match-col">
                  <h4>{t('definitions', 'Definitions')}</h4>
                  {shuffledDefs.map(({ id, text }) => (
                    <button
                      key={id}
                      className={`match-btn ${matched.some(m => m.defId === id) ? 'matched' : ''} ${selected[0]?.type === 'definition' && selected[0]?.id === id ? 'selected' : ''}`}
                      onClick={() => !matched.some(m => m.defId === id) && handleMatchSelect('definition', id)}
                      disabled={matched.some(m => m.defId === id)}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
              {matched.length === matchTerms.length && (
                <div className="match-complete">{t('allPairsMatched', 'All pairs matched!')}</div>
              )}
            </div>
          )}
          {step === 3 && flashcards.length > 0 && writtenTerms.length > 0 && (
            <div>
              <h3>{t("writtenMode", "Written Mode")}</h3>
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
                  <div className="written-prompt">{mode === "definition" ? flashcards[writtenTerms[writtenIndex]].front_title : flashcards[writtenTerms[writtenIndex]].back_title}</div>
                  <input
                    className="written-input"
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={writtenShowResult && writtenIsCorrect}
                  />
                  {(!writtenShowResult && writtenAttempts < 3) && (
                    <button className="mode-btn" onClick={handleWrittenCheck} disabled={!input.trim()}>
                      {t("check", "Check")}
                    </button>
                  )}
                  {writtenShowResult && writtenIsCorrect && (
                    <div className="written-correct">{t("correct", "Correct!")}</div>
                  )}
                  {(!writtenShowResult && writtenAttempts > 0 && writtenAttempts < 3) && (
                    <div className="written-incorrect">{t("incorrectTryAgain", { defaultValue: "Incorrect. Try again. {{count}} attempts left", count: 3 - writtenAttempts })}</div>
                  )}
                  {writtenShowResult && !writtenIsCorrect && writtenAttempts >= 3 && (
                    <div className="written-incorrect">{t("incorrectAnswerWas", { defaultValue: "Incorrect. The correct answer was: <b>{{answer}}</b>", answer: mode === "definition" ? flashcards[writtenTerms[writtenIndex]].back_title : flashcards[writtenTerms[writtenIndex]].front_title })}</div>
                  )}
                  {writtenShowResult && ((writtenIsCorrect) || (!writtenIsCorrect && writtenAttempts >= 3)) && (
                    <button className="mode-btn" onClick={handleWrittenNext}>
                      {t("next", "Next")}
                    </button>
                  )}
                  <div style={{ marginTop: 24 }}>
                    {t("cardOf", { defaultValue: "Card {{current}} of {{total}}", current: writtenIndex + 1, total: writtenTerms.length })}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* No random part */}
          {step === 4 && finalScore && (
            <div>
              <h3>Session Complete!</h3>
              <div>Total Points: {finalScore.total} / {finalScore.max}</div>
              <div>Result: {finalScore.percent}%</div>
              <button className="mode-btn btn-conf" onClick={() => navigate(`/learn/${deckId}/modes`)}>Back to Learning Modes</button>
            </div>
          )}
        </div>
        <div className="learning-block"></div>
      </div>
    </>
  );
}

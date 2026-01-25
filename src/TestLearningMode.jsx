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
  // 0: loading, 1: select tasks, 2: multiple choice, 3: match, 4: written, 5: result
  const [step, setStep] = useState(0);
  const [results, setResults] = useState([]); // [{id, correct, mode, attempt, points}]
  const [finalScore, setFinalScore] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [attempts, setAttempts] = useState(0);
  // Removed mode state, now handled per-question in writtenQuestions
  const { t } = useTranslation("learn");

  // User task selection state
  const [selectedTasks, setSelectedTasks] = useState({ mcq: true, match: true, writtenDef: true, writtenTerm: false });
  // Distribute terms across modes so each appears exactly twice in total, but only for selected modes
  const [mcqTerms, setMcqTerms] = useState([]);
  const [matchTerms, setMatchTerms] = useState([]);
  // For written, store array of {idx, type: 'definition'|'term'}
  const [writtenQuestions, setWrittenQuestions] = useState([]);
  const [cardsLoaded, setCardsLoaded] = useState(false);
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/deck/${deckId}`)
      .then((response) => response.json())
      .then((data) => {
        const cards = data.flashcards || [];
        setFlashcards(cards);
        setCardsLoaded(true);
      });
  }, [deckId]);

  // When user confirms task selection, distribute cards
  const distributeCards = React.useCallback(() => {
    // Only use selected modes
    const enabledModes = [];
    if (selectedTasks.mcq) enabledModes.push('mcq');
    if (selectedTasks.match) enabledModes.push('match');
    // For written, we handle separately
    let allIndexes = Array(flashcards.length).fill(0).map((_, i) => i);
    let pool = [];
    enabledModes.forEach(() => { pool = pool.concat(allIndexes); });
    pool = shuffle(pool);
    const mcq = new Set(), match = new Set();
    while (pool.length) {
      const idx = pool.pop();
      const availableModes = [];
      if (selectedTasks.mcq && !mcq.has(idx)) availableModes.push('mcq');
      if (selectedTasks.match && !match.has(idx)) availableModes.push('match');
      if (availableModes.length === 0) continue;
      const mode = availableModes[Math.floor(Math.random() * availableModes.length)];
      if (mode === 'mcq') mcq.add(idx);
      else if (mode === 'match') match.add(idx);
    }
    setMcqTerms(Array.from(mcq));
    setMatchTerms(Array.from(match));
    // Written: for each card, add one or two written questions depending on which written types are selected
    let writtenQ = [];
    allIndexes.forEach(idx => {
      if (selectedTasks.writtenDef) writtenQ.push({ idx, type: 'definition' });
      if (selectedTasks.writtenTerm) writtenQ.push({ idx, type: 'term' });
    });
    setWrittenQuestions(shuffle(writtenQ));
  }, [flashcards, selectedTasks]);

  // When user clicks Start after selecting tasks
  const handleStartTest = () => {
    distributeCards();
    // Go to first enabled mode
    if (selectedTasks.mcq) setStep(2);
    else if (selectedTasks.match) setStep(3);
    else if (selectedTasks.writtenDef || selectedTasks.writtenTerm) setStep(4);
  };

  // --- Flashcard Mode (first pass) ---
  // --- Multiple Choice for Flashcard Step ---
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqSelected, setMcqSelected] = useState(null);
  const [mcqOptions, setMcqOptions] = useState([]);
  const [mcqShowResult, setMcqShowResult] = useState(false);
  useEffect(() => {
      if (step === 2 && mcqTerms.length > 0 && flashcards.length > 0) {
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
      if (step === 3 && matchTerms.length > 0 && flashcards.length > 0) {
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
      if (step === 3 && matched.length === matchTerms.length && matchTerms.length > 0) {
        // If written is enabled, go to written, else go to result
        if (selectedTasks.writtenDef || selectedTasks.writtenTerm) setStep(4);
        else setStep(5);
        setCurrentIndex(0);
        setInput("");
        setShowResult(false);
        setIsCorrect(null);
        setAttempts(0);
      }
    }, [matched, step, matchTerms, selectedTasks]);

  // --- Written Mode (third pass) ---
  // --- Written Mode (third pass, now uses writtenQuestions for both types) ---
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
    const { idx, type } = writtenQuestions[writtenIndex];
    const currentCard = flashcards[idx];
    const correctAnswer = type === "definition" ? currentCard.back_title : currentCard.front_title;
    if (input.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      setWrittenIsCorrect(true);
      setWrittenShowResult(true);
      setResults(prev => ([...prev, { id: currentCard.id, correct: true, mode: 'written', attempt: writtenAttempts + 1, points: 1, type }]));
    } else {
      setWrittenIsCorrect(false);
      if (writtenAttempts + 1 >= 3) {
        setWrittenShowResult(true);
        setResults(prev => ([...prev, { id: currentCard.id, correct: false, mode: 'written', attempt: 3, points: 0, type }]));
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
    if (writtenIndex + 1 < writtenQuestions.length) {
      setWrittenIndex(writtenIndex + 1);
      setInput("");
      setWrittenShowResult(false);
      setWrittenIsCorrect(null);
      setWrittenAttempts(0);
    } else {
      setStep(5);
    }
  };

  // (No random mode)

  // --- Calculate Final Score ---
  useEffect(() => {
      if (step === 5 && results.length > 0) {
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
          <h2 className="ch-ttl">{t('testLearningMode', 'Тестовий режим навчання')}</h2>
          {step === 0 && (!cardsLoaded ? <div>{t('loading', 'Завантаження...')}</div> : setStep(1))}
          {step === 1 && cardsLoaded && (
            <div>
              <h3>{t('chooseTaskTypes')}</h3>
              <div style={{marginBottom: 24}}>
                <label style={{marginRight: 16}}>
                  <input type="checkbox" checked={selectedTasks.mcq} onChange={e => setSelectedTasks(s => ({...s, mcq: e.target.checked}))} />
                  {t('multipleChoice')}
                </label>
                <label style={{marginRight: 16}}>
                  <input type="checkbox" checked={selectedTasks.match} onChange={e => setSelectedTasks(s => ({...s, match: e.target.checked}))} />
                  {t('match')}
                </label>
                <label style={{marginRight: 16}}>
                  <input type="checkbox" checked={selectedTasks.writtenDef} onChange={e => setSelectedTasks(s => ({...s, writtenDef: e.target.checked}))} />
                  {t('writeDefinition')}
                </label>
                <label>
                  <input type="checkbox" checked={selectedTasks.writtenTerm} onChange={e => setSelectedTasks(s => ({...s, writtenTerm: e.target.checked}))} />
                  {t('writeTerm')}
                </label>
              </div>
              <button className="mode-btn btn-conf" onClick={handleStartTest} disabled={!(selectedTasks.mcq || selectedTasks.match || selectedTasks.writtenDef || selectedTasks.writtenTerm)}>
                {t('startTest')}
              </button>
            </div>
          )}
          {/* MCQ */}
          {step === 2 && flashcards.length > 0 && mcqTerms.length > 0 && (
            <div>
              <h3>{t('multipleChoice')}: {mcqIndex + 1} / {mcqTerms.length}</h3>
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
                      <span style={{color: 'green'}}>{t('correct')}</span>
                    ) : (
                      <span style={{color: 'red'}}>{t('incorrectAnswerWas', { answer: flashcards[mcqTerms[mcqIndex]].back_title })}</span>
                    )}
                  </div>
                )}
                {mcqShowResult && (
                  <button className="mode-btn btn-conf" style={{marginTop: 16}} onClick={() => {
                    setMcqShowResult(false);
                    setMcqSelected(null);
                    if (mcqIndex + 1 < mcqTerms.length) {
                      setMcqIndex(mcqIndex + 1);
                    } else {
                      setMcqIndex(0);
                      // Go to next enabled mode
                      if (selectedTasks.match) setStep(3);
                      else if (selectedTasks.written) setStep(4);
                      else setStep(5);
                    }
                  }}>
                    {mcqIndex + 1 === mcqTerms.length ? (selectedTasks.match ? t('nextMode') : selectedTasks.written ? t('nextMode') : t('finish')) : t('next')}
                  </button>
                )}
              </div>
            </div>
          )}
          {/* Match */}
          {step === 3 && flashcards.length > 0 && matchTerms.length > 0 && (
            <div>
              <h3>{t('matchModeTitle')}</h3>
              <div className="match-columns">
                <div className="match-col">
                  <h4>{t('terms')}</h4>
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
                  <h4>{t('definitions')}</h4>
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
                <div className="match-complete">{t('allPairsMatched')}</div>
              )}
              {matched.length === matchTerms.length && (
                <button className="mode-btn btn-conf" style={{marginTop: 16}} onClick={() => {
                  // Go to next enabled mode
                  if (selectedTasks.written) setStep(4);
                  else setStep(5);
                }}>{selectedTasks.written ? t('nextMode') : t('finish')}</button>
              )}
            </div>
          )}
          {/* Written */}
          {step === 4 && flashcards.length > 0 && writtenQuestions.length > 0 && (selectedTasks.writtenDef || selectedTasks.writtenTerm) && (
            <div>
              <h3>{t("writtenMode", "Written Mode")}</h3>
              <div className="write-block">
                <div className="write-subblock written-card">
                  <div className="written-prompt">
                    {writtenQuestions[writtenIndex].type === "definition"
                      ? flashcards[writtenQuestions[writtenIndex].idx].front_title
                      : flashcards[writtenQuestions[writtenIndex].idx].back_title}
                  </div>
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
                    <div className="written-incorrect">{t("incorrectAnswerWas", { defaultValue: "Incorrect. The correct answer was: <b>{{answer}}</b>", answer: writtenQuestions[writtenIndex].type === "definition" ? flashcards[writtenQuestions[writtenIndex].idx].back_title : flashcards[writtenQuestions[writtenIndex].idx].front_title })}</div>
                  )}
                  {writtenShowResult && ((writtenIsCorrect) || (!writtenIsCorrect && writtenAttempts >= 3)) && (
                    <button className="mode-btn" onClick={handleWrittenNext}>
                      {t("next", "Next")}
                    </button>
                  )}
                  <div style={{ marginTop: 24 }}>
                    {t("cardOf", { defaultValue: "Card {{current}} of {{total}}", current: writtenIndex + 1, total: writtenQuestions.length })}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Result */}
          {step === 5 && finalScore && (
            <div>
              <h3>{t('sessionComplete')}</h3>
              <div>{t('totalPoints')} {finalScore.total} / {finalScore.max}</div>
              <div>{t('result')} {finalScore.percent}%</div>
              <button className="mode-btn btn-conf" onClick={() => navigate(`/learn/${deckId}/modes`)}>{t('backToLearningModes')}</button>
            </div>
          )}
        </div>
        <div className="learning-block"></div>
      </div>
    </>
  );
}

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

export default function AssignmentTestMode() {
  const { deckId, assignmentId } = useParams();
  const navigate = useNavigate();
  
  const [flashcards, setFlashcards] = useState([]);
  const [assignmentSettings, setAssignmentSettings] = useState(null);
  // 0: loading, 2: multiple choice, 3: match, 4: written, 5: result
  const [step, setStep] = useState(0);
  const [results, setResults] = useState([]);
  const [finalScore, setFinalScore] = useState(null);
  const [input, setInput] = useState("");
  const { t } = useTranslation("learn");

  // Teacher-configured settings (loaded from assignment)
  const [selectedTasks, setSelectedTasks] = useState({ mcq: false, match: false, writtenDef: false, writtenTerm: false });
  const [mcqTerms, setMcqTerms] = useState([]);
  const [matchTerms, setMatchTerms] = useState([]);
  const [writtenQuestions, setWrittenQuestions] = useState([]);
  const [cardsLoaded, setCardsLoaded] = useState(false);

  // Fetch assignment settings
  useEffect(() => {
    if (assignmentId) {
      fetch(`http://127.0.0.1:5000/api/assignments/${assignmentId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Assignment data:", data);
          console.log("Modes from backend:", data.modes);
          setAssignmentSettings(data);
          // Parse modes from assignment - modes is an array of strings
          const modes = data.modes || [];
          const tasks = {
            mcq: modes.includes('mcq'),
            match: modes.includes('match'),
            writtenDef: modes.includes('writtenDef'),
            writtenTerm: modes.includes('writtenTerm')
          };
          console.log("Parsed tasks:", tasks);
          setSelectedTasks(tasks);
        })
        .catch(error => {
          console.error("Error fetching assignment:", error);
          // Default to all tasks enabled if fetch fails
          setSelectedTasks({ mcq: true, match: true, writtenDef: true, writtenTerm: false });
        });
    } else {
      // If no assignment, default to all tasks
      setSelectedTasks({ mcq: true, match: true, writtenDef: true, writtenTerm: false });
    }
  }, [assignmentId]);

  // Fetch flashcards
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/deck/${deckId}`)
      .then((response) => response.json())
      .then((data) => {
        const cards = data.flashcards || [];
        setFlashcards(cards);
        setCardsLoaded(true);
      });
  }, [deckId]);

  // Auto-distribute cards when both loaded
  useEffect(() => {
    if (cardsLoaded && assignmentSettings !== null && flashcards.length > 0) {
      distributeCards();
      // Start first enabled mode
      if (selectedTasks.mcq) setStep(2);
      else if (selectedTasks.match) setStep(3);
      else if (selectedTasks.writtenDef || selectedTasks.writtenTerm) setStep(4);
      else setStep(5); // No tasks enabled
    }
  }, [cardsLoaded, assignmentSettings, flashcards]);

  const distributeCards = () => {
    const enabledModes = [];
    if (selectedTasks.mcq) enabledModes.push('mcq');
    if (selectedTasks.match) enabledModes.push('match');
    
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
    
    // Written questions
    let writtenQ = [];
    allIndexes.forEach(idx => {
      if (selectedTasks.writtenDef) writtenQ.push({ idx, type: 'definition' });
      if (selectedTasks.writtenTerm) writtenQ.push({ idx, type: 'term' });
    });
    setWrittenQuestions(shuffle(writtenQ));
  };

  // --- Multiple Choice ---
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
    setResults(prev => ([...prev, { id: flashcards[cardIdx].id, correct: isCorrect, mode: 'flashcard', attempt: 1, points: isCorrect ? 1 : 0 }]));
  };

  const handleMcqNext = () => {
    setMcqShowResult(false);
    setMcqSelected(null);
    if (mcqIndex + 1 < mcqTerms.length) {
      setMcqIndex(mcqIndex + 1);
    } else {
      setMcqIndex(0);
      if (selectedTasks.match) setStep(3);
      else if (selectedTasks.writtenDef || selectedTasks.writtenTerm) setStep(4);
      else setStep(5);
    }
  };

  // --- Match Mode ---
  const [matched, setMatched] = useState([]);
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
        setResults(prev => ([...prev, { id, correct: true, mode: 'match', attempt: 2, points: 1 }]));
      } else {
        setResults(prev => ([...prev, { id, correct: false, mode: 'match', attempt: 2, points: 0 }]));
      }
      setSelected([]);
    }
  };

  useEffect(() => {
    if (step === 3 && matched.length === matchTerms.length && matchTerms.length > 0) {
      if (selectedTasks.writtenDef || selectedTasks.writtenTerm) setStep(4);
      else setStep(5);
    }
  }, [matched, step, matchTerms, selectedTasks]);

  // --- Written Mode ---
  const [writtenIndex, setWrittenIndex] = useState(0);
  const [writtenAttempts, setWrittenAttempts] = useState(0);
  const [writtenShowResult, setWrittenShowResult] = useState(false);
  const [writtenIsCorrect, setWrittenIsCorrect] = useState(null);

  useEffect(() => {
    if (step === 4) {
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
      const points = writtenAttempts === 0 ? 1 : writtenAttempts === 1 ? 0.5 : 0.25;
      setResults(prev => ([...prev, { id: currentCard.id, correct: true, mode: 'written', attempt: writtenAttempts + 1, points, type }]));
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

  // --- Calculate Final Score ---
  useEffect(() => {
    if (step === 5 && results.length > 0) {
      let totalPoints = 0;
      let maxPoints = results.length;
      results.forEach(r => {
        totalPoints += r.points || 0;
      });
      setFinalScore({ total: totalPoints, max: maxPoints, percent: ((totalPoints / maxPoints) * 100).toFixed(2) });
    }
  }, [step, results]);

  // --- Save Result to Backend ---
  useEffect(() => {
    if (step === 5 && finalScore && results.length > 0 && assignmentId) {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        fetch(`http://127.0.0.1:5000/api/assignments/${assignmentId}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: parseInt(userId),
            deck_id: parseInt(deckId),
            mode: 'test',
            score: parseFloat(finalScore.total),
            total: finalScore.max
          })
        }).catch(() => {});
      }
    }
  }, [step, finalScore, results, deckId, assignmentId]);

  // --- Render UI ---
  return (
    <>
      <Header />
      <div className="test-modes-wrapper">
        <div className="learning-block"></div>
        <div className="learning-block test-modes-container">
          <h2 className="ch-ttl">{t('assignmentTest', 'Assignment Test')}</h2>
          
          {step === 0 && <div>{t('loading', 'Loading...')}</div>}
          
          {/* MCQ */}
          {step === 2 && flashcards.length > 0 && mcqTerms.length > 0 && (
            <div>
              <h3>{t('multipleChoice')}: {mcqIndex + 1} / {mcqTerms.length}</h3>
              <div className="flashcard-learning flc-cover" style={{margin: '0 auto 16px auto'}}>
                <div className="learn-front">
                  <h5>{flashcards[mcqTerms[mcqIndex]].front_title}</h5>
                </div>
                <div className="confidence-buttons" style={{marginTop: 24}}>
                  {mcqOptions.map((option) => (
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
                  <button className="mode-btn btn-conf" style={{marginTop: 16}} onClick={handleMcqNext}>
                    {mcqIndex + 1 === mcqTerms.length ? t('nextMode') : t('next')}
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
            </div>
          )}

          {/* Written */}
          {step === 4 && flashcards.length > 0 && writtenQuestions.length > 0 && (
            <div>
              <h3>{t("writtenMode", "Written Mode")}</h3>
              <div className="write-block">
                <div className="write-subblock written-card written-card-test">
                  <div className="written-prompt">
                    {writtenQuestions[writtenIndex].type === "definition"
                      ? flashcards[writtenQuestions[writtenIndex].idx].front_title
                      : flashcards[writtenQuestions[writtenIndex].idx].back_title}
                  </div>
                  <input
                    className="written-input written-input-test"
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
                    <div className="written-incorrect">
                      {t("incorrectTryAgain", { count: 3 - writtenAttempts })}
                    </div>
                  )}
                  {writtenShowResult && !writtenIsCorrect && writtenAttempts >= 3 && (
                    <div className="written-incorrect">
                      {t("incorrectAnswerWas", { 
                        answer: writtenQuestions[writtenIndex].type === "definition" 
                          ? flashcards[writtenQuestions[writtenIndex].idx].back_title 
                          : flashcards[writtenQuestions[writtenIndex].idx].front_title 
                      })}
                    </div>
                  )}
                  {writtenShowResult && ((writtenIsCorrect) || (!writtenIsCorrect && writtenAttempts >= 3)) && (
                    <button className="mode-btn" onClick={handleWrittenNext}>
                      {t("next", "Next")}
                    </button>
                  )}
                  <div style={{ marginTop: 24 }}>
                    {t("cardOf", { current: writtenIndex + 1, total: writtenQuestions.length })}
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
              <button className="mode-btn btn-conf" onClick={() => navigate(`/assignment/${assignmentId}`)}>
                {t('backToAssignment')}
              </button>
            </div>
          )}
        </div>
        <div className="learning-block"></div>
      </div>
    </>
  );
}

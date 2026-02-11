
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Header from './components/homepage/Header';
import './styles/learning.css';
import { useTranslation } from "react-i18next";
import "./i18n";
// save results of test to backend later

function shuffle(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}


export default function MatchMode() {
  const { deckId } = useParams();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const [pairs, setPairs] = useState([]);
  const [selected, setSelected] = useState([]); // [{type: 'term'|'definition', id}]
  const [matched, setMatched] = useState([]); // [{termId, defId}]
  const [shuffledTerms, setShuffledTerms] = useState([]);
  const [shuffledDefs, setShuffledDefs] = useState([]);
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
        // Expecting data.flashcards: [{id, front_title, back_title}]
        const realPairs = (data.flashcards || []).map(card => ({
          id: card.id,
          term: card.front_title,
          definition: card.back_title
        }));
        setPairs(realPairs);
        setShuffledTerms(shuffle(realPairs.map(p => ({ id: p.id, text: p.term }))));
        setShuffledDefs(shuffle(realPairs.map(p => ({ id: p.id, text: p.definition }))));
      })
      .catch((error) => {
        console.error('Error fetching deck for match mode:', error);
        setPairs([]);
        setShuffledTerms([]);
        setShuffledDefs([]);
      });
  }, [deckId]);

  const handleSelect = (type, id) => {
    if (selected.length === 0) {
      setSelected([{ type, id }]);
    } else if (selected.length === 1 && selected[0].type !== type) {
      const first = selected[0];
      if (first.id === id) {
        setMatched([...matched, { termId: type === 'term' ? id : first.id, defId: type === 'definition' ? id : first.id }]);
      }
      setSelected([]);
    }
  };

  const isMatched = (type, id) => {
    return matched.some(m => (type === 'term' ? m.termId : m.defId) === id);
  };

  return (
    <>
        <Header />
    <div className="match-mode-container">
      <h2>{t("matchModeTitle", "Match Mode")}</h2>
      <div className="match-columns">
        <div className="match-col">
          <h4>{t("terms", "Terms")}</h4>
          {shuffledTerms.map(({ id, text }) => (
            <button
              key={id}
              className={`match-btn ${isMatched('term', id) ? 'matched' : ''} ${selected[0]?.type === 'term' && selected[0]?.id === id ? 'selected' : ''}`}
              onClick={() => !isMatched('term', id) && handleSelect('term', id)}
              disabled={isMatched('term', id)}
            >
              {text}
            </button>
          ))}
        </div>
        <div className="match-col">
          <h4>{t("definitions", "Definitions")}</h4>
          {shuffledDefs.map(({ id, text }) => (
            <button
              key={id}
              className={`match-btn ${isMatched('definition', id) ? 'matched' : ''} ${selected[0]?.type === 'definition' && selected[0]?.id === id ? 'selected' : ''}`}
              onClick={() => !isMatched('definition', id) && handleSelect('definition', id)}
              disabled={isMatched('definition', id)}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
      {matched.length === pairs.length && pairs.length > 0 && (
        <div className="match-complete">{t("allPairsMatched", "Congratulations! All pairs matched!")}</div>
      )}
      {/* Submit assignment result when match is complete */}
      {matched.length === pairs.length && pairs.length > 0 && assignmentId && (
        <MatchResultSubmitter assignmentId={assignmentId} deckId={deckId} total={pairs.length} />
      )}
    </div>
    </>
  );
}

// Helper component to submit match result once
function MatchResultSubmitter({ assignmentId, deckId, total }) {
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (!submitted) {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        fetch(`http://127.0.0.1:5000/api/assignments/${assignmentId}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: parseInt(userId),
            deck_id: parseInt(deckId),
            mode: 'match',
            score: total,
            total: total
          })
        }).catch(() => {});
        setSubmitted(true);
      }
    }
  }, [submitted, assignmentId, deckId, total]);
  return null;
}

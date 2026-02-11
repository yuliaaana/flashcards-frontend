import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import Header from './components/homepage/Header';
import { useTranslation } from 'react-i18next';
import './styles/groups.css';

const API_URL = 'http://127.0.0.1:5000/api';

const AssignmentPage = ({ user }) => {
  const { t } = useTranslation('header');
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [assignment, setAssignment] = useState(null);
  const [results, setResults] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | results | leaderboard

  const isTeacher = user && assignment && user.id === assignment.created_by;

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  useEffect(() => {
    if (assignment) {
      if (isTeacher) {
        fetchAllResults();
      } else if (user) {
        fetchMyResults();
      }
      if (assignment.group_id) {
        fetchLeaderboard();
      }
    }
  }, [assignment, user]);

  // Check if returning from a learning mode with score to submit
  useEffect(() => {
    const submitScore = searchParams.get('submitScore');
    const deckId = searchParams.get('deckId');
    const mode = searchParams.get('mode');
    const score = searchParams.get('score');
    const total = searchParams.get('total');
    if (submitScore && deckId && mode && score !== null && total !== null && user) {
      submitResult(parseInt(deckId), mode, parseInt(score), parseInt(total));
    }
  }, [searchParams, user]);

  const fetchAssignment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/assignments/${assignmentId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAssignment(data);
    } catch {
      setError('Failed to load assignment');
    }
    setLoading(false);
  };

  const fetchAllResults = async () => {
    try {
      const res = await fetch(`${API_URL}/assignments/${assignmentId}/results`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    }
  };

  const fetchMyResults = async () => {
    try {
      const res = await fetch(`${API_URL}/assignments/${assignmentId}/results/${user.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMyResults(Array.isArray(data) ? data : []);
    } catch {
      setMyResults([]);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/groups/${assignment.group_id}/leaderboard`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch {
      setLeaderboard([]);
    }
  };

  const submitResult = async (deckId, mode, score, total) => {
    try {
      await fetch(`${API_URL}/assignments/${assignmentId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          deck_id: deckId,
          mode,
          score,
          total
        })
      });
      if (isTeacher) fetchAllResults();
      else fetchMyResults();
    } catch {
      // silent
    }
  };

  if (loading) return <div>{t('loading')}</div>;
  if (!assignment) return <div>Assignment not found</div>;

  const displayResults = isTeacher ? results : myResults;

  return (
    <>
      <Header user={user} />
      <div className="sg-cont">
        <div className="sg-block"></div>
        <div className="sg-block gp-main">
          <h2 className="gp-title">{assignment.title}</h2>
          {assignment.description && <p className="gp-desc">{assignment.description}</p>}
          <p className="gp-desc">
            {assignment.due_date
              ? `${t('due')}: ${new Date(assignment.due_date).toLocaleString()}`
              : t('noDueDate')}
          </p>
          {error && <div className="eg-error">{error}</div>}

          {/* Tabs */}
          <div className="asn-tabs">
            <button
              className={`asn-tab ${activeTab === 'overview' ? 'asn-tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {t('assignmentDecks')}
            </button>
            <button
              className={`asn-tab ${activeTab === 'results' ? 'asn-tab-active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              {isTeacher ? t('allResults') : t('yourResults')}
            </button>
            <button
              className={`asn-tab ${activeTab === 'leaderboard' ? 'asn-tab-active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              {t('leaderboard')}
            </button>
          </div>

          <hr className="gp-divider" />

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="asn-overview">
              <h3>{t('assignmentDecks')}</h3>
              <div className="gp-items">
                {(assignment.decks || []).map(d => (
                  <div key={d.id} className="asn-deck-row">
                    <span className="group-link" style={{ fontWeight: 700 }}>{d.name}</span>
                    <div className="asn-deck-modes">
                      <Link
                        className="asn-mode-start-btn"
                        to={`/assignment/${assignmentId}/deck/${d.id}/test`}
                      >
                        {t('startTest')} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="asn-results">
              <h3>{isTeacher ? t('allResults') : t('yourResults')}</h3>
              {displayResults.length === 0 ? (
                <p className="gp-empty">{t('noResults')}</p>
              ) : (
                <table className="asn-results-table">
                  <thead>
                    <tr>
                      {isTeacher && <th>{t('student')}</th>}
                      <th>{t('deck')}</th>
                      <th>{t('mode')}</th>
                      <th>{t('score')}</th>
                      <th>{t('completedAt')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayResults.map(r => (
                      <tr key={r.id}>
                        {isTeacher && <td>{r.username || r.user_id}</td>}
                        <td>{r.deck_name || r.deck_id}</td>
                        <td>{r.mode}</td>
                        <td>{r.score}/{r.total}</td>
                        <td>{r.completed_at ? new Date(r.completed_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="asn-leaderboard">
              <h3>{t('leaderboard')}</h3>
              {leaderboard.length === 0 ? (
                <p className="gp-empty">{t('noResults')}</p>
              ) : (
                <table className="asn-results-table">
                  <thead>
                    <tr>
                      <th>{t('rank')}</th>
                      <th>{t('student')}</th>
                      <th>{t('avgScore')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, idx) => (
                      <tr key={entry.user_id}>
                        <td>{idx + 1}</td>
                        <td>
                          <Link className="group-link" to={`/profile/${entry.user_id}`}>
                            {entry.username || entry.user_id}
                          </Link>
                        </td>
                        <td>{entry.avg_score}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <button className="eg-back-btn" onClick={() => navigate(`/group/${assignment.group_id}`)}>
            ← {t('backToGroup')}
          </button>
        </div>
        <div className="sg-block"></div>
      </div>
    </>
  );
};

export default AssignmentPage;

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import Header from './components/homepage/Header';
import { useTranslation } from 'react-i18next';
import './styles/groups.css';

const API_URL = 'http://127.0.0.1:5000/api';

function transliterate(text) {
  if (!text) return '';
  const map = {
    А: 'A', а: 'a', Б: 'B', б: 'b', В: 'V', в: 'v', Г: 'H', г: 'h', Д: 'D', д: 'd',
    Е: 'E', е: 'e', Є: 'Ye', є: 'ye', Ж: 'Zh', ж: 'zh', З: 'Z', з: 'z', И: 'Y', и: 'y',
    І: 'I', і: 'i', Ї: 'Yi', ї: 'yi', Й: 'Y', й: 'y', К: 'K', к: 'k', Л: 'L', л: 'l',
    М: 'M', м: 'm', Н: 'N', н: 'n', О: 'O', о: 'o', П: 'P', п: 'p', Р: 'R', р: 'r',
    С: 'S', с: 's', Т: 'T', т: 't', У: 'U', у: 'u', Ф: 'F', ф: 'f', Х: 'Kh', х: 'kh',
    Ц: 'Ts', ц: 'ts', Ч: 'Ch', ч: 'ch', Ш: 'Sh', ш: 'sh', Щ: 'Shch', щ: 'shch',
    Ю: 'Yu', ю: 'yu', Я: 'Ya', я: 'ya', Ь: '', ь: '', Ъ: '', ъ: '', Ґ: 'G', ґ: 'g'
  };
  return text.split('').map(char => map[char] || char).join('');
}

const AssignmentPage = ({ user }) => {
  const { t } = useTranslation('header');
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [assignment, setAssignment] = useState(null);
  const [results, setResults] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [groupStatus, setGroupStatus] = useState({
    not_taken: [],
    not_passed: [],
    passed: [],
    group_members: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [assignmentExpired, setAssignmentExpired] = useState(false);

  const isTeacher = user && assignment && user.id === assignment.created_by;

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  useEffect(() => {
    if (assignment) {
      if (isTeacher) {
        fetchAllResults();
        fetchGroupStatus();
      } else if (user) {
        fetchMyResults();
      }
      fetchLeaderboard();
    }
  }, [assignment, user]);

  useEffect(() => {
    const submitScore = searchParams.get('submitScore');
    const mode = searchParams.get('mode');
    const score = searchParams.get('score');
    const total = searchParams.get('total');
    if (submitScore && mode && score !== null && total !== null && user) {
      submitResult(mode, parseInt(score), parseInt(total));
    }
  }, [searchParams, user]);

  const fetchAssignment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/assignments/${assignmentId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAssignment(data);
      if (data.due_date) {
        const dueDate = new Date(data.due_date);
        const now = new Date();
        if (now > dueDate) {
          setAssignmentExpired(true);
        }
      }
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
      const res = await fetch(`${API_URL}/assignments/${assignmentId}/leaderboard`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch {
      setLeaderboard([]);
    }
  };

  const fetchGroupStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/assignments/${assignmentId}/group-status`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGroupStatus(data);
    } catch {
      setGroupStatus({ not_taken: [], not_passed: [], passed: [], group_members: [] });
    }
  };

  const submitResult = async (mode, score, total) => {
    try {
      await fetch(`${API_URL}/assignments/${assignmentId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, mode, score, total })
      });
      if (isTeacher) fetchAllResults();
      else fetchMyResults();
    } catch {
      // silent
    }
  };

  const calculateDashboardStats = () => {
    const dataToAnalyze = isTeacher ? results : myResults;
    if (dataToAnalyze.length === 0) {
      return { totalAttempts: 0, avgScore: 0, highestScore: 0, lowestScore: 0, passRate: 0, byMode: {}, byDeck: {} };
    }

    const scores = dataToAnalyze.map(r => (r.score / r.total) * 100);
    const totalAttempts = dataToAnalyze.length;
    const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    const highestScore = Math.max(...scores).toFixed(1);
    const lowestScore = Math.min(...scores).toFixed(1);

    const byMode = {};
    dataToAnalyze.forEach(r => {
      if (!byMode[r.mode]) byMode[r.mode] = { count: 0, totalScore: 0, totalMax: 0 };
      byMode[r.mode].count += 1;
      byMode[r.mode].totalScore += r.score;
      byMode[r.mode].totalMax += r.total;
    });

    const byDeck = {};
    dataToAnalyze.forEach(r => {
      const deckName = r.deck_name || (r.deck_id ? r.deck_id : 'All Decks');
      if (!byDeck[deckName]) byDeck[deckName] = { count: 0, totalScore: 0, totalMax: 0 };
      byDeck[deckName].count += 1;
      byDeck[deckName].totalScore += r.score;
      byDeck[deckName].totalMax += r.total;
    });

    Object.keys(byMode).forEach(mode => {
      byMode[mode].avgScore = ((byMode[mode].totalScore / byMode[mode].totalMax) * 100).toFixed(1);
    });
    Object.keys(byDeck).forEach(deck => {
      byDeck[deck].avgScore = ((byDeck[deck].totalScore / byDeck[deck].totalMax) * 100).toFixed(1);
    });

    const passRate = ((scores.filter(s => s >= 50).length / scores.length) * 100).toFixed(1);

    return { totalAttempts, avgScore, highestScore, lowestScore, passRate, byMode, byDeck };
  };

  const renderDashboard = () => {
    /*const stats = calculateDashboardStats();
    const dataToAnalyze = results;

    if (dataToAnalyze.length === 0) {
          return <p className="gp-empty">{t('noResults')}</p>;
    }

    const scores = dataToAnalyze.map(r => Math.round((r.score / r.total) * 100));
    const bins = [0, 20, 40, 60, 80, 100];
    const binLabels = bins.map((b, i) => i === bins.length - 1 ? `${b}+` : `${b}-${bins[i + 1] - 1}`);
    const binCounts = bins.map((b, i) =>
      i === bins.length - 1
        ? scores.filter(s => s >= b).length
        : scores.filter(s => s >= b && s < bins[i + 1]).length
    );/*/

    const stats = calculateDashboardStats();
    const dataToAnalyze = results;

    if (dataToAnalyze.length === 0) {
      return <p className="gp-empty">{t('noResults')}</p>;
    }

    const scores = dataToAnalyze.map(r => Math.round((r.score / r.total) * 100));
    const bins = [0, 20, 40, 60, 80, 100];
    const binLabels = bins.map((b, i) => i === bins.length - 1 ? `${b}+` : `${b}-${bins[i + 1] - 1}`);
    const binCounts = bins.map((b, i) =>
      i === bins.length - 1
        ? scores.filter(s => s >= b).length
        : scores.filter(s => s >= b && s < bins[i + 1]).length
    );

    const chartData = {
      labels: binLabels,
      datasets: [{
        label: t('scoreDistribution', 'Score Distribution'),
        data: binCounts,
        backgroundColor: [
          '#0e81c8a8', '#357ab8', '#4fc3f7', '#81d4fa', '#b3e5fc', '#e1f5fe'
        ],
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
        hoverBackgroundColor: '#23507a',
      }],
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context) {
              return t('attempts', 'Attempts') + `: ${context.parsed.y}`;
            }
          }
        },
        title: {
          display: true,
          text: t('scoreDistribution', 'Score Distribution'),
          font: { size: 18 },
          color: '#357ab8',
        },
      },
      scales: {
        x: {
          title: { display: true, text: t('scorePercent', 'Score (%)'), color: '#357ab8', font: { size: 16 } },
          grid: { color: '#e1f5fe' },
        },
        y: {
          title: { display: true, text: t('attempts', 'Attempts'), color: '#357ab8', font: { size: 16 } },
          beginAtZero: true,
          grid: { color: '#e1f5fe' },
        },
      },
    };

    const notTaken = groupStatus.not_taken || [];
    const notPassed = groupStatus.not_passed || [];

    return (
      <div className="dashboard-content">
        <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
          {/* LEFT SIDE - CHART */}
          <div style={{ flex: 1, minWidth: '0' }}>
            <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Bar data={chartData} options={chartOptions} height={400} width={850} />
            </div>
          </div>
        </div>

        {/* Students who didn't take the test */}
        {notTaken.length > 0 ? (
          <div className="dashboard-section">
            <h4 style={{ color: '#e74c3c' }}>
              {t('studentsNotTaken', "Students who didn't take the test")} ({notTaken.length})
            </h4>
            <ul style={{ color: '#e74c3c', fontWeight: 600 }}>
              {notTaken.map(s => (
                <li key={s.id}>
                  {transliterate(s.username || s.name || s.email || s.id)}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="dashboard-section">
            <h4 style={{ color: '#27ae60' }}>✓ {t('allStudentsTaken', 'All students have taken the test.')}</h4>
          </div>
        )}

        {/* Students who didn't pass the test */}
        {notPassed.length > 0 ? (
          <div className="dashboard-section">
            <h4 style={{ color: '#ff9800' }}>
              {t('studentsNotPassed', "Students who didn't pass (score < 50%)")} ({notPassed.length})
            </h4>
            <ul style={{ color: '#ff9800', fontWeight: 600 }}>
              {notPassed.map(item => (
                <li key={item.member.id}>
                  <strong>{transliterate(item.member.username || item.member.name || item.member.email)}</strong>
                  <ul style={{ marginLeft: '20px', marginTop: '5px', fontWeight: 'normal' }}>
                    {item.results.map((r, idx) => (
                      <li key={idx} style={{ fontSize: '0.9em' }}>
                        {r.deck_name || t('allDecks', 'All Decks')}: {r.score}/{r.total} ({Math.round((r.score / r.total) * 100)}%)
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="dashboard-section">
            <h4 style={{ color: '#27ae60' }}>✓ {t('allStudentsPassed', 'All students who took the test passed.')}</h4>
          </div>
        )}

        <div className="dashboard-metrics">
          <div className="metric-card">
            <div className="metric-label">{t('totalAttempts', 'Total Attempts')}</div>
            <div className="metric-value">{stats.totalAttempts}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t('avgScore', 'Avg Score')}</div>
            <div className="metric-value">{stats.avgScore}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t('highestScore', 'Highest Score')}</div>
            <div className="metric-value">{stats.highestScore}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t('lowestScore', 'Lowest Score')}</div>
            <div className="metric-value">{stats.lowestScore}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t('passRate', 'Pass Rate (50+)')}</div>
            <div className="metric-value">{stats.passRate}%</div>
          </div>
        </div>

        {Object.keys(stats.byMode).length > 0 && (
          <div className="dashboard-section">
            <h4>{t('byMode', 'Results by Mode')}</h4>
            <table className="asn-results-table">
              <thead>
                <tr>
                  <th>{t('mode')}</th>
                  <th>{t('attempts', 'Attempts')}</th>
                  <th>{t('avgScore', 'Avg Score')}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.byMode).map(([mode, data]) => (
                  <tr key={mode}>
                    <td>{transliterate(mode)}</td>
                    <td>{data.count}</td>
                    <td>{data.avgScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {Object.keys(stats.byDeck).length > 0 && (
          <div className="dashboard-section">
            <h4>{t('byDeck', 'Results by Deck')}</h4>
            <table className="asn-results-table">
              <thead>
                <tr>
                  <th>{t('deck')}</th>
                  <th>{t('attempts', 'Attempts')}</th>
                  <th>{t('avgScore', 'Avg Score')}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.byDeck).map(([deck, data]) => (
                  <tr key={deck}>
                    <td>{transliterate(deck)}</td>
                    <td>{data.count}</td>
                    <td>{data.avgScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );

  return (
    <>
      <Header user={user} />
      <div className="sg-cont">
        <div className="sg-block"></div>
        <div className="sg-block gp-main">
          <h2 className="gp-title">{transliterate(assignment.title)}</h2>
          {assignment.description && (
            <p className="gp-desc">{transliterate(assignment.description)}</p>
          )}
          <p className="gp-desc">
            {assignment.due_date
              ? `${t('due')}: ${new Date(assignment.due_date).toLocaleString()}`
              : t('noDueDate')}
          </p>

          {assignmentExpired && (
            <div className="eg-error" style={{ backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', padding: '10px', borderRadius: '13px', marginBottom: '10px' }}>
              {t('assignmentExpired', 'This assignment has expired. You can no longer take the test.')}
            </div>
          )}
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
            {isTeacher && (
              <button
                className={`asn-tab ${activeTab === 'dashboard' ? 'asn-tab-active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                {t('statistics', 'Statistics')}
              </button>
            )}
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
                  </div>
                ))}
              </div>
              <div className="asn-deck-modes" style={{ marginTop: '20px' }}>
                {assignmentExpired || (assignment.one_time_only && myResults.length > 0) ? (
                  <span className="asn-mode-start-btn" style={{ backgroundColor: '#ccc', cursor: 'not-allowed', opacity: 0.6 }}>
                    {assignmentExpired
                      ? t('testUnavailable', 'Test Unavailable')
                      : t('alreadyCompleted', 'Already Completed')}
                  </span>
                ) : (
                  <Link className="asn-mode-start-btn" to={`/assignment/${assignmentId}/test`}>
                    {t('startTest')} →
                  </Link>
                )}
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
                        {isTeacher && <td>{transliterate(r.username || r.user_id)}</td>}
                        <td>{r.deck_name || (r.deck_id ? r.deck_id : 'All Decks')}</td>
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
                            {transliterate(entry.username || entry.user_id)}
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

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && isTeacher && (
            <div className="asn-dashboard">
              <h3>{t('statistics', 'Statistics')}</h3>
              {renderDashboard()}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AssignmentPage;
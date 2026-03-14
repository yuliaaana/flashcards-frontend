import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from './components/homepage/Header';
import { useTranslation } from 'react-i18next';
import './styles/groups.css';

const API_URL = 'http://127.0.0.1:5000/api';

const GroupPage = ({ user }) => {
  const { t } = useTranslation('header');
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [groupDecks, setGroupDecks] = useState([]);
  const [groupFolders, setGroupFolders] = useState([]);
  const [userDecks, setUserDecks] = useState([]);
  const [userFolders, setUserFolders] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Assignments state
  const [assignments, setAssignments] = useState([]);
  const [asnTitle, setAsnTitle] = useState('');
  const [asnDesc, setAsnDesc] = useState('');
  const [asnDueDate, setAsnDueDate] = useState('');
  const [asnDeckIds, setAsnDeckIds] = useState([]);
  const [asnModes, setAsnModes] = useState([]);
  const [testSettings, setTestSettings] = useState({ mcq: true, match: true, writtenDef: true, writtenTerm: false });
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  const isTeacher = user && group && user.id === group.teacher_id;

  useEffect(() => {
    fetchGroup();
    fetchGroupDecks();
    fetchGroupFolders();
    fetchAssignments();
  }, [groupId]);

  useEffect(() => {
    if (isTeacher) {
      fetchUserDecks();
      fetchUserFolders();
    }
  }, [user, group]);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}`);
      if (!res.ok) throw new Error('Failed to load group');
      const data = await res.json();
      setGroup(data);
      // Fetch member details
      if (data.members && data.members.length > 0) {
        const memberDetails = await Promise.all(
          data.members.map(async (uid) => {
            try {
              const r = await fetch(`${API_URL}/user-data/${uid}`);
              if (!r.ok) return { id: uid, username: `User #${uid}` };
              const d = await r.json();
              return d.user || { id: uid, username: `User #${uid}` };
            } catch {
              return { id: uid, username: `User #${uid}` };
            }
          })
        );
        setMembers(memberDetails);
      } else {
        setMembers([]);
      }
    } catch (e) {
      setError(t('failedLoadGroup'));
    }
    setLoading(false);
  };

  const fetchGroupDecks = async () => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/decks`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGroupDecks(Array.isArray(data) ? data : []);
    } catch {
      setGroupDecks([]);
    }
  };

  const fetchGroupFolders = async () => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/folders`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGroupFolders(Array.isArray(data) ? data : []);
    } catch {
      setGroupFolders([]);
    }
  };

  const fetchUserDecks = async () => {
    try {
      const res = await fetch(`${API_URL}/user-data/${user.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUserDecks(Array.isArray(data.decks) ? data.decks : []);
    } catch {
      setUserDecks([]);
    }
  };

  const fetchUserFolders = async () => {
    try {
      const res = await fetch(`${API_URL}/folders/${user.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUserFolders(Array.isArray(data) ? data : []);
    } catch {
      setUserFolders([]);
    }
  };

  const handleAddDeck = async () => {
    if (!selectedDeck) return;
    setError('');
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: user.id, deck_id: parseInt(selectedDeck) })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add deck');
        return;
      }
      setSelectedDeck('');
      fetchGroupDecks();
    } catch {
      setError('Failed to add deck');
    }
  };

  const handleRemoveDeck = async (deckId) => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/decks/${deckId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: user.id })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to remove deck');
        return;
      }
      fetchGroupDecks();
    } catch {
      setError('Failed to remove deck');
    }
  };

  const handleAddFolder = async () => {
    if (!selectedFolder) return;
    setError('');
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: user.id, folder_id: parseInt(selectedFolder) })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add folder');
        return;
      }
      setSelectedFolder('');
      fetchGroupFolders();
    } catch {
      setError('Failed to add folder');
    }
  };

  const handleRemoveFolder = async (folderId) => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/folders/${folderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: user.id })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to remove folder');
        return;
      }
      fetchGroupFolders();
    } catch {
      setError('Failed to remove folder');
    }
  };

  // Filter out already-attached items from dropdowns
  const availableDecks = userDecks.filter(
    d => !groupDecks.some(gd => gd.id === d.id)
  );
  const availableFolders = userFolders.filter(
    f => !groupFolders.some(gf => gf.id === f.id)
  );

  // --- Assignments ---
  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/assignments`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch {
      setAssignments([]);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!asnTitle || asnDeckIds.length === 0) {
      setError('Title and at least one deck are required');
      return;
    }
    // Check that at least one test mode is selected
    if (!testSettings.mcq && !testSettings.match && !testSettings.writtenDef && !testSettings.writtenTerm) {
      setError('Please select at least one test mode');
      return;
    }
    setError('');
    
    // Convert testSettings object to modes array for backend
    const modesArray = [];
    if (testSettings.mcq) modesArray.push('mcq');
    if (testSettings.match) modesArray.push('match');
    if (testSettings.writtenDef) modesArray.push('writtenDef');
    if (testSettings.writtenTerm) modesArray.push('writtenTerm');
    
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: user.id,
          title: asnTitle,
          description: asnDesc,
          due_date: asnDueDate || null,
          deck_ids: asnDeckIds,
          modes: modesArray
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create assignment');
        return;
      }
      setAsnTitle('');
      setAsnDesc('');
      setAsnDueDate('');
      setAsnDeckIds([]);
      setAsnModes([]);
      setTestSettings({ mcq: true, match: true, writtenDef: true, writtenTerm: false });
      setShowCreateAssignment(false);
      fetchAssignments();
    } catch {
      setError('Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: user.id })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete assignment');
        return;
      }
      fetchAssignments();
    } catch {
      setError('Failed to delete assignment');
    }
  };

  const toggleAsnDeck = (deckId) => {
    setAsnDeckIds(prev =>
      prev.includes(deckId) ? prev.filter(id => id !== deckId) : [...prev, deckId]
    );
  };

  const toggleAsnMode = (mode) => {
    setAsnModes(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  const toggleTestSetting = (key) => {
    setTestSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const testModeOptions = [
    { key: 'mcq', label: t('multipleChoice') || 'Multiple Choice' },
    { key: 'match', label: t('matchMode') || 'Match' },
    { key: 'writtenDef', label: t('writeDefinition') || 'Write Definition' },
    { key: 'writtenTerm', label: t('writeTerm') || 'Write Term' },
  ];

  if (loading) return <div>{t('loading')}</div>;
  if (!group) return <div>{t('groupNotFound')}</div>;

  return (
    <>
      <Header user={user} />
      <div className="sg-cont">
        <div className="sg-block"></div>
        <div className="sg-block gp-main">
          <h2 className="gp-title">{group.name}</h2>
          {group.description && <p className="gp-desc">{group.description}</p>}
          {error && <div className="eg-error">{error}</div>}
          <hr style={{ margin: '8px 0' }} />

          <div className="gp-content">
            {/* Left: Decks & Folders */}
            <div className="gp-left">
              {/* Decks section */}
              <div className="gp-section">
                <h3>{t('decks') || 'Decks'}</h3>
                {isTeacher && (
                  <div className="gp-add-row">
                    <select
                      value={selectedDeck}
                      onChange={e => setSelectedDeck(e.target.value)}
                      className="gp-select"
                    >
                      <option value="">{t('selectDeck') || ' Select Deck '}</option>
                      {availableDecks.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <button className="gp-add-btn" onClick={handleAddDeck} disabled={!selectedDeck}>
                      +
                    </button>
                  </div>
                )}
                <div className="gp-items">
                  {groupDecks.length === 0 && <p className="gp-empty">{t('noDecks') || 'No decks yet.'}</p>}
                  {groupDecks.map(d => (
                    <div key={d.id} className="gp-item">
                      <Link className="group-link" to={`/deck/${d.id}`}>{d.name}</Link>
                      {isTeacher && (
                        <button className="gp-remove-btn" onClick={() => handleRemoveDeck(d.id)}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <hr className="gp-divider" />

              {/* Folders section */}
              <div className="gp-section">
                <h3>{t('folders') || 'Folders'}</h3>
                {isTeacher && (
                  <div className="gp-add-row">
                    <select
                      value={selectedFolder}
                      onChange={e => setSelectedFolder(e.target.value)}
                      className="gp-select"
                    >
                      <option value="">{t('selectFolder') || ' Select Folder '}</option>
                      {availableFolders.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                    <button className="gp-add-btn" onClick={handleAddFolder} disabled={!selectedFolder}>
                      +
                    </button>
                  </div>
                )}
                <div className="gp-items">
                  {groupFolders.length === 0 && <p className="gp-empty">{t('noFolders') || 'No folders yet.'}</p>}
                  {groupFolders.map(f => (
                    <div key={f.id} className="gp-item">
                      <Link className="group-link" to={`/folder/${f.id}`}>{f.name}</Link>
                      {isTeacher && (
                        <button className="gp-remove-btn" onClick={() => handleRemoveFolder(f.id)}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vertical divider */}
            <div className="gp-vertical-divider"></div>

            {/* Right: Members */}
            <div className="gp-right">
              <div className="gp-section">
                <h3>{t('members')} ({members.length})</h3>
                <div className="gp-items">
                  {members.length === 0 && <p className="gp-empty">{t('noMembers')}</p>}
                  {members.map(m => (
                    <div key={m.id} className="gp-member">
                      <Link className="group-link" to={`/profile/${m.id}`}>
                        {m.username}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="gp-divider" style={{ margin: '16px 0' }} />

          {/* Assignments Section */}
          <div className="gp-assignments-section">
            <h3>{t('assignments')}</h3>

            {isTeacher && !showCreateAssignment && (
              <button className="gp-add-btn btn-cr-ass" style={{ marginBottom: 12 }} onClick={() => setShowCreateAssignment(true)}>
                {t('createAssignment')}
              </button>
            )}

            {isTeacher && showCreateAssignment && (
              <form className="asn-create-form" onSubmit={handleCreateAssignment}>
                <input
                  type="text"
                  placeholder={t('assignmentTitle')}
                  value={asnTitle}
                  onChange={e => setAsnTitle(e.target.value)}
                  required
                  className="asn-input"
                />
                <input
                  type="text"
                  placeholder={t('assignmentDescription')}
                  value={asnDesc}
                  onChange={e => setAsnDesc(e.target.value)}
                  className="asn-input"
                />
                <label className="asn-label">{t('dueDate')}</label>
                <input
                  type="datetime-local"
                  value={asnDueDate}
                  onChange={e => setAsnDueDate(e.target.value)}
                  className="asn-input"
                />


                <hr style={{ margin: '1px 0' }} />
                <label className="asn-label">{t('selectDecksForAssignment')}</label>
                <hr style={{ margin: '1px 0' }} />
                
                <div className="asn-checkboxes">
                  {groupDecks.map(d => (
                    <label key={d.id} className="asn-checkbox-label">
                      <input
                        type="checkbox"
                        checked={asnDeckIds.includes(d.id)}
                        onChange={() => toggleAsnDeck(d.id)}
                      />
                      {d.name}
                    </label>
                  ))}
                </div>
               

                <hr style={{ margin: '1px 0' }} />
                <label className="asn-label">{t('selectTestModes') || 'Select Test Modes'}</label>
                <hr style={{ margin: '1px 0' }} />
                
                <div className="asn-checkboxes">
                  {testModeOptions.map(m => (
                    <label key={m.key} className="asn-checkbox-label">
                      <input
                        type="checkbox"
                        checked={testSettings[m.key]}
                        onChange={() => toggleTestSetting(m.key)}
                      />
                      {m.label}
                    </label>
                  ))}
                </div>
               

                <div className="asn-form-actions">
                  <button type="submit" className="gp-add-btn btn-cr-ass">{t('createAssignment')}</button>
                  <button type="button" className="gp-remove-btn" onClick={() => setShowCreateAssignment(false)}>✕</button>
                </div>
              </form>
            )}

            <div className="asn-list">
              {assignments.length === 0 && <p className="gp-empty">{t('noAssignments')}</p>}
              {assignments.map(a => (
                <div key={a.id} className="asn-card">
                  <div className="asn-card-header">
                    <Link className="group-link" to={`/assignment/${a.id}`}>{a.title}</Link>
                    <span className="asn-due">
                      {a.due_date
                        ? `${t('due')}: ${new Date(a.due_date).toLocaleDateString()}`
                        : t('noDueDate')}
                    </span>
                  </div>
                  {a.description && <p className="gp-empty" style={{ fontStyle: 'normal', textAlign: 'left' }}>{a.description}</p>}
                  <div className="asn-card-modes">
                    {(a.modes || []).includes('mcq') && <span className="asn-mode-tag">{t('multipleChoice') || 'Multiple Choice'}</span>}
                    {(a.modes || []).includes('match') && <span className="asn-mode-tag">{t('matchMode') || 'Match'}</span>}
                    {(a.modes || []).includes('writtenDef') && <span className="asn-mode-tag">{t('writeDefinition') || 'Write Definition'}</span>}
                    {(a.modes || []).includes('writtenTerm') && <span className="asn-mode-tag">{t('writeTerm') || 'Write Term'}</span>}
                  </div>
                  <div className="asn-card-actions">
                    <Link className="gp-add-btn si" to={`/assignment/${a.id}`} style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '4px 12px' }}>
                      {t('viewAssignment')}
                    </Link>
                    {isTeacher && (
                      <button className="gp-remove-btn si" onClick={() => handleDeleteAssignment(a.id)}>
                        {t('deleteAssignment')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="eg-back-btn" onClick={() => navigate('/study-groups')}>
            ← {t('backToGroups')}
          </button>
        </div>
        <div className="sg-block"></div>
      </div>
    </>
  );
};

export default GroupPage;

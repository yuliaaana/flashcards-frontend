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

  const isTeacher = user && group && user.id === group.teacher_id;

  useEffect(() => {
    fetchGroup();
    fetchGroupDecks();
    fetchGroupFolders();
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
                      <option value="">{t('selectDeck') || '-- Select Deck --'}</option>
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
                      <option value="">{t('selectFolder') || '-- Select Folder --'}</option>
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

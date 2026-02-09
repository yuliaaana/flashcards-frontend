
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './components/homepage/Header';
import { useTranslation } from 'react-i18next';
import './styles/groups.css';

const StudyGroupsPage = ({ user }) => {
  const { t } = useTranslation('header');
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroups();
    if (user && user.role === 'teacher') fetchMyGroups();
  }, [user]);

  const API_URL = 'http://127.0.0.1:5000/api';
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await get(`${API_URL}/groups`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGroups(Array.isArray(data) ? data : []);
      console.log('Fetched groups:', data);
    } catch (e) {
      setError('Failed to load groups');
    }
    setLoading(false);
  };

  const fetchMyGroups = async () => {
    try {
      const response = await fetch(`${API_URL}/groups?teacher_id=${user?.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMyGroups(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load your groups');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          description: groupDesc,
          teacher_id: user.id
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to create group');
        return;
      }
      setGroupName('');
      setGroupDesc('');
      fetchMyGroups();
      fetchGroups();
    } catch (e) {
      setError('Failed to create group');
    }
  };

  const handleJoin = async (groupId) => {
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to join group');
        return;
      }
      fetchGroups();
    } catch (e) {
      setError('Failed to join group');
    }
  };

  const handleLeave = async (groupId) => {
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to leave group');
        return;
      }
      fetchGroups();
    } catch (e) {
      setError('Failed to leave group');
    }
  };

  if (!user) {
    return <div className="study-groups-page"><h2>{t('createStudyGroup')}</h2><div>Loading user...</div></div>;
  }
  return (
    <>
      <Header user={user} />
    <div className="sg-cont">
    <div className="sg-block"></div>
    <div className="sg-block sg-card">
      <h2>{t('StudyGroup')}</h2>
        <hr style={{ margin: '8px 0' }} />
      {user.role === 'teacher' && (
        <div className="create-group-form">
          <h3>{t('createStudyGroup')}</h3>
          <form onSubmit={handleCreateGroup}>
            <input
              type="text"
              placeholder={t('groupName') || 'Group Name'}
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder={t('groupDescription') || 'Description'}
              value={groupDesc}
              onChange={e => setGroupDesc(e.target.value)}
            />
            <button className="cr-st-btn" type="submit">{t('createStudyGroup')}</button>
          </form>
        </div>
      )}
      {user.role === 'teacher' && (
        <div className="my-groups">
          <h3 className="ur-gr">{t('yourGroups') || 'Groups You Manage'}</h3>
          <div className="group-boxes">
            {(Array.isArray(myGroups) ? myGroups : []).map(g => (
              <div key={g.id} className="group-box">
                <div className="group-box-header">
                  <Link className="group-link" to={`/group/${g.id}`}>{g.name}</Link>
                  <Link className="group-edit-btn" to={`/editgroup/${g.id}`}>
                    ✎ {t('edit') || 'Edit'}
                  </Link>
                </div>
                {g.description && <p className="group-box-desc">{g.description}</p>}
                <span className="group-members-count">{g.members ? g.members.length : 0} {t('studentsCount')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {user.role === 'student' && (
        <div className="available-groups">
          <h3>{t('availableGroups') || 'Available Groups'}</h3>
          <ul>
            {(Array.isArray(groups) ? groups : []).map(g => (
              <li key={g.id}>
                <Link className="group-link" to={`/group/${g.id}`}>{g.name}</Link>
                <span>- {g.description}</span>
                {g.is_member ? (
                  <button onClick={() => handleLeave(g.id)}>{t('leave') || 'Leave'}</button>
                ) : (
                  <button onClick={() => handleJoin(g.id)}>{t('join') || 'Join'}</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {loading && <div>Loading...</div>}
    </div>
    <div className="sg-block"></div>
    </div>
    </>
  );
};

export default StudyGroupsPage;

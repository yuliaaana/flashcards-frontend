import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from './components/homepage/Header';
import { useTranslation } from 'react-i18next';
import './styles/groups.css';

const API_URL = 'http://127.0.0.1:5000/api';

const EditGroupPage = ({ user }) => {
  const { t } = useTranslation('header');
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [addInput, setAddInput] = useState('');
  const [addResult, setAddResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}`);
      if (!response.ok) throw new Error('Failed to load group');
      const data = await response.json();
      setGroup(data);
      await fetchMembers(data.members || []);
    } catch (e) {
      setError(t('failedLoadGroup'));
    }
    setLoading(false);
  };

  const fetchMembers = async (memberIds) => {
    const membersList = [];
    for (const id of memberIds) {
      try {
        const res = await fetch(`${API_URL}/user-data/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user) membersList.push(data.user);
        }
      } catch (e) {
        // skip failed fetches
      }
    }
    setMembers(membersList);
  };

  useEffect(() => {
    if (user) fetchGroup();
  }, [user, groupId]);

  const handleAddStudents = async (e) => {
    e.preventDefault();
    setError('');
    setAddResult(null);
    const usernames = addInput.split(',').map(n => n.trim()).filter(n => n);
    if (!usernames.length) {
      setError(t('enterUsername'));
      return;
    }
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/add_students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: user.id,
          usernames
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || t('failedAddStudents'));
        return;
      }
      setAddResult(data);
      setAddInput('');
      fetchGroup();
    } catch (e) {
      setError(t('failedAddStudents'));
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: studentId })
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || t('failedRemoveStudent'));
        return;
      }
      fetchGroup();
    } catch (e) {
      setError(t('failedRemoveStudent'));
    }
  };

  if (!user) {
    return <div className="sg-cont"><div className="sg-block sg-card">{t('loadingUser')}</div></div>;
  }

  if (loading) {
    return (
      <>
        <Header user={user} />
        <div className="sg-cont">
          <div className="sg-block"></div>
          <div className="sg-block sg-card">{t('loading')}</div>
          <div className="sg-block"></div>
        </div>
      </>
    );
  }

  if (!group) {
    return (
      <>
        <Header user={user} />
        <div className="sg-cont">
          <div className="sg-block"></div>
          <div className="sg-block sg-card">{t('groupNotFound')}</div>
          <div className="sg-block"></div>
        </div>
      </>
    );
  }

  const isTeacher = user.id === group.teacher_id;

  return (
    <>
      <Header user={user} />
      <div className="sg-cont">
        <div className="sg-block"></div>
        <div className="sg-block sg-card">
          <h2>{group.name}</h2>
          {group.description && <div className="eg-desc-text">{group.description}</div>}
          <hr style={{ margin: '8px 0' }} />

          <div className="eg-members">
            <h3>{t('members')}</h3>
            {members.length === 0 ? (
              <p className="eg-no-members">{t('noMembers')}</p>
            ) : (
              <ul className="eg-members-list">
                {members.map(m => (
                  <li key={m.id} className="eg-member-item">
                    <Link className="eg-member-name group-link" to={`/profile/${m.id}`}>{m.username}</Link>
                    {isTeacher && (
                      <button className="eg-remove-btn" onClick={() => handleRemoveStudent(m.id)}>
                        {t('remove')}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isTeacher && (
            <>
              <hr style={{ margin: '12px 0' }} />
              <div className="eg-add-students">
                <h3>{t('addStudents')}</h3>
                <form onSubmit={handleAddStudents} className="eg-add-form">
                  <input
                    type="text"
                    placeholder={t('addStudentsPlaceholder')}
                    value={addInput}
                    onChange={e => setAddInput(e.target.value)}
                  />
                  <button className="cr-st-btn" type="submit">{t('addStudents')}</button>
                </form>
                {addResult && (
                  <div className="eg-add-result">
                    {addResult.added && addResult.added.length > 0 && (
                      <div className="eg-result-added">{t('added')}: {addResult.added.join(', ')}</div>
                    )}
                    {addResult.not_found && addResult.not_found.length > 0 && (
                      <div className="eg-result-notfound">{t('notFound')}: {addResult.not_found.join(', ')}</div>
                    )}
                    {addResult.already_member && addResult.already_member.length > 0 && (
                      <div className="eg-result-already">{t('alreadyMember')}: {addResult.already_member.join(', ')}</div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {error && <div className="eg-error">{error}</div>}

          <button className="eg-back-btn" onClick={() => navigate('/study-groups')}>
            ← {t('backToGroups')}
          </button>
        </div>
        <div className="sg-block"></div>
      </div>
    </>
  );
};

export default EditGroupPage;

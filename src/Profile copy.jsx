import React, { useState, useEffect, useRef } from 'react';
import Header from './components/homepage/Header';
import './styles/profile.css';
import profile_default from './assets/profile_default.png';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editedUser, setEditedUser] = useState({ username: '', email: '' });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      fetch(`http://127.0.0.1:5000/api/user-data/${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            setEditedUser({ username: data.user.username, email: data.user.email });
          } else {
            console.error('Invalid data format:', data);
          }
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await fetch(`http://127.0.0.1:5000/api/update-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarChange = (e) => {
    setSelectedAvatar(e.target.files[0]);
    handleUploadAvatar(e.target.files[0]);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleUploadAvatar = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const userId = localStorage.getItem('user_id');

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/upload-avatar/${userId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Avatar updated!');
      } else {
        alert('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return alert('Please enter new password');

    const userId = localStorage.getItem('user_id');

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/change-password/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setNewPassword('');
      } else {
        alert('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  return (
    <>
      <Header />
      <h1>Profile Information</h1>
      <div className="profile-container">
        <div className="profile-items"></div>
        <div className="profile-items">
          {user ? (
            <div className="profile-data">
              <img className="image" src={profile_default} alt="Avatar" />
              
              {/* Profile Information Section */}
              <div className="profile-section">
                <div>
                  <label>Username:</label>
                  <input
                    className="input-group"
                    type="text"
                    name="username"
                    value={editedUser.username}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Email:</label>
                  <input
                    className="input-group"
                    type="email"
                    name="email"
                    value={editedUser.email}
                    onChange={handleChange}
                  />
                </div>

                <button onClick={handleSave} className="save-button">
                  Save Changes
                </button>
              </div>
              
              {/* Avatar Upload Section */}
              <div className="profile-section">
                <h3>Change Profile Picture</h3>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                <button onClick={handleUploadClick} className="save-button">
                  Upload Avatar
                </button>
              </div>
              
              {/* Password Change Section */}
              <div className="profile-section">
                <h3>Change Password</h3>
                <label>New Password:</label>
                <input
                  className="input-group"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button onClick={handleChangePassword} className="save-button">
                  Change Password
                </button>
              </div>
            </div>
          ) : (
            <p>Loading user data...</p>
          )}
        </div>
        <div className="profile-items"></div>
      </div>
    </>
  );
}
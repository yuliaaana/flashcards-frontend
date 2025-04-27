import React, { useState, useEffect, useRef } from 'react';
import Header from './components/homepage/Header';
import './styles/profile.css';
import profile_default from './assets/profile_default.png';
import { useTranslation } from "react-i18next";
import "./i18n";

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [editedUser, setEditedUser] = useState({ username: '', email: '' });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const fileInputRef = useRef(null);
  const { t, i18n } = useTranslation("profile");

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
    /*e.preventDefault();*/
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
        window.location.reload(); // Оновлює сторінку після завантаження аватара
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

  // Отримуємо аватар з поля `avatar`
  // Отримуємо аватар з поля `avatar`
const getAvatarUrl = () => {
  return user && user.avatar
    ? `data:image/png;base64,${user.avatar}`  // Використовуємо base64-кодований аватар
    : profile_default; // Якщо аватар не задано, показуємо дефолтне фото
};


  return (
    <>
      <Header />
      <h1>{t("yourProfile")}</h1>
      <div className="profile-container">
        <div className="profile-items"></div>
        <div className="profile-items main-profile-content">
          {user ? (
            <div className="profile-two-columns">
              {/* Left Column - User Info */}
              <div className="profile-left-column">
                {/* Відображення аватара з БД */}
                <img
                  className="image"
                  src={getAvatarUrl()} // Використовуємо аватар або дефолтний
                  alt="Avatar"
                />
                <div className="user-info">
                  <h3>{t("infoProfile")}</h3>
                  <p><strong>{t("username")}</strong> {user.username}</p>
                  <p><strong>{t("email")}</strong> {user.email}</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                  <button onClick={handleUploadClick} className="save-button">
                  {t("changeAvatar")}
                  </button>
                </div>
              </div>

              {/* Right Column - Edit Forms */}
              <div className="profile-right-column">
                {/* Edit Profile Section */}
                <div className="profile-section">
                  <h3>{t("editProfile")}</h3>
                  <div>
                    <label>{t("username")}</label>
                    <input
                      className="input-group"
                      type="text"
                      name="username"
                      value={editedUser.username}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label>{t("email")}</label>
                    <input
                      className="input-group"
                      type="email"
                      name="email"
                      value={editedUser.email}
                      onChange={handleChange}
                    />
                  </div>

                  <button onClick={handleSave} className="save-button">
                  {t("saveChanges")}
                  </button>
                </div>
                
                {/* Password Change Section */}
                <div className="profile-section">
                  <h3>{t("changePass")}</h3>
                  <label>{t("newPassword")}</label>
                  <input
                    className="input-group"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button onClick={handleChangePassword} className="save-button">
                  {t("saveChanges")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p>{t("loading")}</p>
          )}
        </div>
        <div className="profile-items"></div>
      </div>
    </>
  );
}

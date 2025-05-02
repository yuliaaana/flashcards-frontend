import React, { useState, useEffect } from 'react';
import Header from './components/homepage/Header';
import AnimatedBackground from './components/AnimatedBackground';
import './styles/profile.css';
import './styles/publicprofile.css';
import profile_default from './assets/profile_default.png';
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from 'react-router-dom';
import "./i18n";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [folders, setFolders] = useState([]);
  const [decks, setDecks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const { t } = useTranslation("profilepublic");
  const navigate = useNavigate();

  // Отримуємо ID користувача з URL
  const { userId } = useParams();

  useEffect(() => {
    // Завантажуємо дані користувача
    fetch(`http://127.0.0.1:5000/api/user-data/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.user) {
          setUser(data.user);
          setFolders(data.folders || []); // Припускаємо, що в користувача є масив папок
          // Фільтруємо деки, щоб відображати лише ті, які мають is_public: true
          const publicDecks = data.decks.filter(deck => deck.is_public === true);
          setDecks(publicDecks); // Встановлюємо лише публічні деки
        } else {
          console.error('Invalid data format:', data);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, [userId]);

  const getAvatarUrl = () => {
    return user && user.avatar
      ? `data:image/png;base64,${user.avatar}`  // Використовуємо base64-кодований аватар
      : profile_default; // Якщо аватар не задано, показуємо дефолтне фото
  };

  const handleDeckClick = (deck) => {
    setSelectedDeck(deck); // Встановлюємо обраний дек
    setShowModal(true); // Показуємо модальне вікно
  };

  const handleConfirmNavigation = () => {
    if (selectedDeck) {
      // Перехід на сторінку вивчення деку
      navigate(`/learn/${selectedDeck.id}`);
    }
    setShowModal(false); // Закриваємо модальне вікно
  };

  const handleCancelNavigation = () => {
    setShowModal(false); // Просто закриваємо модальне вікно
  };

  return (
    <>
      <Header />
      <div class="bg"></div>
        <div class="bg bg2"></div>
        <div class="bg bg3"></div>
      <h1>{t("profileTitle")}</h1>
      <div className="profile-container">
        <div className="profile-items"></div>
        <div className="profile-items main-profile-content">
          {user ? (
            <div className="profile-two-columns">
              {/* Left Column - User Info */}
              <div className="profile-left-column">
                <img
                  className="image"
                  src={getAvatarUrl()} // Використовуємо аватар або дефолтний
                  alt="Avatar"
                />
                <div className="user-info">
                  <h3>{t("infoProfile")}</h3>
                  <p><strong>{t("username")}</strong> {user.username}</p>
                  <p><strong>{t("email")}</strong> {user.email}</p>
                </div>
              </div>

              {/* Right Column - Folders & Decks */}
              <div className="profile-right-column">
                {/* Folders Section */}
                <div className="profile-section">
                  <h3>{t("folders")}</h3>
                  {folders.length > 0 ? (
                    <ul>
                      {folders.map((folder) => (
                        <li key={folder.id} style={{cursor: 'pointer'}} className="deck-name" >{folder.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{t("noFolders")}</p>
                  )}
                </div>

                {/* Decks Section */}
                <div className="profile-section">
  <h3>{t("decks")}</h3>
  {decks.length > 0 ? (
    <ul>
      {decks.map((deck) => (
        <li 
          key={deck.id} 
          onClick={() => handleDeckClick(deck)} 
          style={{cursor: 'pointer'}}
          className="deck-name"  // Додаємо клас для синього кольору та ховера
        >
          {deck.name}
        </li>
      ))}
    </ul>
  ) : (
    <p>{t("noDecks")}</p>
  )}
</div>

              </div>
            </div>
          ) : (
            <p>{t("loading")}</p>
          )}
        </div>
        <div className="profile-items"></div>
      </div>

      {/* Модальне вікно для підтвердження */}
      {showModal && (
  <div className="modal">
    <div className="modal-content">
      <h4>{t("confirmNavigation")}</h4>
      <p>{t("confirmText")} {selectedDeck?.name}' ?</p>
      <div className="buttons">
        <button onClick={handleConfirmNavigation}>{t("yes")}</button>
        <button onClick={handleCancelNavigation}>{t("no")}</button>
      </div>
    </div>
  </div>


      )}
    </>
  );
}

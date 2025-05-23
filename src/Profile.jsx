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

  const { userId } = useParams();

  useEffect(() => {

    fetch(`http://127.0.0.1:5000/api/user-data/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.user) {
          setUser(data.user);
          setFolders(data.folders || []); 

          const publicDecks = data.decks.filter(deck => deck.is_public === true);
          setDecks(publicDecks);
        } else {
          console.error('Invalid data format:', data);
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, [userId]);

  const getAvatarUrl = () => {
    return user && user.avatar
      ? `data:image/png;base64,${user.avatar}`  
      : profile_default; 
  };

  const handleDeckClick = (deck) => {
    setSelectedDeck(deck);
    setShowModal(true); 
  };

  const handleConfirmNavigation = () => {
    if (selectedDeck) {
      navigate(`/learn/${selectedDeck.id}`);
    }
    setShowModal(false);
  };

  const handleCancelNavigation = () => {
    setShowModal(false); 
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
              <div className="profile-left-column">
                <img
                  className="image"
                  src={getAvatarUrl()} 
                  alt="Avatar"
                />
                <div className="user-info">
                  <h3>{t("infoProfile")}</h3>
                  <p><strong>{t("username")}</strong> {user.username}</p>
                  <p><strong>{t("email")}</strong> {user.email}</p>
                </div>
              </div>
              <div className="profile-right-column">

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
                <div className="profile-section">
  <h3>{t("decks")}</h3>
  {decks.length > 0 ? (
    <ul>
      {decks.map((deck) => (
        <li 
          key={deck.id} 
          onClick={() => handleDeckClick(deck)} 
          style={{cursor: 'pointer'}}
          className="deck-name" 
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

import React, { useEffect, useState } from 'react';
import Header from './components/homepage/Header';
import ListsBlock from './components/homepage/ListsBlock';
import DecksBlock from './components/homepage/DecksBlock';
import PublicDecksBlock from './components/homepage/PublicDecksBlock';
import AnimatedBackground from './components/AnimatedBackground';
import './styles/homepage.css';
import { useTranslation } from "react-i18next";
import "./i18n";

function HomePage() {
  const [folders, setFolders] = useState([]);
  const [decks, setDecks] = useState([]);
  const [user, setUser] = useState(null);
  const { t, i18n } = useTranslation();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    console.log('Component mounted');
    const userId = localStorage.getItem('user_id');
    console.log(userId);
    if (userId) {
      fetch(`http://127.0.0.1:5000/api/user-data/${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.l
          console.log(data);
          if (data.folders && data.decks) {
            setFolders(data.folders);
            setDecks(data.decks);
          }
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, []);

  

  return (
    <>
      <Header user={user} />
      <div className="background">
        <AnimatedBackground />
        <div className="parent-home">
          <ListsBlock classname="div3-home" title={t("yourDecks")} items={decks} buttonLabel={t("goToDecks")} redirectTo="/decks" />
          <ListsBlock classname="div4-home" title={t("yourFolders")} items={folders} buttonLabel={t("goToFolders")} redirectTo="/folders" />
          <DecksBlock classname="div5-home" title={t("lastViewed")} />
          <PublicDecksBlock classname="div6-home" title={t("popularPublicDecks")} />
        </div>
      </div>
    </>
  );
}

export default HomePage;

/*import React, { useEffect, useState } from "react";
import '../../styles/homepage.css';
import RecentDeckCard from './RecentDeckCard';

export default function PublicDecksBlock({ classname, title, currentUserId }) {
  const [recentDecks, setRecentDecks] = useState([]);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch(`/api/public-decks/${currentUserId}`);
        const data = await response.json();
        const decks = data.public_decks.slice(0, 4); // беремо лише 4
        setRecentDecks(decks);
      } catch (error) {
        console.error("Помилка при завантаженні дек:", error);
      }
    };

    if (currentUserId) {
      fetchDecks();
    }
  }, [currentUserId]);

  return (
    <div className={classname}>
      <h2 className="title">{title}</h2>
      <div className="card-container">
        {recentDecks.map((deck, index) => (
          <RecentDeckCard key={deck.id || index} deck={deck} />
        ))}
      </div>
    </div>
  );
}*/
import React, { useEffect, useState } from "react";
import '../../styles/homepage.css';
import RecentDeckCard from './RecentDeckCard';

export default function PublicDecksBlock({ classname, title }) {
  const [recentDecks, setRecentDecks] = useState([]);

  useEffect(() => {
    console.log('DecksBlock mounted');

    const userId = localStorage.getItem('user_id');
    console.log("Current user ID:", userId);

    if (userId) {
      fetch(`http://127.0.0.1:5000/api/public-decks/${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Fetched public decks:", data);
          if (data.public_decks) {
            const topFour = data.public_decks.slice(0, 4);
            setRecentDecks(topFour);
            console.log("Top four public decks:", topFour);
            console.log(recentDecks)
          } else {
            console.error('Invalid data format:', data);
          }
        })
        .catch((error) => console.error('Error fetching public decks:', error));
    }
  }, []);

  return (
    <div className={classname}>
      <h2 className="title">{title}</h2>
      <div className="card-container">
        {recentDecks.map((deck, index) => (
                  <RecentDeckCard key={index} deck={{deck}} />
                ))}
      </div>
    </div>
  );
}


import React, { useEffect, useState } from "react";
import '../../styles/homepage.css';
import RecentDeckCard from './RecentDeckCard';



export default function DecksBlock({ classname, title, hehe }) {
  const [recentDecks, setRecentDecks] = useState([]);

  const getRecentDecks = () => {
    
    const savedDecks = localStorage.getItem('recentDecks');
    console.log( "уууу",JSON.parse(savedDecks))
    return savedDecks ? JSON.parse(savedDecks) : [];
  };

  
  useEffect(() => {
    setRecentDecks(getRecentDecks());
  }, []);

  return (
    <div className={classname}>
      <h2 className="title">{title}</h2>
      <div className="card-container">
      {recentDecks.map((deck, index) => (
          <RecentDeckCard key={deck.deck.id || index} deck={deck} />
        ))}
      </div>
    </div>
  );
}


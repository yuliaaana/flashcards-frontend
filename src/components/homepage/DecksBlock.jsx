import React, { useEffect, useState } from "react";
import '../../styles/homepage.css';
import RecentDeckCard from './RecentDeckCard';



export default function DecksBlock({ classname, title, hehe }) {
  const [recentDecks, setRecentDecks] = useState([]);

  // Функція для отримання останніх дек з локального сховища
  const getRecentDecks = () => {
    
    const savedDecks = localStorage.getItem('recentDecks');
    console.log( JSON.parse(savedDecks))
    return savedDecks ? JSON.parse(savedDecks) : [];
  };

  // Збереження дек в локальне сховище

  /*const saveRecentDecks = (deck) => {
    let savedDecks = getRecentDecks();
    console.log("eeeeeeeee")
    console.log(savedDecks)
    console.log("eeeeeeeee")
    savedDecks = [deck, ...savedDecks.filter((d) => d.id !== deck.id)].slice(0, 4); // Обмежити до 4 останніх
    localStorage.setItem('recentDecks', JSON.stringify(savedDecks));
  };*/
  // Встановлюємо стан з останніми деками, коли компонент монтується
  useEffect(() => {
    setRecentDecks(getRecentDecks());
    //console.log( JSON.parse(savedDecks))
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


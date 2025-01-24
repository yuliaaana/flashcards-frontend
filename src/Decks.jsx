import Header from './components/homepage/Header';
import DeckCard from './components/decks/DeckCard';
import React, { useEffect, useState } from 'react';
import './styles/decks.css';

export default function Decks(){
     const [decks, setDecks] = useState([]);
    
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
              if (data.decks) {
                console.log("xexe")
                console.log(data.decks)
                setDecks(data.decks);
              } else {
                console.error('Invalid data format:', data);
              }
            })
            .catch((error) => console.error('Error fetching data:', error));
        }
      }, []); 
      console.log(decks)

    return (
      <>
        <Header />
        <div class="bg"></div>
        <div class="bg bg2"></div>
        <div class="bg bg3"></div>
        <div class="content">
          <div className="decks-container">
            <div className="decks-items"></div>
            <div className="decks-items decks">
              <h2 className='title-deck'>Your decks</h2>
              {decks.map((deck) => (
                <DeckCard key={deck.id} className="deck" {...deck} />
              ))}
            </div>
            <div className="decks-items"></div>
          </div>
        </div>
      </>
    );
}
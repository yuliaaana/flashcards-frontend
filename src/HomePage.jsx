import React, { useEffect, useState } from 'react';
import Header from './components/homepage/Header';
import ListsBlock from './components/homepage/ListsBlock';
import DecksBlock from './components/homepage/DecksBlock';
import './styles/homepage.css';

function HomePage() {
  const [folders, setFolders] = useState([]);
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
          if (data.folders && data.decks) {
            setFolders(data.folders);
            setDecks(data.decks);
          } else {
            console.error('Invalid data format:', data);
          }
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, []); 


  return (
    <>
      <Header />
      <div className="parent-home">
          <ListsBlock classname="div3-home" title="Your decks" items={decks} buttonLabel="Go to Decks" redirectTo="/decks"/>
          <ListsBlock classname="div4-home" title="Your folders" items={folders} buttonLabel="Go to Folders" redirectTo="/folders"/>
          <DecksBlock classname="div5-home" title="Last viewed"/>
          <DecksBlock classname="div6-home" title="Popular public decks"/>
      </div>
    </>
  );
}

export default HomePage;

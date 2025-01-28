import { Routes, Route } from 'react-router-dom';
import Login from './Login'; 
import HomePage from './HomePage'; 
import CreateDeckPage from './CreateDeckPage'; 
import Profile from './Profile'; 
import CreateFolderPage from './CreateFolderPage'; 
import Decks from './Decks'; 
import Deck from './Deck'; 
import Folders from './Folders'; 
import LearningMode from './LearningMode'; 


export default function MainApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/homepage" element={<HomePage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/create-deck" element={<CreateDeckPage />} />
      <Route path="/create-folder" element={<CreateFolderPage />} />

      <Route path="/decks" element={<Decks />} />
      <Route path="/deck/:deckId" element={<Deck />} />
      <Route path="/learn/:deckId" element={<LearningMode />} />
      <Route path="/folders" element={<Folders />} />
    </Routes>
  );
}

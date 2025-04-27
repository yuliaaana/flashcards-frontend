import { Routes, Route } from 'react-router-dom';
import Login from './Login'; 
import Register from './Register'; 
import HomePage from './HomePage'; 
import CreateDeckPage from './CreateDeckPage'; 
import EditProfile from './EditProfile'; 
import Profile from './Profile'; 
import CreateFolderPage from './CreateFolderPage'; 
import Decks from './Decks'; 
import Deck from './Deck'; 
import Folders from './Folders'; 
import Folder from './Folder'; 
import LearningMode from './LearningMode'; 
import EditDeckPage from './EditDeckPage'; 


export default function MainApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/homepage" element={<HomePage />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/create-deck" element={<CreateDeckPage />} />
      <Route path="/create-folder" element={<CreateFolderPage />} />

      <Route path="/decks" element={<Decks />} />
      <Route path="/deck/:deckId" element={<Deck />} />
      <Route path="/learn/:deckId" element={<LearningMode />} />
      <Route path="/folders" element={<Folders />} />
      <Route path="/folder/:folderId" element={<Folder />} />
      <Route path="/edit-deck/:deckId" element={<EditDeckPage />} />

    </Routes>
  );
}

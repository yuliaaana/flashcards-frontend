import { Routes, Route } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
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
import LearningModes from './LearningModes';

import MatchMode from './MatchMode';
import WrittenMode from './WrittenMode';
import EditDeckPage from './EditDeckPage';

import TestLearningMode from './TestLearningMode';
import AssignmentTestMode from './AssignmentTestMode';
import StudyGroupsPage from './StudyGroupsPage';
import GroupPage from './GroupPage';
import AssignmentPage from './AssignmentPage';
import EditGroupPage from './EditGroupPage';


export default function MainApp() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      fetch(`http://127.0.0.1:5000/api/user-data/${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch((error) => console.error('Error fetching user:', error));
    }
  }, []);
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
      <Route path="/learn/:deckId/modes" element={<LearningModes />} />
      <Route path="/learn/:deckId/match" element={<MatchMode />} />
      <Route path="/learn/:deckId/written" element={<WrittenMode />} />
      <Route path="/learn/:deckId/test" element={<TestLearningMode />} />
      <Route path="/assignment/:assignmentId/deck/:deckId/test" element={<AssignmentTestMode />} />
      <Route path="/folders" element={<Folders />} />
      <Route path="/folder/:folderId" element={<Folder />} />
      <Route path="/edit-deck/:deckId" element={<EditDeckPage />} />
      <Route path="/study-groups" element={<StudyGroupsPage user={user} />} />
      <Route path="/group/:groupId" element={<GroupPage user={user} />} />
      <Route path="/assignment/:assignmentId" element={<AssignmentPage user={user} />} />
      <Route path="/editgroup/:groupId" element={<EditGroupPage user={user} />} />
    </Routes>
  );
}

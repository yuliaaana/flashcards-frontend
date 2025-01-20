import Header from './components/homepage/Header';
import FolderCard from './components/decks/FolderCard';
import React, { useEffect, useState } from 'react';
import './styles/folders.css';

export default function Folders(){
     const [folders, setFolders] = useState([]);
    
      useEffect(() => {
        console.log('Component mounted');
        const userId = localStorage.getItem('user_id'); 
        console.log(userId);
    
        if (userId) { 
          fetch(`http://127.0.0.1:5000/api/folders/${userId}`)
            
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              if (data) {
                setFolders(data);
                  console.log(data)
              } else {
                console.error('Invalid data format:', data);
              }
            })
            .catch((error) => console.error('Error fetching data:', error));
        }
      }, []); 
      console.log(folders)

    return (
      <>
        <Header />
        <div class="bg"></div>
        <div class="bg bg2"></div>
        <div class="bg bg3"></div>
        <div class="content">
          <div className="folders-container">
            <div className="folders-items"></div>
            <div className="folders-items folders">
              <h2 className='title-deck'>Your folders</h2>
              {folders.map((folder) => (
                <FolderCard key={folder.id} className="folder" {...folder} />
              ))}
            </div>
            <div className="folders-items"></div>
          </div>
        </div>
      </>
    );
}

/*import Header from './components/homepage/Header';
import FolderCard from './components/decks/FolderCard';
import React, { useEffect, useState } from 'react';
import './styles/folders.css';

export default function Folders(){
     const [folders, setFolders] = useState([]);
    
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
              if (data.folders) {
                setFolders(data.folders);
              } else {
                console.error('Invalid data format:', data);
              }
            })
            .catch((error) => console.error('Error fetching data:', error));
        }
      }, []); 
      console.log(folders)

    return (
      <>
        <Header />
        <div class="bg"></div>
        <div class="bg bg2"></div>
        <div class="bg bg3"></div>
        <div class="content">
          <div className="folders-container">
            <div className="folders-items"></div>
            <div className="folders-items folders">
              <h2 className='title-deck'>Your folders</h2>
              {folders.map((folder) => (
                <FolderCard key={folder.id} className="folder" {...folder} />
              ))}
            </div>
            <div className="folders-items"></div>
          </div>
        </div>
      </>
    );
}*/
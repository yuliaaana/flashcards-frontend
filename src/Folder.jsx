import Header from './components/homepage/Header';
import FolderCard from './components/decks/FolderCardEdit';
import React, { useEffect, useState } from 'react';
import './styles/folders.css';
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from 'react-router-dom';
import "./i18n";
import "./styles/createfolder.css";
import "./styles/createfolderbackground.css";
import AnimatedBackground from './components/AnimatedBackground';


export default function Folder() {
    const { folderId } = useParams(); 
    const [folders, setFolders] = useState([]);
    const [folder, setFolder] = useState(null);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();


    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;

        fetch(`http://127.0.0.1:5000/api/folders/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setFolders(data);
                console.log('Folders:', data);

                // Знаходимо конкретну папку
                const foundFolder = data.find(f => f.id === Number(folderId));
                if (foundFolder) {
                    setFolder(foundFolder);
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }, [folderId]);

    return (
      <>
        <Header />
        <div className="bg"></div>
        <div className="bg bg2"></div>
        <div className="bg bg3"></div>
        <div className="content">
          <div className="folders-container">
            <div className="folders-items"></div>
            <div className="folders-items folders">
              <h2 className="title-deck">{t("folders:editFolder")}</h2>
              {folder ? (
                <FolderCard key={folder.id} className="folder" {...folder} folder_id={folderId} />
              ) : (
                <p>Loading folder...</p>
              )}
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
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from 'react-router-dom';

import "./i18n";


export default function Folder(){
    const { folderId } = useParams(); 
    const [folder, setFolder] = useState(null);
    const [folders, setFolders] = useState([]);

    const navigate = useNavigate();
    console.log(folder)

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;

        fetch(`http://127.0.0.1:5000/api/folders/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setFolders(data);
                console.log('Folders:', data);

                // Знаходимо конкретну папку
                const foundFolder = data.find(f => f.id === folderId);
                if (foundFolder) {
                    setFolder(foundFolder);
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }, [folderId]);
    console.log(folder)
    return(
    <>
    <Header />
    <div class="bg"></div>
            <div class="bg bg2"></div>
            <div class="bg bg3"></div>
            <div class="content">
              <div className="folders-container">
                <div className="folders-items"></div>
                <div className="folders-items folders">
                  <h2 className='title-deck'>ащдвук</h2>
                    <FolderCard className="folder" {...folder} />
                </div>
                <div className="folders-items"></div>
              </div>
            </div>
    
  </>)
}/*
import { useParams } from 'react-router-dom';

function Folder() {
  const { folderId } = useParams();

  return <div>Folder ID: {folderId}</div>;
}

export default Folder;*/

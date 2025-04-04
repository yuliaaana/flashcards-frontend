import Header from "./components/homepage/Header";
import "./styles/createfolder.css";
import "./styles/createfolderbackground.css";
import ListsCheckbox from './components/creates/ListsCheckbox';
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from './components/AnimatedBackground';
import { useTranslation } from "react-i18next";
import "./i18n"; 

//нижній відступ!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1

export default function CreateFolderPage() {
  const [decks, setDecks] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [selectedDecks, setSelectedDecks] = useState([]);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("create");

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      fetch(`http://127.0.0.1:5000/api/user-data/${userId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.folders && data.decks) {
            // Фільтруємо лише ті деки, у яких folder_id порожній або відсутній
            const filteredDecks = data.decks.filter(deck => !deck.folder_id);
            setDecks(filteredDecks);
          } else {
            console.error('Invalid data format:', data);
          }
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, []);
  
  const handleSubmit = () => {
    const userId = localStorage.getItem('user_id');

    if (!userId || !folderName) {
      alert('Please enter a folder name');
      return;
    }

    if (!selectedDecks.length) {
      alert('Please select at least one deck');
      return;
    }

    fetch('http://127.0.0.1:5000/api/create-folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        name: folderName,
        description: folderDescription,
        decks: selectedDecks,
      }),
    })
      .then(response => response.json())
      .then(data => {
        //console.log('Folder created:', data);
        navigate('/folders');
      })
      .catch(error => {
        console.error('Error creating folder:', error);
        alert('Error creating folder. Please try again.');
      });
  };

  return (
    <>
      <Header />
      <div class="background"> 
     <AnimatedBackground />
      <div className="createfolder-container">
        <div className="createfolder-items"></div>
        <div className="createfolder-items">
          <div className="inputs">
            <h4 className="title-main">{t("newfolder")}</h4>
            <section>
              <div className="did-floating-label-content">
                <input 
                  className="did-floating-input" 
                  type="text" 
                  placeholder=" " 
                  value={folderName} 
                  onChange={(e) => setFolderName(e.target.value)}
                />
                <label className="did-floating-label">{t("namenewfolder")}</label>
              </div>
              <div className="did-floating-label-content">
                <input 
                  className="did-floating-input description" 
                  type="text" 
                  placeholder=" " 
                  value={folderDescription} 
                  onChange={(e) => setFolderDescription(e.target.value)}
                />
                <label className="did-floating-label">{t("description")}</label>
              </div>
            </section>

              <div className="create-button">
              <button className="submit-button" onClick={handleSubmit}>
              {t("createfolder")}
            </button>
              </div>
          </div>

          <div className="decks-bullet">
            <ListsCheckbox
              classname="5"
              title={t("addexistingdecks")}
              items={decks}
              onSelectionChange={setSelectedDecks}
            />
          </div>

          
        </div>
        <div className="createfolder-items"></div>
      </div>
      </div>
    </>
  );
}
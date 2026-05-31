import { useNavigate } from "react-router-dom";
import "../../styles/folders.css";
import { useTranslation } from "react-i18next";
import "../../i18n";
import ListsCheckbox from '../creates/ListsCheckbox';
import React, { useState, useEffect } from "react";

export default function FolderCardEdit({ className, created_at, name, decks, folderId,folder_id }) {
  const navigate = useNavigate();
  const [new_decks, setNewDecks] = useState([]);
  const [selectedDecks, setSelectedDecks] = useState([]);
  const formattedDate = new Date(created_at).toISOString().split("T")[0];
  const { t } = useTranslation();

  console.log("eee",folder_id)


  const handleDeckClick = (id) => {
    navigate(`/learn/${id}`);
  };

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
            const filteredDecks = data.decks.filter(deck => !deck.folder_id);
            console.log(data)
            setNewDecks(filteredDecks);
          } else {
            console.error('Invalid data format:', data);
          }
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, []);

  const handleAddDecks = () => {
    if (selectedDecks.length === 0) {
      alert(t("folders:noDecksSelected"));
      return;
    }

    fetch("http://127.0.0.1:5000/api/add-deck-to-folder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ folderId:folder_id, deckIds: selectedDecks })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        alert(t("folders:decksAddedSuccess"));
      })
      .catch(error => {
        console.error("Error adding decks:", error);
        alert(t("folders:decksAddedError"));
      });
  };

  return (
    <div className={`${className} foldercard-container`}>
      <div className="foldercard-items">
        <h4 className="name">{`${t("folders:name")} : ${name}`}</h4>
        <h5>{`${t("folders:createdAt")} ${formattedDate}`}</h5>
      </div>
      <div className="foldercard-items">
        <h6>{t("folders:decks")}</h6>
        <ul>
          {decks.map((item) => (
            <li
              className="list cursor-pointer"
              key={item.id}
              onClick={() => handleDeckClick(item.id)}
            >
              {item.name}
            </li>
          ))}
        </ul>
        
        <div className="decks-bullet">
          <ListsCheckbox
            className="custom-checkbox"
            title={t("folders:addexistingdecks")}
            items={new_decks}
            onSelectionChange={setSelectedDecks}
          />
        </div>
        <button className="add-decks-btn btn-study" onClick={handleAddDecks}>
          {t("folders:addSelectedDecks")}
        </button>
      </div>
    </div>
  );
}

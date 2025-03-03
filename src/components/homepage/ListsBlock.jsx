import React from "react";
import { useNavigate } from "react-router-dom";

function ListsBlock({ classname, title, items = [], buttonLabel, redirectTo }) {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    // Перевірка назви масиву items
    if (Array.isArray(items) && items.length > 0) {
      const isDecks = items[0]?.folder_id ? true : false; // Перевірка, чи є у першого елемента 'name'
      
      if (isDecks) {
        navigate(`/learn/${item.id}`);
      } else {
        navigate(`/folder/${item.id}`);
      }
    }
  };
  
  //console.log(items);

  const handleButtonClick = () => {
    navigate(redirectTo);
  };

  return (
    <div className={classname}>
      <h2 className="title">{title}</h2>
      <ul>
        {items.map((item) => (
          <li
            className="list"
            key={item.id}
            onClick={() => handleItemClick(item)}
            style={{ cursor: "pointer" }}
          >
            {item.name}
          </li>
        ))}
      </ul>
      {buttonLabel && redirectTo && (
        <button className="bottom-button" onClick={handleButtonClick}>
          {buttonLabel}
        </button>
      )}
    </div>
  );
}

export default ListsBlock;

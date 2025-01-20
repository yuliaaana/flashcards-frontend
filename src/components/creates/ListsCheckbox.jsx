import React, { useState } from 'react';
import "../../styles/createfolder.css";

function ListsCheckbox({ classname, title, items = [], onSelectionChange }) {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckboxChange = (id) => {
    const newSelectedItems = selectedItems.includes(id)
      ? selectedItems.filter((itemId) => itemId !== id)
      : [...selectedItems, id];
    
    setSelectedItems(newSelectedItems);
    onSelectionChange(newSelectedItems);
  };

  return (
    <div className={classname}>
      <h2 className="title-checkbox">{title}</h2>
      {items.length > 0 ? (
        <ul className='checkbox-list'>
          {items.map((item) => (
            <li key={item.id}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleCheckboxChange(item.id)}
                />
                <div className="checkbox-text">{item.name}</div>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p>No items available.</p>
      )}
    </div>
  );
}

export default ListsCheckbox;
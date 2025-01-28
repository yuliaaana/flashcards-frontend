import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeckCard({ className, created_at, creator, name, terms, id }) {
  const navigate = useNavigate();

  const handleStartStudying = () => {
    navigate(`/deck/${id}`); 
  };

  return (
    <div className={className}>
      <h4 className="name">{name}</h4>
      <h5>Terms: {terms}</h5>
      <h5>Created by: {creator}</h5>
      <h5>Created at: {created_at}</h5>
      <div className="buttons-container">
        <button className="buttons-items" type="button" onClick={handleStartStudying}>
          Start studying
        </button>
        <button className="buttons-items" type="button">Edit</button>
        <button className="buttons-items" type="button">Delete</button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Header from './components/homepage/Header';

export default function Profile() {
  const [user, setUser] = useState(null); 

  useEffect(() => {
    console.log('Component mounted');
    const userId = localStorage.getItem('user_id'); 
    console.log("userId", userId);

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
            console.log(data.user);
          } else {
            console.error('Invalid data format:', data);
          }
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, []); 

  return (
    <>
      <Header />
      {user ? (
        <div>
          <h1>Profile Information</h1>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        <p>Loading user data...</p> 
      )}
    </>
  );
}

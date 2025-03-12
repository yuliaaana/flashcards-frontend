import React, { useState, useEffect } from 'react';
import Header from './components/homepage/Header';
import './styles/profile.css';
import profile_default from './assets/profile_default.png';

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
      <h1>Profile Information</h1>
      <div className="profile-container">
        
      <div className="profile-items"></div>
      <div className="profile-items">
        
      <div className="profile-data">
      
      {user ? (
        <div >
          
          <img className='1'
                      src={profile_default}
                      alt="Main Logo"
                      
                    />
          <p className="pp"><strong>ID:</strong> {user.id}</p>
          <p className="pp"><strong>Username:</strong> {user.username}</p>
          <p className="pp"><strong>Email:</strong> {user.email}</p>

        </div>
      ) : (
        <p>Loading user data...</p> 
      )}
      
      
      </div>
      <div className="profile-other">
        <h3>Other Information</h3>
        <h6>Upload new photo</h6>
        <h6>Change password</h6>
        <h6>Change email</h6>
        <h6>Delete account</h6>

      </div>
      </div>
      <div className="profile-items"></div>
      </div>
    </>
  );
}

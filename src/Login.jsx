import './styles/login1.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import logo from './assets/logo2.png';
import { useTranslation } from "react-i18next";
import "./i18n"; // Підключаємо i18n

function Dashboard() {
  return <h1>Welcome to your Dashboard!</h1>;
}

export default function Login() {
  const navigate = useNavigate(); 
  const [userInput, setUserInput] = useState({
    username: '',
    password: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const { t, i18n } = useTranslation();

  function handleChange(inputIdentifier, newValue) {
    setUserInput(prevUserInput => ({
      ...prevUserInput,
      [inputIdentifier]: newValue
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault(); 

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userInput)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user_id', data.user_id);
        navigate('/homepage');
      } else {
        setErrorMessage(data.message); 
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Something went wrong!');
    }
  }

  return (
    <div className="App parent">
      {/*<h1>{t("hello")}</h1>
      <button onClick={() => i18n.changeLanguage("en")}>English</button>
      <button onClick={() => i18n.changeLanguage("uk")}>Українська</button>*/}

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form className='div3' onSubmit={handleSubmit}>
      <div><h1 >Login</h1></div>
        <input
          type="text"
          required
          value={userInput.username}
          onChange={(event) => handleChange('username', event.target.value)}
          placeholder="Enter your username"
        />
        <input
          type="password"
          required
          value={userInput.password}
          onChange={(event) => handleChange('password', event.target.value)}
          placeholder="Enter your password"
        />
        <button type="submit">Login</button>
      </form>

      <img className='div1'
            src={logo}
            alt="Main Logo"
            
          />
    </div>
  );
}



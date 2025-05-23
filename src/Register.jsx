import './styles/login1.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo2.png';
import InitialHeader from './components/homepage/InitialHeader';
import { useTranslation } from "react-i18next";
import "./i18n";

export default function Register() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("login");
  const [userInput, setUserInput] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  function handleChange(inputIdentifier, newValue) {
    setUserInput(prev => ({ ...prev, [inputIdentifier]: newValue }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInput)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user_id) {
          localStorage.setItem('user_id', data.user_id);
        }
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
    <div>
      <InitialHeader />
    <div className="App parent">
      
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form className="div3" onSubmit={handleSubmit}>
        <div><h1>{t("register")}</h1></div>
        <input
          className="input-field"
          type="text"
          required
          value={userInput.username}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder={t("chooseUsername")}
        />
        <input
          className="input-field"
          type="email"
          required
          value={userInput.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder={t("enterEmail")}
        />
        <input
          className="input-field"
          type="password"
          required
          value={userInput.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder={t("choosePassword")}
        />
        <button type="submit">{t("register")}</button>

        {/* Кнопка повернення на логін */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{
            marginTop: '10px',
            background: 'none',
            border: 'none',
            color: 'blue',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          {t("moveToLogin")}
        </button>
      </form>

      <div className="div1">
        <h2> {t("welcome")}</h2>
        <h2> {t("regOrLog")}</h2>
        <img className="img-logo" src={logo} alt="Main Logo" />
      </div>
    </div>
    </div>
  );
}

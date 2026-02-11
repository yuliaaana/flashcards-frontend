import './styles/login1.css'; 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo2.png';
import { useTranslation } from "react-i18next";
import "./i18n";
import InitialHeader from './components/homepage/InitialHeader';

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
  const { t, i18n } = useTranslation("login");

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
    <div>
       <InitialHeader />
    <div className="App parent">
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form className='div3' onSubmit={handleSubmit}>
        <div><h1> {t("login")}</h1></div>
        <input
          className="input-field lg-inp"
          type="text"
          required
          value={userInput.username}
          onChange={(event) => handleChange('username', event.target.value)}
          placeholder={t("enterUsername")}
        />
        <input
          className="input-field lg-inp"
          type="password"
          required
          value={userInput.password}
          onChange={(event) => handleChange('password', event.target.value)}
          placeholder={t("enterPassword")}
        />
        <button className="bt" type="submit"> {t("login")}</button>

        <button
          type="button"
          onClick={() => navigate('/register')}
          style={{
            marginTop: '10px',
            background: 'none',
            border: 'none',
            color: 'blue',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          {t("newUserReg")}
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

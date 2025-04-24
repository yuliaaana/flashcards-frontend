import './styles/login1.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo2.png';

export default function Register() {
  const navigate = useNavigate();
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
        // Після успішної реєстрації перенаправляємо на логін
        navigate('/login');
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
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form className="div3" onSubmit={handleSubmit}>
        <div><h1>Register</h1></div>
        <input
          className="input-field"
          type="text"
          required
          value={userInput.username}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder="Choose a username"
        />
        <input
          className="input-field"
          type="email"
          required
          value={userInput.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Enter your email"
        />
        <input
          className="input-field"
          type="password"
          required
          value={userInput.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="Choose a password"
        />
        <button type="submit">Register</button>

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
          Already have an account? Login
        </button>
      </form>

      <div className="div1">
        <h2>Welcome to FlashApp!</h2>
        <h2>Register or login to continue</h2>
        <img className="img-logo" src={logo} alt="Main Logo" />
      </div>
    </div>
  );
}


/*// src/Register.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/login1.css';
import logo from './assets/logo2.png';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/login');
      } else {
        setErrorMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Something went wrong');
    }
  }

  return (
    <div className="App parent">
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form className='div3' onSubmit={handleSubmit}>
        <div><h1>Register</h1></div>
        <input
          type="text"
          required
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder="Username"
        />
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          required
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Register</button>
      </form>

      <img className='div1' src={logo} alt="Main Logo" />
    </div>
  );
}*/

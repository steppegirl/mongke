import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './registration.css';

function Registration() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    // Basic validation
    if (!name || !email || !password) {
      setError('Бүх талбарыг бөглөнө үү');
      return;
    }

    axios.post('http://localhost:5001/users', { name, email, password })
      .then(() => navigate('/Dashboard'))
      .catch(() => setError('Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.'));
  };

  return (
    <div className="registration-container">
      <div className="registration">
        <h2 className="signup-text">Бүртгүүлэх</h2>
        <form className="registration-form" onSubmit={handleSubmit}>
          <div>
            <h1 className="label">Нэр</h1>
            <input
              type="text"
              className="name"
              placeholder="ТАНЫ НЭР"
              value={name}
              onChange={event => setName(event.target.value)}
              required
            />
          </div>
          <div>
            <h1 className="label">Цахим хаяг</h1>
            <input
              type="email"
              className="email"
              placeholder="ЦАХИМ ХАЯГ"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <h1 className="label">Нууц үг</h1>
            <input
              type="password"
              className="password"
              placeholder="НУУЦ ҮГ"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
            />
          </div>
          {error && <div style={{color: 'red', textAlign: 'center', marginBottom: '1rem'}}>{error}</div>}
          <button className="registration-button" type="submit">Бүртгүүлэх</button>
        </form>
      </div>
    </div>
  );
}

export default Registration;
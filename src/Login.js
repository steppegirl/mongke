import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import axios from 'axios';

function Login(props) {
    const { setUserName, setUserId } = props;
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('http://localhost:5001/login', { email, password })
            .then((response) => {
                setUserName(response.data.userName);
                setUserId(response.data.userId);
                navigate('/Dashboard');
            })
            .catch(() => {
                setError('Invalid email or password');
            });
    };

    return (
        <div className="login-container">
            <div className="login">
                <h2 className="login-text">Нэвтрэх</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div>
                        <h1 className="label">Цахим хаяг</h1>
                        <input
                            type="email"
                            className="email"
                            placeholder="Цахим хаяг"
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
                            placeholder="Нууц үг"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button className="login-button" type="submit">Нэвтрэх</button>
                    <h2 className="reset-password">Нууц үг сэргээх</h2>
                </form>
            </div>
        </div>
    );
}

export default Login;
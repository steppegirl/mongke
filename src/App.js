import logo from './logo.svg';
import React from 'react';
import HomePage from './HomePage';
import './index.css';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

function App() {
    return (
        <Router>
            <div className="root">
                <HomePage />
            </div>
        </Router>
    );
}

export default App;

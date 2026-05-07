import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registration from './registration';
import HomePage from './HomePage';
import Dashboard from './Dashboard.js';
import Login from './Login.js';
import Question from './Question.js';
import Lesson from './Lesson.js';
import DrawingQuestion from './DrawingQuestion';
import OCR from './OCR.js';
import Social from './Social.js';
import MatchingQuestion from './matchingQuestion.js';

const App = () => {
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');

    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<HomePage />}/>
                <Route path="/registration" element={<Registration/>}/>
                <Route path="/Dashboard" element={<Dashboard userName={userName} userId={userId}/>}/>
                <Route path="/Login" element={<Login setUserName={setUserName} setUserId={setUserId} />}/>
                <Route path="/question/:id" element={<Question userName={userName} userId={userId}/>} />
                <Route path="/lesson/:lessonId" element={<Lesson userId={userId}/>} />
                <Route path="/drawing-question" element={<DrawingQuestion userName={userName}/>} />
                <Route path="/OCR" element={<OCR userName={userName}/>} />
                <Route path="/Social" element={<Social userName={userName} userId={userId}/>} />
                <Route path="/matchingQuestion" element={<MatchingQuestion userName={userName}/>} />
            </Routes>
        </Router>

    );
};

export default App;


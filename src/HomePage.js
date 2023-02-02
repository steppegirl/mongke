import React, { useState } from 'react';
import { useNavigate, Router } from 'react-router-dom';


const HomePage = () => {
const history = useNavigate();
const [isClicked, setClick] = useState(false);

    const handleClick = () => {
        setClick(true);
        history('/start');
    }
    return (
        <div>
            <div className="nav-container">
                <div className="nav-left">
                    <button className="nav-button" role="Button">
                        Нүүр хуудас
                    </button>
                    <button className="nav-button">Бидний тухай</button>
                </div>
                <div className="nav-right">
                    <button className="signup-button">Бүртгүүлэх</button>
                    <button className="signup-button">Нэвтрэх</button>
                </div>
            </div>
            <div className="Body">
                <h1>Welcome to my site!</h1>
                <p>This is the body of the page where you can add your content.</p>
                <button className="startButton" onClick={handleClick}>Эхлэх</button>
            </div>
        </div>
    );

};

export default HomePage;

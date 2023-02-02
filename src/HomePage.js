import React from 'react';
import styles from './App.module.css';
import { useHistory } from 'react-router-dom';


const HomePage = () => {
    const history = useHistory();
    const [isClicked, setClick] = useState(false);

    const handleClick = () => {
        setClick(true);
        history.push('/start')
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
            <div className={styles.body}>
                <h1>Welcome to my site!</h1>
                <p>This is the body of the page where you can add your content.</p>
                <button className="startButton" onClick={handleClick}>Эхлэх</button>
            </div>
        </div>
    );
};

export default HomePage;

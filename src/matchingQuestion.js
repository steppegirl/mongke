import React, { useState } from 'react';
import './Dashboard.css';
import './matchingQuestion.css';
import { Link } from 'react-router-dom';
import eyeIcon from './eye.svg';
import socialIcon from './social.svg';
import storyIcon from './storybook.svg';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';

function MatchingQuestion({ userName }) {
    const images = [
        { id: 'img1', src: 'img/o,u-ehend.svg', label: 'о, у (эхэнд)' },
        { id: 'img2', src: 'img/o,u-suuld.svg', label: 'о, у (сүүлд)' },
        { id: 'img3', src: 'img/o,u-dund.svg', label: 'о, у (дунд)' }
    ];

    const labels = images.map(image => ({ id: `text${image.id}`, text: image.label }));

    const [matches, setMatches] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);
    const [result, setResult] = useState('');

    const allowDrop = (event) => {
        event.preventDefault();
    };

    const drag = (event, item) => {
        setDraggedItem(item);
    };

    const drop = (event, imageId) => {
        event.preventDefault();
        if (draggedItem) {
            setMatches(prevMatches => ({
                ...prevMatches,
                [imageId]: draggedItem
            }));
            setDraggedItem(null);
        }
    };

    const checkMatches = () => {
        let correct = 0;
        images.forEach(image => {
            if (matches[image.id] && matches[image.id].text === image.label) {
                correct++;
            }
        });
        setResult(`You got ${correct} out of ${images.length} correct!`);
    };

    return (
        <div>
            <div className="navigation">
                <div className='storybook'>
                    <Link to='/dashboard'>
                        <img src={storyIcon} alt="Storybook" className="story-icon" />
                    </Link>
                </div>
                <div className='ocr'>
                    <Link to='/OCR'>
                        <img src={eyeIcon} alt="OCR" className="ocr-icon" />
                    </Link>
                </div>
                <div className='social'>
                    <Link to='/Social'>
                        <img src={socialIcon} alt="Social" className="social-icon" />
                    </Link>
                </div>
            </div>
            <div className="dashboard-title">
                <h1 className="dashboard-title-h1">Хичээл</h1>
            </div>
        <div className="MatchingQuestion-container">
            <div className="lesson-script-deco" aria-hidden="true">ᠲᠠᠭ</div>
            <div className="question-badge">Үсэг тааруулах</div>
            <h2 className="question-title">Match the Images to the Correct Labels</h2>
            <div className="matching-options">
                <div className="text-options">
                    {labels.map(label => (
                        <div
                            key={label.id}
                            className="text-option"
                            draggable="true"
                            onDragStart={(event) => drag(event, label)}
                        >
                            {label.text}
                        </div>
                    ))}
                </div>
                <div className="image-options">
                    {images.map(image => (
                        <div
                            key={image.id}
                            className="image-option"
                            onDrop={(event) => drop(event, image.id)}
                            onDragOver={allowDrop}
                        >
                            <img src={image.src} alt="Image" />
                            {matches[image.id] && (
                                <div className="text-option">{matches[image.id].text}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <button className="matching-next-button" onClick={checkMatches}>Submit</button>
            <div className="matching-result">{result}</div>
        </div>
        </div>
    );
}

export default MatchingQuestion;
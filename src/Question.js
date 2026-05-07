import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import eyeIcon from './eye.svg';
import socialIcon from './social.svg';
import storyIcon from './storybook.svg';
import './Dashboard.css';
import './Question.css';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function Question({ questionData, onNextQuestion, onIncorrectAnswer, userId }) {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [shuffledAnswers, setShuffledAnswers] = useState([]);
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);
    const [buttonClasses, setButtonClasses] = useState(Array(4).fill(''));

    useEffect(() => {
        setSelectedAnswer(null);

        if (questionData) {
            const choices = [questionData.answer1, questionData.answer2, questionData.answer3, questionData.def];
            const shuffledChoices = shuffleArray(choices);
            const correctIndex = shuffledChoices.findIndex((choice) => choice === questionData.def);
            setCorrectAnswerIndex(correctIndex);
            setShuffledAnswers(shuffledChoices);
        }
    }, [questionData]);

    if (!questionData) {
        return <div>Loading...</div>;
    }

    function handleAnswerSelect(answer, index) {
        setSelectedAnswer(index);
    }

    function onNextButtonClick() {
        if (selectedAnswer !== null) {
            const isCorrect = selectedAnswer === correctAnswerIndex;
            setIsCorrect(isCorrect);

            const updatedButtonClasses = shuffledAnswers.map((_, index) => {
                if (index === selectedAnswer) {
                    return isCorrect ? 'correct' : 'incorrect';
                } else if (index === correctAnswerIndex) {
                    return 'correct';
                } else {
                    return '';
                }
            });

            setButtonClasses(updatedButtonClasses);

            setTimeout(() => {
                if (isCorrect) {
                    axios.post('/updateReviewSchedule', { userId: userId, itemId: questionData.question_id, wasCorrect: true });
                    onNextQuestion();
                } else {
                    axios.post('/updateReviewSchedule', { userId: userId, itemId: questionData.question_id, wasCorrect: false });
                    onIncorrectAnswer(questionData);
                }
                setSelectedAnswer(null);
                setIsCorrect(null);
                setButtonClasses(Array(4).fill(''));
            }, 2000);
        }
    }

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
               <div className='question-container'>
                   <div className="lesson-script-deco" aria-hidden="true">ᠰᠤᠷ</div>
                   <div className="question-badge">Үсэг таних</div>
                   <h1 className="question-title">Зөв хариултыг дарна уу.</h1>
                   <div className="question-content">
                       <div className="background">
                           <img src={`/img/${questionData.image}`} alt="Question" />
                       </div>
                       <div className="button-container">
                           <div className="answer-buttons">
                               {shuffledAnswers.map((answer, index) => (
                                   <button
                                       key={index}
                                       className={`toggle-button ${buttonClasses[index]}`}
                                       onClick={() => handleAnswerSelect(answer, index)}
                                       disabled={selectedAnswer !== null}
                                       >
                                       <span className="answer-text">{answer}</span>
                                       <div className={`toggle-circle ${selectedAnswer === index ? 'checked' : ''}`}>
                                           {selectedAnswer === index && <span className="checkmark">✔</span>}
                                       </div>
                                   </button>
                               ))}
                           </div>
                           <button className="question-button-next" onClick={onNextButtonClick}>Хариулт шалгах</button>
                       </div>
                   </div>
                   <div className="result-message">
                       {isCorrect !== null && (
                           <p className={isCorrect ? 'correct-message' : 'incorrect-message'}>
                               {isCorrect ? 'Correct!' : 'Incorrect. Try again!'}
                           </p>
                       )}
                   </div>
               </div>
           </div>
       );
   }

   export default Question;

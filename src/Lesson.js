import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Question from './Question';
import './lesson.css';
import axios from 'axios';

function Lesson({userId}) {
    const { lessonId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const response = await fetch(`http://localhost:5001/questions/${lessonId}`);
                const data = await response.json();
                setQuestions(data);
                setCurrentQuestionIndex(0);
                setIncorrectQuestions([]);
            } catch (err) {
                console.error(err);
            }
        }
        fetchQuestions();
    }, [lessonId]);

    const handleNextQuestion = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            if (incorrectQuestions.length > 0) {
                setQuestions(incorrectQuestions);
                setCurrentQuestionIndex(0);
                setIncorrectQuestions([]);
            } else {
                // Fetch items for review when all questions are done
                const response = await axios.get(`/getItemsForReview?userId=${userId}`);
                const itemsForReview = response.data;
                if (itemsForReview.length > 0) {
                    setQuestions(itemsForReview);
                    setCurrentQuestionIndex(0);
                } else {
                    window.location.href = '/dashboard';
                }
            }
        }
    };

    const handleIncorrectAnswer = (question) => {
        setIncorrectQuestions(prevIncorrectQuestions => [...prevIncorrectQuestions, question]);
        handleNextQuestion();
    };

    return (
        <div className="lesson-page">
            <div className="quiz">
                {questions.length > 0 && currentQuestionIndex < questions.length && (
                    <Question
                        questionData={questions[currentQuestionIndex]}
                        onNextQuestion={handleNextQuestion}
                        onIncorrectAnswer={handleIncorrectAnswer}
                    />
                )}
            </div>
        </div>
    );
}

export default Lesson;

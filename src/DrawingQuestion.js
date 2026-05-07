import React, { useState, useRef } from 'react';
import './Dashboard.css';
import './DrawingQuestion.css';
import eyeIcon from './eye.svg';
import socialIcon from './social.svg';
import storyIcon from './storybook.svg';
import 'react-calendar/dist/Calendar.css';
import Calendar from'react-calendar';
import ocrIcon from './ocr-icon.svg';
import { Link } from 'react-router-dom';

function DrawingQuestion({userName}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [result, setResult] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef(null);
    const referenceImageRef = useRef(null);
    const drawingImageRef = useRef(null);

    const questions = [
        {
            prompt: "'а' үсэг зурна уу",
            expectedLabel: 'a-ehend',
            imageUrl: "./img/a-ehend.png"
        },
        {
            prompt: "'и' үсэг зурна уу",
            expectedLabel: 'i-ehend',
            imageUrl: "./img/i-ehend.png"
        },
        {
            prompt: "'э' үсэг зурна уу",
            expectedLabel: 'e-ehend',
            imageUrl: "./img/e-ehend.png"
        }
    ];

    const startDrawing = () => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.lineWidth = 5;
        context.lineCap = 'round';
        context.strokeStyle = '#000';
        context.beginPath();
    };

    const endDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        drawingImageRef.current.src = dataURL;
    };

    const handleMouseMove = (event) => {
        if (isDrawing) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            context.lineTo(x, y);
            context.stroke();
        }
    };

    const handleClearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    const isCanvasBlank = (canvas) => {
        const context = canvas.getContext('2d');
        const pixelBuffer = new Uint32Array(
            context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        );

        return !pixelBuffer.some(color => color !== 0);
    };

    const preprocessCanvasImage = (canvas) => {
        const resizedCanvas = document.createElement('canvas');
        const ctx = resizedCanvas.getContext('2d');

        resizedCanvas.width = 420;
        resizedCanvas.height = 252;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, resizedCanvas.width, resizedCanvas.height);

        ctx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);

        return resizedCanvas.toDataURL('image/png');
    };

    const handleNextClick = async () => {
        const currentQuestion = questions[currentQuestionIndex];
        const canvas = canvasRef.current;

        if (isCanvasBlank(canvas)) {
            alert('Please draw something before proceeding.');
            return;
        }

        const imageData = preprocessCanvasImage(canvas).split(',')[1];

        try {
            const response = await fetch(
                `https://api.clarifai.com/v2/models/${process.env.REACT_APP_CLARIFAI_MODEL_ID}/outputs`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Key ${process.env.REACT_APP_CLARIFAI_PAT}`,
                    },
                    body: JSON.stringify({
                        user_app_id: {
                            user_id: process.env.REACT_APP_CLARIFAI_USER_ID,
                            app_id: process.env.REACT_APP_CLARIFAI_APP_ID,
                        },
                        inputs: [{ data: { image: { base64: imageData } } }],
                    }),
                },
            );

            const result = await response.json();
            const concepts = (result && result.outputs && result.outputs[0] && result.outputs[0].data && result.outputs[0].data.concepts) || [];
            const topConcept = concepts.reduce((prev, current) => (
                prev.value > current.value ? prev : current
            ), { value: -Infinity });

            const isCorrect = topConcept.name === currentQuestion.expectedLabel;

            if (isCorrect) {
                setResult('Correct');
                if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                    setResult('');
                } else {
                    setCurrentQuestionIndex(0);
                }
            } else {
                setResult('Incorrect');
            }
        } catch (error) {
            console.error('Recognition request failed:', error);
            setResult('Incorrect');
        }
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
        <div className='drawing-question-container'>
            <div className="lesson-script-deco" aria-hidden="true">ᠪᠢᠴᠢ</div>
            <div className="question-badge">Бичгийн дасгал</div>
            <div className="prompt">{questions[currentQuestionIndex].prompt}</div>
            <div className="drawing-content">
                <div className="reference-card">
                    <div className="reference-label">Жишээ</div>
                    <img
                        src={questions[currentQuestionIndex].imageUrl}
                        alt="Reference"
                        className="reference-image"
                    />
                </div>
                <div className="canvas-side">
                    <div className="canvas-label">Энд зурна уу</div>
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={200}
                        onMouseDown={startDrawing}
                        onMouseUp={endDrawing}
                        onMouseOut={endDrawing}
                        onMouseMove={handleMouseMove}
                    />
                    <img
                        ref={drawingImageRef}
                        id="drawingImage"
                        alt="Your drawing"
                    />
                </div>
            </div>
            <div className={`result ${result ? result.toLowerCase() : ''}`}>{result}</div>
            <div className="actions">
                <button onClick={handleNextClick}>Дараагийн</button>
                <button onClick={handleClearCanvas}>Цэвэрлэх</button>
            </div>
        </div>
    </div>
    );
}

export default DrawingQuestion;

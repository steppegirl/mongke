import React, { useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import './ocr.css';
import { Link } from 'react-router-dom';
import eyeIcon from './eye.svg';
import socialIcon from './social.svg';
import storyIcon from './storybook.svg';
import ocrIcon from './ocr-icon.svg';
import 'react-calendar/dist/Calendar.css';
import Calendar from'react-calendar';

function OCR({userName}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [ocrResults, setOCRResults] = useState([]);
    const [uploadedImage, setUploadedImage] = useState(null);

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadedImage(URL.createObjectURL(event.target.files[0]));
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = async () => {
            try {
                const imageData = reader.result;
                const response = await axios.post('/api/upload-image-base64', { imageData }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                setOCRResults(response.data);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        };
    };

    return (
        <div>
            <div className="dashboard-title">
                <h1 className="dashboard-title-h1">OCR</h1>
            </div>
            <div className="navigation">
                <div className='storybook'>
                    <Link to='/storybook'>
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
            <div className="black_section">
                <h2 className="greeting">👋 Сайн уу, {userName || 'найз'}</h2>
                <div className="total_xp"></div>
                <div className="streak">
                    <Calendar
                        className="custom-calendar"
                    />
                </div>
                <h2 className="streak_text">Та 10 өдөр монгол бичиг ээ давтсан байна.</h2>
            </div>
            <div className="ocr-container">
                <label htmlFor="file-upload" className="ocr-file-label">
                    <img src={ocrIcon} />
                    Choose File
                    <input id="file-upload" type="file" className="ocr-file-input" onChange={handleFileSelect} />
                </label>
                <div className="ocr-upload-button-container">
                    <button className="ocr-button-upload" onClick={handleFileUpload}>Upload</button>
                </div>
                {uploadedImage && (
                    <div>
                        <h2>Uploaded Image</h2>
                        <img src={uploadedImage} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                    </div>
                )}

                {ocrResults.length > 0 && (
                    <div>
                        <h2>OCR Results</h2>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: '1' }}>
                                <ul>
                                    {ocrResults.map((result, index) => (
                                        <li key={index}>{result}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OCR;

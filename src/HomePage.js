import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const TYPED_LINES = [
    'Монгол бичгээ сурцгаая.',
    'Монгол хэл,',
    'Монгол бичиг,',
    'Монгол соёл,',
    'Монгол эх орондоо хайртай хэн бүхнийг урьж байна!',
];

const HomePage = () => {
    const navigate = useNavigate();
    const typewriterRef = useRef(null);
    const circleRef = useRef(null);
    const xrayRef = useRef(null);

    // Typewriter effect that cycles through TYPED_LINES.
    useEffect(() => {
        let lineIndex = 0;
        let charTimer;
        let lineTimer;

        const typeNextLine = () => {
            const target = typewriterRef.current;
            if (!target) return;

            const text = TYPED_LINES[lineIndex % TYPED_LINES.length];
            let i = 0;
            target.innerHTML = '';

            charTimer = setInterval(() => {
                target.innerHTML = text.slice(0, i + 1);
                i += 1;
                if (i >= text.length) {
                    clearInterval(charTimer);
                    lineTimer = setTimeout(() => {
                        if (target) target.innerHTML = '';
                        lineIndex += 1;
                        typeNextLine();
                    }, 1500);
                }
            }, 50);
        };

        typeNextLine();
        return () => {
            clearInterval(charTimer);
            clearTimeout(lineTimer);
        };
    }, []);

    // Cursor-following X-ray circle.
    useEffect(() => {
        const handleMove = (e) => {
            const circle = circleRef.current;
            if (!circle) return;
            const half = circle.offsetHeight / 2;
            circle.style.left = `${e.clientX - half}px`;
            circle.style.top = `${e.clientY - half}px`;
        };

        const showCircle = () => {
            if (circleRef.current) circleRef.current.classList.remove('hidden');
        };
        const hideCircle = () => {
            if (circleRef.current) circleRef.current.classList.add('hidden');
        };

        const xray = xrayRef.current;
        document.addEventListener('mousemove', handleMove);
        if (xray) {
            xray.addEventListener('mouseover', showCircle);
            xray.addEventListener('mouseout', hideCircle);
        }

        return () => {
            document.removeEventListener('mousemove', handleMove);
            if (xray) {
                xray.removeEventListener('mouseover', showCircle);
                xray.removeEventListener('mouseout', hideCircle);
            }
        };
    }, []);

    return (
        <div className="container-homepage">
            <div className="navbar">
                <div className="nav-buttons-left">
                    <button className="nav-button">Нүүр хуудас</button>
                    <button className="nav-button">Бидний тухай</button>
                </div>
                <div className="nav-buttons-right">
                    <button onClick={() => navigate('registration')} className="nav-button">Бүртгүүлэх</button>
                    <button onClick={() => navigate('Login')} className="nav-button-right">Нэвтрэх</button>
                </div>
            </div>

            <div className="background-image" />

            <div className="body-homepage">
                <div className="X-ray" ref={xrayRef}>
                    <span className="filled-text">ᠲᠠᠪᠠᠲᠠᠢ ᠮᠣᠷᠢᠯᠠᠨ᠎ᠠ ᠤᠤ</span>
                    <span className="outlined-text" aria-hidden="true">ᠲᠠᠪᠠᠲᠠᠢ ᠮᠣᠷᠢᠯᠠᠨ᠎ᠠ ᠤᠤ</span>
                </div>
                <div id="circle" ref={circleRef} />
            </div>

            <div className="bottom">
                <div>
                    <p className="typewriter" ref={typewriterRef} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;

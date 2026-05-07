import React from 'react';
import './Dashboard.css';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import eyeIcon from './eye.svg';
import socialIcon from './social.svg';
import storyIcon from './storybook.svg';
import 'react-calendar/dist/Calendar.css';

function Dashboard({userName}) {
    const lessons = [
        { color: 'purple', text: 'а, э, и', id: 1, type: 'lesson' },
        { color: 'yellow', text: 'н, б', id: 2, type: 'drawing' },
        { color: 'blue', text: 'н, б', id: 3, type: 'matching' },
        { color: 'green', text: 'н, б', id: 4, type: 'lesson' },
        { color: 'purple2', text: 'а, э, и', id: 5, type: 'lesson' },
        { color: 'yellow2', text: 'н, б', id: 6, type: 'drawing' },
        { color: 'blue2', text: 'н, б', id: 7, type: 'lesson' },
        { color: 'green2', text: 'н, б', id: 8, type: 'lesson' },
        { color: 'purple3', text: 'а, э, и', id: 9, type: 'lesson' }
    ];

    const getLessonLink = (lesson) => {
        switch(lesson.type) {
            case 'lesson': return `/lesson/${lesson.id}`;
            case 'drawing': return '/drawing-question';
            case 'matching': return '/matchingQuestion';
            default: return '#';
        }
    };

    return (
        <div className="dashboard-container">
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

                <div className="nav-divider"></div>

                <div className='nav-item' title="Achievements">
                    <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                        <path d="M4 22h16" />
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                </div>
                <div className='nav-item' title="Statistics">
                    <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18" />
                        <path d="M7 16l4-4 4 4 5-5" />
                    </svg>
                </div>
                <div className='nav-item' title="Profile">
                    <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
                <div className='nav-item' title="Settings">
                    <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </div>
            </div>

            <div className="dashboard-title">
                <h1 className="dashboard-title-h1">Хичээлүүд</h1>
            </div>

            <div className="black_section">
                <div className="greeting">
                    <div className="greeting-eyebrow">Сайн уу,</div>
                    <div className="greeting-name">{userName || 'найз'}</div>
                </div>

                <div className="word-of-day">
                    <div className="wod-header">
                        <span className="wod-dot"></span>
                        Өнөөдрийн үг
                    </div>
                    <div className="wod-body">
                        <div className="wod-script-col" aria-hidden="true">
                            <div className="wod-script">ᠮᠣᠷᠢ</div>
                        </div>
                        <div className="wod-text">
                            <div className="wod-cyrillic">морь</div>
                            <div className="wod-romanized">mori</div>
                        </div>
                    </div>
                    <div className="wod-quote">
                        <span className="wod-quote-mark">“</span>
                        Морьтой эр аз жаргалтай.
                    </div>
                </div>

                <div className="streak">
                    <Calendar
                        className="custom-calendar"
                    />
                </div>
                <h2 className="streak_text">Та 11 өдөр монгол бичиг ээ давтсан байна.</h2>
            </div>

            <div className="stats-strip">
                <div className="stat-card stat-streak">
                    <div className="stat-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                        </svg>
                    </div>
                    <div className="stat-text">
                        <div className="stat-value">11</div>
                        <div className="stat-label">хоног streak</div>
                    </div>
                </div>
                <div className="stat-card stat-xp">
                    <div className="stat-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2l2.39 7.36H22l-6.19 4.5 2.36 7.36L12 16.72l-6.18 4.5 2.37-7.36L2 9.36h7.61z" />
                        </svg>
                    </div>
                    <div className="stat-text">
                        <div className="stat-value">1,240</div>
                        <div className="stat-label">XP цуглуулсан</div>
                    </div>
                </div>
                <div className="stat-card stat-lessons">
                    <div className="stat-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                    </div>
                    <div className="stat-text">
                        <div className="stat-value">4</div>
                        <div className="stat-label">хичээл үзэж дуусгасан</div>
                    </div>
                </div>
            </div>

            <div className="lessons">
                {lessons.map((lesson) => {
                    const colorClass = lesson.color;
                    return (
                        <div key={lesson.id} className={colorClass}>
                            <div className={`${colorClass}_rectangle`}></div>
                            <Link to={getLessonLink(lesson)} className="lesson-link">
                                <div className={`${colorClass}_outer_circle`}></div>
                                <div className={`${colorClass}_inner_circle`}></div>
                                <div className="text">{lesson.text}</div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Dashboard;
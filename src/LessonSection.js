import React from 'react';
import { Link } from 'react-router-dom';

function LessonSection({ lessonId, text }) {
    const sectionColor = lessonId === 1 ? 'purple' : lessonId === 2 ? 'blue' : lessonId === 3 ? 'yellow' : lessonId === 4 ? "green" : "purple";

    return (
        <div className={sectionColor}>
            <div className={`${sectionColor}_rectangle`}></div>
            <Link to={`/lesson/${lessonId}`} className="lesson-link">
                <div className = {`${sectionColor}_outer_circle`}></div>
                <div className = {`${sectionColor}_inner_circle`}></div>
                <div className = "text text_1">{text}</div>
            </Link>
        </div>
    );
}

export default LessonSection;
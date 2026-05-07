import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import './social.css';
import { Link } from 'react-router-dom';
import eyeIcon from './eye.svg';
import socialIcon from './social.svg';
import storyIcon from './storybook.svg';
import 'react-calendar/dist/Calendar.css';
import Calendar from'react-calendar';
import ocrIcon from './ocr-icon.svg';

function Social (props) {
    const { userName, userId } = props;
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ description: '', image: null});

    useEffect(() => {
        axios.get('/posts')
            .then(response => setPosts(response.data))
            .catch(error => console.error('Error fetching posts: ', error));
    }, []);

    const handleImageChange = (event) => {
        setNewPost({ ...newPost, image: event.target.files[0]});
    };

    const handleDescriptionChange = (event) => {
        setNewPost({ ...newPost, description: event.target.value});
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!userId) return;

        const formData = new FormData();
        formData.append('image', newPost.image);
        formData.append('description', newPost.description);
        formData.append('user_id', String(userId));

        axios.post('/src/postUploads', formData)
            .then((response) => {
                setPosts([...posts, response.data]);
                setNewPost({ description: '', image: null });
            })
            .catch((error) => {
                console.error('Error uploading post:', error);
            });
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
            <div className="black_section">
                <h2 className="greeting">👋 Сайн уу, {userName || 'найз'}</h2>
                <div className="total_xp"></div>
                <div className="streak">
                    <Calendar
                        className="custom-calendar"
                    />
                </div>
                <h2 className="streak_text">Та 11 өдөр монгол бичиг ээ давтсан байна.</h2>
            </div>
            <div className="dashboard-title">
                <h1 className="dashboard-title-h1">Social Media</h1>
            </div>
            <div className="social-container">
                <div>
                    <form onSubmit={handleSubmit} className="post-form">
                        <label htmlFor="file-upload" className="post-label">
                        <img src={ocrIcon} />
                        Choose File
                        <input id="file-upload" type="file" className="ocr-file-input" onChange={handleImageChange} required/>
                        </label>
                        <textarea value={newPost.description} onChange={handleDescriptionChange} className="text-area"  required/>
                        <button type="submit" className="post-button-upload">Upload</button>
                    </form>
                </div>
                <div>
                    <h2>Posts</h2>
                    {posts.map(post => (
                        <Post key={post.post_id} post={post} userId={userId} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const Post = ({ post, userId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const fetchComments = async () => {
        try {
            const response = await fetch(`http://localhost:5001/comments/${post.post_id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [post.post_id]);


    const handleCommentChange = (event) => {
        setNewComment(event.target.value);
    };

    const submitComment = async () => {
        try {
            const response = await fetch('http://localhost:5001/comment', { // Use the correct server URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: post.post_id,
                    content: newComment,
                    user_id: userId, // Include userId if needed
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const addedComment = await response.json();
            setComments([addedComment, ...comments]); // Prepend the new comment
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error('Failed to submit comment:', error);
        }
    };

    return (
        <div className="post">
            <img src={`http://localhost:5001/postUploads/${post.image_path}`} alt="Post" />
            <p>{post.description}</p>
            <p className="post-meta">Posted by {post.username} on {post.formatted_created_at}</p>
            <div className="comment-form">
                <input type="text" value={newComment} onChange={handleCommentChange} placeholder="Add a comment..." />
                <button onClick={submitComment}>Submit</button>
            </div>
            <div>
                {comments.map(comment => (
                    <React.Fragment key={comment.comment_id}>
                        <p className="comment">{comment.content}</p>
                        <p className="comment-meta">Commented by {comment.username} on {comment.formatted_created_at}</p>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Social;
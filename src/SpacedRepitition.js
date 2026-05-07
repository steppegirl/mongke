import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SpacedRepetition({ userId }) {
    const [itemsForReview, setItemsForReview] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);

    useEffect(() => {
        // Fetch items for review when the component mounts
        axios.get(`/getItemsForReview?userId=${userId}`)
            .then(response => {
                setItemsForReview(response.data);
                if (response.data.length > 0) {
                    setCurrentItem(response.data[0]);
                }
            })
            .catch(error => {
                console.error('Error fetching items for review:', error);
            });
    }, [userId]);

    const handleReview = (itemId, wasCorrect) => {
        axios.post('/updateReviewSchedule', { userId, itemId, wasCorrect })
            .then(() => {
                // Fetch updated items for review
                axios.get(`/getItemsForReview?userId=${userId}`)
                    .then(response => {
                        setItemsForReview(response.data);
                        if (response.data.length > 0) {
                            setCurrentItem(response.data[0]);
                        } else {
                            setCurrentItem(null);
                        }
                    });
            })
            .catch(error => {
                console.error('Error updating review schedule:', error);
            });
    };

    return (
        <div>
            <h2>Spaced Repetition</h2>
            {currentItem ? (
                <div>
                    <p>Review this item: {currentItem}</p>
                    <button onClick={() => handleReview(currentItem, true)}>Correct</button>
                    <button onClick={() => handleReview(currentItem, false)}>Incorrect</button>
                </div>
            ) : (
                <p>No items for review</p>
            )}
        </div>
    );
}

export default SpacedRepetition;

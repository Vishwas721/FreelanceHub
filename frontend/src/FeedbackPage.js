// src/pages/FeedbackPage.js
import React, { useState } from 'react';
import Header from './components/Header'; // Adjust path if necessary
import Footer from './components/Footer'; // Adjust path if necessary
import styles from './FeedbackPage.module.css'; // Import CSS Module

const StarRating = ({ rating, onRatingChange }) => {
    return (
        <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
                    onClick={() => onRatingChange(star)}
                >
                    &#9733; {/* Unicode star character */}
                </span>
            ))}
        </div>
    );
};

const FeedbackPage = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0); // 0 for no rating
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        // Simulate API call
        try {
            console.log('Submitting Feedback:', { subject, message, rating });
            // Replace with your actual API call, e.g.:
            // const response = await axios.post('/api/feedback', { subject, message, rating, userId: user?.userId });
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

            setSubmitStatus('success');
            setSubject('');
            setMessage('');
            setRating(0); // Reset rating
        } catch (error) {
            console.error('Feedback submission error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <Header />
            <main className={styles.mainContent}>
                <div className={styles.feedbackCard}>
                    <h1 className={styles.title}>Send Us Your Feedback</h1>
                    <p className={styles.subtitle}>
                        We'd love to hear your thoughts, suggestions, or any issues you've encountered.
                    </p>

                    <form onSubmit={handleSubmit} className={styles.feedbackForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="subject" className={styles.formLabel}>Subject</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className={styles.formInput}
                                placeholder="e.g., Website improvement, Bug report"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="message" className={styles.formLabel}>Your Message</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className={`${styles.formInput} ${styles.textarea}`}
                                placeholder="Tell us what you think..."
                                rows="6"
                                required
                            ></textarea>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Overall Rating</label>
                            <StarRating rating={rating} onRatingChange={setRating} />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                        </button>

                        {submitStatus === 'success' && (
                            <p className={styles.successMessage}>Thank you for your feedback!</p>
                        )}
                        {submitStatus === 'error' && (
                            <p className={styles.errorMessage}>Failed to send feedback. Please try again.</p>
                        )}
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FeedbackPage;
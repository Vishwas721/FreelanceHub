// src/pages/ContactPage.js
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './ContactPage.module.css';

const ContactPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        // Simulate API call
        try {
            console.log('Submitting Contact Form:', { name, email, subject, message });
            // Replace with your actual API call, e.g.:
            // const response = await axios.post('/api/contact', { name, email, subject, message });
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

            setSubmitStatus('success');
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
        } catch (error) {
            console.error('Contact form submission error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <Header />
            <main className={styles.mainContent}>
                <div className={styles.contactCard}>
                    <h1 className={styles.title}>Get in Touch</h1>
                    <p className={styles.subtitle}>
                        Have a question, suggestion, or just want to say hello?
                        Fill out the form below or reach us directly.
                    </p>

                    <div className={styles.contactDetails}>
                        <div className={styles.detailItem}>
                            <h3>Email Us</h3>
                            <p><a href="mailto:support@[yourdomain.com]" className={styles.detailLink}>support@[freelanceHub.com]</a></p>
                        </div>
                        <div className={styles.detailItem}>
                            <h3>Call Us</h3>
                            <p>+91 72595 09765</p>
                        </div>
                        <div className={styles.detailItem}>
                            <h3>Our Location</h3>
                            <p>123 Salt lake Street, Tech City, India</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.contactForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.formLabel}>Your Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={styles.formInput}
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>Your Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.formInput}
                                placeholder="john.doe@example.com"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="subject" className={styles.formLabel}>Subject</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className={styles.formInput}
                                placeholder="Inquiry about services"
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
                                placeholder="Type your message here..."
                                rows="7"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending Message...' : 'Send Message'}
                        </button>

                        {submitStatus === 'success' && (
                            <p className={styles.successMessage}>Your message has been sent successfully!</p>
                        )}
                        {submitStatus === 'error' && (
                            <p className={styles.errorMessage}>Failed to send message. Please try again.</p>
                        )}
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContactPage;
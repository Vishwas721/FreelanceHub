// src/pages/EditProfilePage.js
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import styles from './EditProfilePage.module.css';

const EditProfilePage = () => {
    const { userId } = useParams(); // Get userId from URL param
    const { user, isLoading: authLoading, logout } = useContext(AuthContext); // Get user from context
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        location: '',
        bio: '',
        // Client specific
        company_name: '',
        industry: '',
        contact_person: '',
        // Freelancer specific
        skills: [],
        portfolio_link: '',
        hourly_rate: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        if (!authLoading && (!user || user.userId !== parseInt(userId, 10))) {
            // Redirect if not authenticated or trying to edit someone else's profile
            navigate('/login'); // Or unauthorized page
            return;
        }

        const fetchProfileData = async () => {
            if (!user || !user.token) {
                setLoading(false);
                return;
            }

            try {
                // Fetch profile data for the logged-in user
                const response = await axios.get(`http://localhost:5000/api/users/${user.userId}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const fetchedData = response.data;

                // Initialize form data with fetched values, handling potential nulls/undefineds
                setFormData({
                    username: fetchedData.username || '',
                    email: fetchedData.email || '',
                    location: fetchedData.location || '',
                    bio: fetchedData.bio || '',
                    company_name: fetchedData.company_name || '',
                    industry: fetchedData.industry || '',
                    contact_person: fetchedData.contact_person || '',
                    // Ensure skills is an array, parsing if it's a JSON string
                    skills: fetchedData.skills ? (Array.isArray(fetchedData.skills) ? fetchedData.skills : JSON.parse(fetchedData.skills)) : [],
                    portfolio_link: fetchedData.portfolio_link || '',
                    hourly_rate: fetchedData.hourly_rate ? parseFloat(fetchedData.hourly_rate).toFixed(2) : ''
                });
            } catch (err) {
                console.error("Error fetching profile data for edit:", err.response?.data?.error || err.message);
                setFetchError("Failed to load profile for editing. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfileData();
        }
    }, [user, userId, authLoading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSkillsChange = (e) => {
        // Convert comma-separated string to array, trimming whitespace
        const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
        setFormData(prevData => ({
            ...prevData,
            skills: skillsArray
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        if (!user || !user.token) {
            setSubmitStatus('error');
            console.error('User not authenticated for submission.');
            setIsSubmitting(false);
            return;
        }

        try {
            // Prepare data for submission:
            // 1. Filter out fields not present in the current user's role if necessary (though backend should handle it)
            // 2. Stringify skills array
            const dataToSubmit = { ...formData };
            dataToSubmit.skills = JSON.stringify(formData.skills); // Convert skills array to JSON string

            const response = await axios.put(`http://localhost:5000/api/users/${user.userId}`, dataToSubmit, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            setSubmitStatus('success');
            console.log('Profile updated successfully:', response.data);
            // Optionally, update the user context if username/email changed
            // Then navigate back to profile page or dashboard
            setTimeout(() => {
                navigate('/profile');
            }, 1500); // Give user time to see success message
        } catch (err) {
            console.error("Error updating profile:", err.response?.data?.error || err.message);
            setSubmitStatus('error');
            setFetchError(err.response?.data?.error || "Failed to update profile. Please check your input.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className={styles.loadingContainer}>
                <p>Loading profile for editing...</p>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className={styles.errorContainer}>
                <p>Error: {fetchError}</p>
                <button onClick={() => navigate('/profile')} className={styles.backButton}>Go to Profile</button>
            </div>
        );
    }

    if (!user) { // Should be caught by the initial useEffect but good fallback
        return null;
    }

    return (
        <div className={styles.pageContainer}>
            <Header />
            <main className={styles.mainContent}>
                <div className={styles.editProfileCard}>
                    <h1 className={styles.title}>Edit Your Profile</h1>
                    <p className={styles.subtitle}>Update your personal and role-specific information.</p>

                    <form onSubmit={handleSubmit} className={styles.profileForm}>
                        {/* Common Fields */}
                        <div className={styles.formSection}>
                            <h2 className={styles.sectionHeading}>General Information</h2>
                            <div className={styles.formGroup}>
                                <label htmlFor="username" className={styles.formLabel}>Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.formLabel}>Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="location" className={styles.formLabel}>Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className={styles.formInput}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="bio" className={styles.formLabel}>Bio</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className={`${styles.formInput} ${styles.textarea}`}
                                    rows="5"
                                />
                            </div>
                        </div>

                        {/* Role-Specific Fields */}
                        {user.role === 'client' && (
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionHeading}>Client Details</h2>
                                <div className={styles.formGroup}>
                                    <label htmlFor="company_name" className={styles.formLabel}>Company Name</label>
                                    <input
                                        type="text"
                                        id="company_name"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        className={styles.formInput}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="industry" className={styles.formLabel}>Industry</label>
                                    <input
                                        type="text"
                                        id="industry"
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        className={styles.formInput}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="contact_person" className={styles.formLabel}>Contact Person</label>
                                    <input
                                        type="text"
                                        id="contact_person"
                                        name="contact_person"
                                        value={formData.contact_person}
                                        onChange={handleChange}
                                        className={styles.formInput}
                                    />
                                </div>
                            </div>
                        )}

                        {user.role === 'freelancer' && (
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionHeading}>Freelancer Details</h2>
                                <div className={styles.formGroup}>
                                    <label htmlFor="skills" className={styles.formLabel}>Skills (comma-separated)</label>
                                    <input
                                        type="text"
                                        id="skills"
                                        name="skills"
                                        value={formData.skills.join(', ')} // Display as comma-separated string
                                        onChange={handleSkillsChange}
                                        className={styles.formInput}
                                        placeholder="e.g., React, Node.js, UI/UX Design"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="portfolio_link" className={styles.formLabel}>Portfolio Link</label>
                                    <input
                                        type="url"
                                        id="portfolio_link"
                                        name="portfolio_link"
                                        value={formData.portfolio_link}
                                        onChange={handleChange}
                                        className={styles.formInput}
                                        placeholder="https://yourportfolio.com"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="hourly_rate" className={styles.formLabel}>Hourly Rate ($)</label>
                                    <input
                                        type="number"
                                        id="hourly_rate"
                                        name="hourly_rate"
                                        value={formData.hourly_rate}
                                        onChange={handleChange}
                                        className={styles.formInput}
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Profile'}
                        </button>

                        {submitStatus === 'success' && (
                            <p className={styles.successMessage}>Profile updated successfully!</p>
                        )}
                        {submitStatus === 'error' && (
                            <p className={styles.errorMessage}>{fetchError || "Failed to update profile. Please try again."}</p>
                        )}
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EditProfilePage;
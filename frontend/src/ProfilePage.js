// src/pages/ProfilePage.js
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthContext } from './AuthContext'; // Assuming AuthContext provides user info
import axios from 'axios';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
    const { user, isLoading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authLoading && !user) {
            // If authentication is loaded and no user is found, redirect to login
            navigate('/login');
            return;
        }

        const fetchProfileData = async () => {
            if (!user || !user.token) {
                setLoadingProfile(false);
                return;
            }

            try {
                // Adjust this API endpoint to fetch detailed user profile data
                // This might be a /api/users/:id or /api/profile endpoint on your backend
                const response = await axios.get(`http://localhost:5000/api/users/${user.userId}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setProfileData(response.data);
            } catch (err) {
                console.error("Error fetching profile data:", err.response?.data?.error || err.message);
                setError("Failed to load profile data.");
            } finally {
                setLoadingProfile(false);
            }
        };

        if (user) { // Only fetch if user object is available
            fetchProfileData();
        }
    }, [user, authLoading, navigate]);

    if (authLoading || loadingProfile) {
        return (
            <div className={styles.loadingContainer}>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>Error: {error}</p>
                <button onClick={() => navigate('/dashboard')} className={styles.backButton}>Go to Dashboard</button>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className={styles.noProfileContainer}>
                <p>No profile data available. Please log in.</p>
                <button onClick={() => navigate('/login')} className={styles.loginButton}>Login</button>
            </div>
        );
    }

    // Render different content based on user role (client/freelancer)
    const renderRoleSpecificContent = () => {
        if (profileData.role === 'client') {
            return (
                <div className={styles.roleSpecificSection}>
                    <h2 className={styles.sectionHeading}>Client Details</h2>
                    <p><strong>Company:</strong> {profileData.company_name || 'N/A'}</p>
                    <p><strong>Industry:</strong> {profileData.industry || 'N/A'}</p>
                    <p><strong>Contact Person:</strong> {profileData.contact_person || 'N/A'}</p>
                    {/* Add more client-specific fields */}
                    <button className={styles.buttonSecondary} onClick={() => navigate('/my-projects')}>View My Projects</button>
                </div>
            );
        } else if (profileData.role === 'freelancer') {
            const skills = profileData.skills ? (Array.isArray(profileData.skills) ? profileData.skills : JSON.parse(profileData.skills)).join(', ') : 'N/A';
            return (
                <div className={styles.roleSpecificSection}>
                    <h2 className={styles.sectionHeading}>Freelancer Details</h2>
                    <p><strong>Skills:</strong> {skills}</p>
                    <p><strong>Portfolio Link:</strong> <a href={profileData.portfolio_link} target="_blank" rel="noopener noreferrer" className={styles.profileLink}>{profileData.portfolio_link || 'N/A'}</a></p>
                    <p><strong>Rate (per hour):</strong> ${profileData.hourly_rate ? parseFloat(profileData.hourly_rate).toFixed(2) : 'N/A'}</p>
                    {/* Add more freelancer-specific fields */}
                    <button className={styles.buttonSecondary} onClick={() => navigate('/my-bids')}>View My Bids</button>
                </div>
            );
        }
        return null;
    };


    return (
        <div className={styles.pageContainer}>
            <Header />
            <main className={styles.mainContent}>
                <div className={styles.profileCard}>
                    <h1 className={styles.profileTitle}>Welcome, {profileData.username}!</h1>
                    <p className={styles.profileSubtitle}>Your Profile</p>

                    <div className={styles.profileInfo}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Username:</span>
                            <span className={styles.infoValue}>{profileData.username}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Email:</span>
                            <span className={styles.infoValue}>{profileData.email}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Role:</span>
                            <span className={styles.infoValue}>
                                <span className={`${styles.roleBadge} ${styles[profileData.role]}`}>
                                    {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                                </span>
                            </span>
                        </div>
                        {profileData.location && (
                             <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Location:</span>
                                <span className={styles.infoValue}>{profileData.location}</span>
                            </div>
                        )}
                        {profileData.bio && (
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Bio:</span>
                                <span className={styles.infoValue}>{profileData.bio}</span>
                            </div>
                        )}
                    </div>

                    {renderRoleSpecificContent()}

                    <div className={styles.profileActions}>
                        <button className={styles.buttonPrimary} onClick={() => navigate(`/edit-profile/${user.userId}`)}>
                            Edit Profile
                        </button>
                        <button className={styles.buttonDanger} onClick={() => { /* Implement delete account logic */ alert('Delete account functionality would go here.'); }}>
                            Delete Account
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProfilePage;
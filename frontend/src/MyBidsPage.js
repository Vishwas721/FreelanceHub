// src/pages/MyBidsPage.js
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import styles from './MyBidsPage.module.css';

const MyBidsPage = () => {
    const { user, isLoading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bids, setBids] = useState([]);
    const [loadingBids, setLoadingBids] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'freelancer')) {
            // If not authenticated or not a freelancer, redirect
            navigate('/login'); // Or to a forbidden page
            return;
        }

        const fetchMyBids = async () => {
            if (!user || !user.token) {
                setLoadingBids(false);
                return;
            }

            try {
                // Backend endpoint to fetch bids by the logged-in freelancer
                const response = await axios.get(`http://localhost:5000/api/bids/my-bids`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setBids(response.data);
            } catch (err) {
                console.error("Error fetching bids:", err.response?.data?.error || err.message);
                setError("Failed to load your bids. Please try again later.");
            } finally {
                setLoadingBids(false);
            }
        };

        if (user && user.role === 'freelancer') {
            fetchMyBids();
        }
    }, [user, authLoading, navigate]);

    if (authLoading || loadingBids) {
        return (
            <div className={styles.loadingContainer}>
                <p>Loading your bids...</p>
                <div className={styles.spinner}></div>
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

    return (
        <div className={styles.pageContainer}>
            <Header />
            <main className={styles.mainContent}>
                <div className={styles.bidsCard}>
                    <h1 className={styles.title}>My Bids</h1>
                    <p className={styles.subtitle}>A list of all projects you've placed a bid on.</p>

                    {bids.length === 0 ? (
                        <div className={styles.noBidsMessage}>
                            <p>You haven't placed any bids yet. Explore projects to find opportunities!</p>
                            <button onClick={() => navigate('/projects/list')} className={styles.exploreButton}>
                                Browse Open Projects
                            </button>
                        </div>
                    ) : (
                        <div className={styles.bidsList}>
                            {bids.map(bid => (
                                <div key={bid.id} className={styles.bidItem}>
                                    <div className={styles.bidHeader}>
                                        <h2 className={styles.projectTitle} onClick={() => navigate(`/projects/${bid.project_id}`)}>
                                            {bid.project_title}
                                        </h2>
                                        <span className={`${styles.bidStatusBadge} ${styles[bid.bid_status.replace(/\s+/g, '_')]}`}>
                                            {bid.bid_status.charAt(0).toUpperCase() + bid.bid_status.slice(1)}
                                        </span>
                                    </div>
                                    <p className={styles.bidAmount}>
                                        Your Bid: <span className={styles.amountValue}>${parseFloat(bid.bid_amount).toFixed(2)}</span>
                                    </p>
                                    <p className={styles.bidDetails}>{bid.cover_letter}</p>
                                    <div className={styles.bidFooter}>
                                        <span>Bidded On: {new Date(bid.bid_date).toLocaleDateString()}</span>
                                        <button
                                            className={styles.viewProjectButton}
                                            onClick={() => navigate(`/projects/${bid.project_id}`)}
                                        >
                                            View Project
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MyBidsPage;
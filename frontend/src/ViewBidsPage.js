// src/pages/ViewBidsPage.js
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import "./ViewBidsPage.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const ViewBidsPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useContext(AuthContext);

    const [project, setProject] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const fetchBids = useCallback(async () => {
        if (authLoading) return;

        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'client') {
            setError("Access Denied: Only clients can view project bids.");
            setLoading(false);
            return;
        }
        if (!user.token) {
            setError("Authentication token missing.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:5000/api/bids/project/${projectId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setProject(response.data.project);
            setBids(response.data.bids);
        } catch (err) {
            console.error("Error fetching bids:", err.response?.data?.error || err.message);
            setError(err.response?.data?.message || err.response?.data?.error || "Failed to load bids. Please try again.");
            if (err.response?.status === 403 || err.response?.status === 404) {
                navigate('/my-projects', { replace: true, state: { message: "Project or bids not accessible or found." } });
            }
        } finally {
            setLoading(false);
        }
    }, [projectId, user, navigate, authLoading]);

    useEffect(() => {
        fetchBids();
    }, [fetchBids]);

    const handleAcceptBid = async (bidId) => {
        if (!user?.token) return;
        setMessage(null);
        try {
            await axios.post(
                `http://localhost:5000/api/bids/${bidId}/accept`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setMessage("Bid accepted successfully!");
            fetchBids();
        } catch (err) {
            console.error("Error accepting bid:", err.response?.data?.error || err.message);
            setMessage(`Failed to accept bid: ${err.response?.data?.error || "An unexpected error occurred."}`);
        }
    };

    const handleRejectBid = async (bidId) => {
        if (!user?.token) return;
        setMessage(null);
        try {
            await axios.post(
                `http://localhost:5000/api/bids/${bidId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setMessage("Bid rejected successfully!");
            fetchBids();
        } catch (err) {
            console.error("Error rejecting bid:", err.response?.data?.error || err.message);
            setMessage(`Failed to reject bid: ${err.response?.data?.error || "An unexpected error occurred."}`);
        }
    };

    const handleBackToProjects = () => {
        navigate('/my-projects');
    };

    if (loading || authLoading) {
        return (
            <div className="view-bids-container loading-state">
                <p>Loading bids...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="view-bids-container error-state">
                <p>{error}</p>
                <button onClick={handleBackToProjects} className="back-button">Back to My Projects</button>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="view-bids-container no-project-state">
                <p>No project found for these bids or access denied.</p>
                <button onClick={handleBackToProjects} className="back-button">Back to My Projects</button>
            </div>
        );
    }

    // CHANGE: Use project.project_status here
    const isProjectAssigned = project.project_status === 'assigned' || project.project_status === 'in progress' || project.project_status === 'completed';

    return (
        <div className="view-bids-container">
            <Header />
            <header className="bids-header">
                <h1 className="bids-page-title">Bids for "{project.title}"</h1>
                <p className="project-description">{project.description}</p>
                <p className="project-details">
                    Budget: <span className="detail-value">${parseFloat(project.budget).toFixed(2)}</span> |
                    Project Status: <span className={`project-status status-${project.project_status.replace(/\s/g, '-')}`}>{project.project_status.toUpperCase()}</span>
                </p>
                <button onClick={handleBackToProjects} className="back-button">← Back to My Projects</button>
            </header>

            {message && (
                <div className={`alert-message ${message.includes('successfully') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            {bids.length === 0 ? (
                <div className="no-bids-message">
                    <p>No bids have been placed on this project yet.</p>
                </div>
            ) : (
                <div className="bids-list">
                    {bids.map((bid) => (
                        <div key={bid.id} className={`bid-card status-${bid.status}`}>
                            <div className="bid-header">
                                <h3 className="freelancer-name">{bid.freelancer_username}</h3>
                                <div className="bid-amount-section">
                                    <span className="bid-amount">${parseFloat(bid.bid_amount).toFixed(2)}</span>
                                    {bid.delivery_days && <span className="delivery-days">in {bid.delivery_days} days</span>}
                                </div>
                            </div>
                            <p className="bid-proposal">{bid.proposal || 'No proposal provided.'}</p>
                            <div className="bid-info">
                                <span className={`bid-status-badge status-${bid.status}`}>Status: {bid.status.toUpperCase()}</span>
                                <span className="bid-date">
                                    Bid Placed: {
                                        // CHANGED TO bid.created_at
                                        bid.created_at
                                            ? new Date(bid.created_at).toLocaleDateString()
                                            : 'N/A'
                                    }
                                </span>
                                {bid.freelancer_rating !== null && bid.freelancer_rating !== undefined && (
                                    <span className="freelancer-rating">Rating: {parseFloat(bid.freelancer_rating).toFixed(2)} ★</span>
                                )}
                            </div>
                            <div className="bid-actions">
                                {!isProjectAssigned && bid.status === 'pending' && (
                                    <>
                                        <button
                                            className="action-button accept-button"
                                            onClick={() => handleAcceptBid(bid.id)}
                                        >
                                            Accept Bid
                                        </button>
                                        <button
                                            className="action-button reject-button"
                                            onClick={() => handleRejectBid(bid.id)}
                                        >
                                            Reject Bid
                                        </button>
                                    </>
                                )}
                                {bid.status === 'accepted' && (
                                    <span className="accepted-label">Accepted</span>
                                )}
                                {bid.status === 'rejected' && (
                                    <span className="rejected-label">Rejected</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Footer />
        </div>
    );
};

export default ViewBidsPage;
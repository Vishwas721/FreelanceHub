import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './ProjectDetails.css'; // Ensure this path is correct
import Header from './Header'; // Assuming you have a Header component
import Footer from './Footer'; // Assuming you have a Footer component

const ProjectDetails = () => {
    const { projectId } = useParams();
    const { user, isLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [bids, setBids] = useState([]);
    const [hasBid, setHasBid] = useState(false);
    const [isBidding, setIsBidding] = useState(false);
    const [bidAmount, setBidAmount] = useState('');
    const [deliveryDays, setDeliveryDays] = useState('');
    const [proposal, setProposal] = useState('');
    const [bidSuccessMessage, setBidSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [deliverables, setDeliverables] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [uploadError, setUploadError] = useState('');

    const [activeTab, setActiveTab] = useState('overview'); // State for active tab

    // --- Data Fetching Functions ---

    const fetchProjectDetails = useCallback(async () => {
        if (!user || !user.token) {
            console.log("Auth token not available. Redirecting to login.");
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setProject(response.data);

            if (user.role === 'freelancer' && response.data) {
                const bidsResponse = await axios.get(`http://localhost:5000/api/bids/freelancer/${projectId}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setHasBid(!!bidsResponse.data);
            }
        } catch (error) {
            console.error("Error fetching project details:", error);
            setErrorMessage(error.response?.data?.error || "Failed to load project details.");
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                if (!user || !user.token) {
                    navigate('/login');
                }
            }
        }
    }, [projectId, user, navigate]);

    const fetchBids = useCallback(async () => {
        if (!user?.token || !project) return;

        if (user.role === 'client' && project.client_id === user.userId) {
            try {
                const response = await axios.get(`http://localhost:5000/api/bids/project/${projectId}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setBids(response.data.bids || []);
            } catch (error) {
                console.error("Error fetching bids:", error);
                setErrorMessage(error.response?.data?.error || "Failed to load bids.");
            }
        }
    }, [projectId, user, project]);

    const fetchDeliverables = useCallback(async () => {
        if (!user?.token || !project) return;

        try {
            const response = await axios.get(`http://localhost:5000/api/deliverables/${projectId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setDeliverables(response.data);
        } catch (error) {
            console.error("Error fetching deliverables:", error);
            if (error.response?.status !== 403) {
                setErrorMessage(error.response?.data?.error || "Failed to load deliverables.");
            } else {
                setDeliverables([]);
            }
        }
    }, [projectId, user, project]);

    // --- Effects ---

    useEffect(() => {
        if (!isLoading) {
            if (user?.token) {
                fetchProjectDetails();
            } else {
                console.log("User not logged in or token missing after AuthContext loaded. Redirecting to login.");
                navigate('/login');
            }
        }
    }, [user, isLoading, fetchProjectDetails, navigate]);

    useEffect(() => {
        if (project && user?.token) {
            const isClientForProject = user.role === 'client' && project.client_id === user.userId;
            const isAssignedFreelancer = user.role === 'freelancer' && project.assigned_freelancer_id === user.userId;

            if (isClientForProject) {
                fetchBids();
                fetchDeliverables();
            } else if (isAssignedFreelancer) {
                fetchDeliverables();
            }
        }
    }, [project, user, fetchBids, fetchDeliverables]);

    // --- Event Handlers ---

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        setBidSuccessMessage('');
        setErrorMessage('');

        if (!user?.token || user.role !== 'freelancer') {
            setErrorMessage("You must be logged in as a freelancer to place a bid.");
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/api/bids/',
                {
                    project_id: projectId,
                    amount: parseFloat(bidAmount),
                    proposal: proposal,
                    delivery_days: parseInt(deliveryDays)
                },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setBidSuccessMessage(response.data.message);
            setIsBidding(false);
            setHasBid(true);
            fetchProjectDetails();
            navigate(`/projects`); // Redirect to projects list, or just stay here and update status
        } catch (error) {
            console.error("Error submitting bid:", error);
            if (error.response?.status === 400 && error.response?.data?.error === "You have already placed a bid on this project.") {
                setErrorMessage(error.response.data.error);
                setHasBid(true);
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                setErrorMessage(error.response?.data?.error || "Authentication error. Please log in again.");
                navigate('/login');
            } else {
                setErrorMessage(error.response?.data?.error || "Failed to submit bid.");
            }
        }
    };

    const handleAwardBid = async (bidId) => {
        setErrorMessage('');
        try {
            const response = await axios.post(
                `http://localhost:5000/api/bids/${bidId}/accept`,
                {},
                { headers: { Authorization: `Bearer ${user?.token}` } }
            );
            console.log(response.data.message);
            fetchBids();
            fetchProjectDetails();
        } catch (error) {
            console.error("Error accepting bid:", error);
            setErrorMessage(error.response?.data?.error || "Failed to award bid.");
        }
    };

    const handleRejectBid = async (bidId) => {
        setErrorMessage('');
        try {
            const response = await axios.post(
                `http://localhost:5000/api/bids/${bidId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${user?.token}` } }
            );
            console.log(response.data.message);
            fetchBids();
        } catch (error) {
            console.error("Error rejecting bid:", error);
            setErrorMessage(error.response?.data?.error || "Failed to reject bid.");
        }
    };

    const handleDeliverableUpload = async (e) => {
        e.preventDefault();
        setUploadError('');
        setUploadSuccess('');

        if (!uploadFile) {
            setUploadError("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('deliverableFile', uploadFile);
        formData.append('description', uploadDescription);

        try {
            const response = await axios.post(
                `http://localhost:5000/api/deliverables/upload/${projectId}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${user?.token}` },
                    withCredentials: true,
                }
            );

            setUploadSuccess(response.data.message);
            setUploadFile(null);
            setUploadDescription('');
            fetchDeliverables();
        } catch (error) {
            console.error("Error uploading deliverable:", error);
            if (error.response) {
                setUploadError(error.response.data.error || "Failed to upload deliverable.");
            } else if (error.request) {
                setUploadError("No response from server.");
            } else {
                setUploadError("Error setting up the request.");
            }
        }
    };

    // --- Loading and Error States ---

    if (isLoading) {
        return (
            <div className="project-details-page-container">
                <Header />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Authenticating and loading project details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="project-details-page-container">
                <Header />
                <div className="error-state">
                    <h2>Authentication Required</h2>
                    <p>Please log in to view project details.</p>
                    <button onClick={() => navigate('/login')} className="retry-button">
                        Go to Login
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="project-details-page-container">
                <Header />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading project details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (errorMessage && errorMessage !== "You have already placed a bid on this project.") {
        return (
            <div className="project-details-page-container">
                <Header />
                <div className="error-state">
                    <h2>Error</h2>
                    <p>{errorMessage}</p>
                    <button onClick={() => window.location.reload()} className="retry-button">
                        Reload Page
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    // --- Pre-render data processing ---
    let parsedSkills = [];
    if (typeof project.skills_required === 'string') {
        try {
            parsedSkills = JSON.parse(project.skills_required);
            if (!Array.isArray(parsedSkills)) {
                parsedSkills = [];
            }
        } catch (e) {
            console.error("Error parsing skills_required:", e);
            parsedSkills = [];
        }
    } else if (Array.isArray(project.skills_required)) {
        parsedSkills = project.skills_required;
    }

    const isClientForProject = user?.role === 'client' && project.client_id === user?.userId;
    const isAssignedFreelancer = user?.role === 'freelancer' && project.assigned_freelancer_id === user?.userId;

    return (
        <div className="project-details-page-container">
            <Header />
            <div className="project-details-hero">
                <div className="hero-background-overlay"></div>
                <div className="hero-content">
                    <h1 className="project-main-title">{project.title}</h1>
                    <span className={`project-status-badge ${project.project_status.toLowerCase()}`}>
                        {project.project_status}
                    </span>
                    <p className="hero-description">{project.description}</p>
                </div>
            </div>

            <div className="project-details-content-wrapper">
                <div className="project-details-tabs">
                    <button
                        className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    {(isClientForProject || isAssignedFreelancer) && (
                        <button
                            className={`tab-button ${activeTab === 'deliverables' ? 'active' : ''}`}
                            onClick={() => setActiveTab('deliverables')}
                        >
                            Deliverables ({deliverables.length})
                        </button>
                    )}
                    {isClientForProject && (
                        <button
                            className={`tab-button ${activeTab === 'bids' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bids')}
                        >
                            Bids ({bids.length})
                        </button>
                    )}
                </div>

                <div className="tab-content-container">
                    {activeTab === 'overview' && (
                        <section className="project-overview-section tab-panel active">
                            <div className="overview-card">
                                <h3>Project Snapshot</h3>
                                <div className="detail-row">
                                    <span className="detail-label">Budget:</span>
                                    <span className="detail-value budget-value">${project.budget}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Client:</span>
                                    <span className="detail-value">{project.client_username || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Deadline:</span>
                                    <span className="detail-value">{new Date(project.deadline).toLocaleDateString()}</span>
                                </div>
                                {project.assigned_freelancer_username && (
                                    <div className="detail-row">
                                        <span className="detail-label">Assigned to:</span>
                                        <span className="detail-value">{project.assigned_freelancer_username}</span>
                                    </div>
                                )}
                            </div>

                            {parsedSkills.length > 0 && (
                                <div className="skills-card">
                                    <h3>Skills Required</h3>
                                    <div className="skills-tags-container">
                                        {parsedSkills.map((skill, index) => (
                                            <span key={index} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Freelancer Bidding Section - within Overview for open projects */}
                            {user?.role === 'freelancer' && project.project_status === 'open' && (
                                <div className="bid-action-card">
                                    {hasBid ? (
                                        <p className="info-message">You have already placed a bid on this project.</p>
                                    ) : (
                                        <>
                                            {!isBidding && (
                                                <button onClick={() => setIsBidding(true)} className="call-to-action-button">
                                                    Place Your Bid Now!
                                                </button>
                                            )}

                                            {isBidding && (
                                                <div className="place-bid-form">
                                                    <h4>Submit Your Proposal</h4>
                                                    <form onSubmit={handleBidSubmit}>
                                                        <div className="form-group">
                                                            <label htmlFor="bidAmount">Your Price ($):</label>
                                                            <input type="number" id="bidAmount" placeholder="e.g., 500" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} required />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="deliveryDays">Estimated Delivery (days):</label>
                                                            <input type="number" id="deliveryDays" placeholder="e.g., 7" value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} required />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="proposal">Your Proposal:</label>
                                                            <textarea id="proposal" placeholder="Tell the client why you're the best fit, your approach, and experience..." value={proposal} onChange={(e) => setProposal(e.target.value)} required />
                                                        </div>
                                                        <div className="form-actions">
                                                            <button type="submit" className="submit-bid-button">Submit Bid</button>
                                                            <button type="button" onClick={() => setIsBidding(false)} className="cancel-button">Cancel</button>
                                                        </div>
                                                        {bidSuccessMessage && <p className="success-message">{bidSuccessMessage}</p>}
                                                        {errorMessage === "You have already placed a bid on this project." && <p className="error-message">{errorMessage}</p>}
                                                    </form>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            {/* Message for freelancer if project is not open or already assigned */}
                            {user?.role === 'freelancer' && project.project_status !== 'open' && project.assigned_freelancer_id !== user?.userId && (
                                <p className="info-message">This project is no longer open for bidding.</p>
                            )}
                            {user?.role === 'freelancer' && project.assigned_freelancer_id === user?.userId && (
                                <p className="success-message">You have been awarded this project! Check the Deliverables tab.</p>
                            )}
                        </section>
                    )}

                    {activeTab === 'bids' && isClientForProject && (
                        <section className="bids-section tab-panel active">
                            <h3>Project Bids ({bids.length})</h3>
                            {bids.length > 0 ? (
                                <ul className="bids-list">
                                    {bids.map(bid => (
                                        <li key={bid.id} className={`bid-item ${bid.status}`}>
                                            <div className="bid-info">
                                                <p className="bid-freelancer"><strong>Freelancer:</strong> {bid.freelancer_username} ({bid.freelancer_rating ? `Rating: ${bid.freelancer_rating}/5` : 'No rating'})</p>
                                                <p className="bid-amount"><strong>Bid:</strong> <span className="highlight-amount">${bid.bid_amount}</span></p>
                                                <p className="bid-delivery"><strong>Delivery:</strong> {bid.delivery_days} days</p>
                                            </div>
                                            <p className="bid-proposal"><strong>Proposal:</strong> {bid.proposal}</p>
                                            <p className="bid-status">Status: <span className={`status-label ${bid.status}`}>{bid.status}</span></p>
                                            {project.project_status === 'open' && bid.status === 'pending' && (
                                                <div className="bid-actions">
                                                    <button onClick={() => handleAwardBid(bid.id)} className="award-button">Award Bid</button>
                                                    <button onClick={() => handleRejectBid(bid.id)} className="reject-button">Reject Bid</button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-bids-message">No bids received yet for this project. Share your project to attract freelancers!</p>
                            )}
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                        </section>
                    )}

                    {activeTab === 'deliverables' && (isClientForProject || isAssignedFreelancer) && (
                        <section className="deliverables-section tab-panel active">
                            <h3>Project Deliverables ({deliverables.length})</h3>

                            {/* Freelancer Upload Deliverable Section */}
                            {isAssignedFreelancer && project.project_status === 'assigned' && (
                                <div className="upload-deliverable-card">
                                    <h4>Upload Your Work</h4>
                                    <form onSubmit={handleDeliverableUpload} className="deliverable-upload-form">
                                        <div className="form-group">
                                            <label htmlFor="deliverableFile">Select File:</label>
                                            <input type="file" id="deliverableFile" onChange={(e) => setUploadFile(e.target.files[0])} required />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="uploadDescription">Description (Optional):</label>
                                            <textarea id="uploadDescription" value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} rows="3" placeholder="Briefly describe the content of this deliverable..."></textarea>
                                        </div>
                                        <button type="submit" className="submit-upload-button">Upload Deliverable</button>
                                        {uploadSuccess && <p className="success-message">{uploadSuccess}</p>}
                                        {uploadError && <p className="error-message">{uploadError}</p>}
                                    </form>
                                </div>
                            )}

                            {deliverables.length === 0 ? (
                                <p className="no-deliverables-message">No deliverables uploaded yet.</p>
                            ) : (
                                <ul className="deliverables-list">
                                    {deliverables.map(deliverable => (
                                        <li key={deliverable.id} className="deliverable-item">
                                            <div className="deliverable-info">
                                                <span className="file-icon">📁</span>
                                                <div className="file-details">
                                                    <p className="file-name">{deliverable.file_name}</p>
                                                    <p className="upload-date">Uploaded: {new Date(deliverable.upload_date).toLocaleString()}</p>
                                                    {deliverable.description && <p className="file-description">{deliverable.description}</p>}
                                                </div>
                                            </div>
                                            {isClientForProject && (
                                                <a href={`http://localhost:5000/api/deliverables/download/${deliverable.id}`} target="_blank" rel="noopener noreferrer" className="download-button">
                                                    Download
                                                    <span className="download-icon">↓</span>
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProjectDetails;
// src/ClientReviewDeliverablesPage.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Header from './components/Header'; // Assuming Header is in components folder
import Footer from './components/Footer'; // Assuming Footer is in components folder
import './ClientReviewDeliverablesPage.css'; // Create this CSS file

const ClientReviewDeliverablesPage = () => {
    const { projectId } = useParams();
    const { user, isLoading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [deliverables, setDeliverables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchProjectAndDeliverables = useCallback(async () => {
        if (authLoading) return; // Wait for auth context to load

        if (!user || !user.token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Fetch project details
            const projectResponse = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const fetchedProject = projectResponse.data;
            setProject(fetchedProject);

            // Ensure only client related to project can view this page
            if (user.role !== 'client' || fetchedProject.client_id !== user.userId) {
                setError("Access Denied: You are not authorized to review this project's deliverables.");
                setLoading(false);
                return;
            }

            // Fetch deliverables for the project
            const deliverablesResponse = await axios.get(`http://localhost:5000/api/deliverables/${projectId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setDeliverables(deliverablesResponse.data);

        } catch (err) {
            console.error("Error fetching project or deliverables:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || "Failed to load project deliverables. Please try again.");
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [projectId, user, authLoading, navigate]);

    useEffect(() => {
        fetchProjectAndDeliverables();
    }, [fetchProjectAndDeliverables]);

    const handleAcceptProject = async () => {
        if (!window.confirm('Are you sure you want to accept this project? This will mark the project as completed and release payment.')) {
            return;
        }
        setSuccessMessage('');
        setError(null);
        try {
            const response = await axios.post(
                `http://localhost:5000/api/projects/${projectId}/accept`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setSuccessMessage(response.data.message);
            fetchProjectAndDeliverables(); // Re-fetch to update status
            setTimeout(() => {
                setSuccessMessage('');
                navigate('/my-projects'); // Redirect after a short delay
            }, 3000);
        } catch (err) {
            console.error("Error accepting project:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || "Failed to accept project.");
        }
    };

    const handleRequestRevisions = async () => {
        const revisionMessage = prompt('Please provide details for the revisions needed:');
        if (!revisionMessage) {
            return; // User cancelled or entered empty message
        }

        setSuccessMessage('');
        setError(null);
        try {
            const response = await axios.post(
                `http://localhost:5000/api/projects/${projectId}/request-revisions`,
                { revisionMessage },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setSuccessMessage(response.data.message);
            fetchProjectAndDeliverables(); // Re-fetch to update status
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error("Error requesting revisions:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || "Failed to request revisions.");
        }
    };

        const handleDownloadDeliverable = async (deliverableId, fileName) => {
        if (!user || !user.token) {
            setError("You must be logged in to download files.");
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/deliverables/download/${deliverableId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                responseType: 'blob', // Important: tells axios to expect binary data (file)
            });

            // Create a Blob from the response data
            const blob = new Blob([response.data]);

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary <a> element to trigger the download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); // Set the desired file name
            document.body.appendChild(link);
            link.click();

            // Clean up: remove the temporary URL and link
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

        } catch (err) {
            console.error("Error downloading file:", err);
            setError("Failed to download file. Please try again.");
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        }
    };

    if (loading || authLoading) {
        return <div className="client-review-container loading-state"><p>Loading project for review...</p></div>;
    }

    if (error) {
        return (
            <div className="client-review-container error-state">
                <p>{error}</p>
            </div>
        );
    }

    if (!project) {
        return <div className="client-review-container"><p>No project found or accessible.</p></div>;
    }

    // Only show review options if project is submitted or completed_pending_review
    const showReviewActions = project.project_status === 'submitted' || project.project_status === 'completed_pending_review';

    return (
        <div className="client-review-container">
            <Header />
            <h1 className="page-title">Review Project: {project.title}</h1>

            {successMessage && <div className="alert-success">{successMessage}</div>}
            {error && <div className="alert-error">{error}</div>}

            <section className="project-summary">
                <h3>Project Summary</h3>
                <p><strong>Status:</strong> <span className={`status-badge status-${project.project_status.replace(/\s/g, '-')}`}>{project.project_status.toUpperCase()}</span></p>
                <p><strong>Assigned Freelancer:</strong> {project.freelancer_username || 'Not Assigned'}</p> {/* Assuming you can fetch freelancer username */}
                <p><strong>Budget:</strong> ${parseFloat(project.budget).toFixed(2)}</p>
            </section>

                       <section className="deliverables-list-section">
                <h3>Uploaded Deliverables</h3>
                {deliverables.length === 0 ? (
                    <p className="no-deliverables-message">No deliverables uploaded yet for this project.</p>
                ) : (
                    <ul className="deliverables-list">
                        {deliverables.map(deliverable => (
                            <li key={deliverable.id} className="deliverable-item">
                                <p><strong>File:</strong> {deliverable.file_name}</p>
                                <p><strong>Uploaded:</strong> {new Date(deliverable.upload_date).toLocaleString()}</p>
                                {deliverable.description && <p><strong>Description:</strong> {deliverable.description}</p>}
                                {/* Change the <a> tag to a button or <a> with onClick */}
                                <button
                                    onClick={() => handleDownloadDeliverable(deliverable.id, deliverable.file_name)}
                                    className="download-button"
                                >
                                    Download File
                                </button>
                                {/* OR, if you prefer <a> but with an onClick handler */}
                                {/*
                                <a
                                    href="#" // Use # to prevent default navigation
                                    onClick={(e) => {
                                        e.preventDefault(); // Prevent default link behavior
                                        handleDownloadDeliverable(deliverable.id, deliverable.file_name);
                                    }}
                                    className="download-button"
                                >
                                    Download File
                                </a>
                                */}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {showReviewActions && deliverables.length > 0 && (
                <section className="review-actions">
                    <h3>Review Actions</h3>
                    <p>Once you have reviewed the deliverables, please choose an option:</p>
                    <div className="action-buttons">
                        <button onClick={handleAcceptProject} className="action-button accept-button">
                            Accept Project & Release Payment
                        </button>
                        <button onClick={handleRequestRevisions} className="action-button revise-button">
                            Request Revisions
                        </button>
                    </div>
                </section>
            )}

            {!showReviewActions && (project.project_status === 'assigned' || project.project_status === 'in_progress') && (
                 <p className="info-message">The freelancer is currently working on this project. Deliverables not yet submitted for review.</p>
            )}
             {!showReviewActions && project.project_status === 'open' && (
                 <p className="info-message">This project is awaiting assignment to a freelancer.</p>
            )}


            <Footer />
        </div>
    );
};

export default ClientReviewDeliverablesPage;
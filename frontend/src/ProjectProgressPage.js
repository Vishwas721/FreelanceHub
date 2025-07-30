// src/pages/ProjectProgressPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Adjust path as needed
import Header from './components/Header'; // Your unified Header component
import Footer from './components/Footer'; // Your Footer component
import './ProjectProgressPage.css'; // Import page-specific CSS

const ProjectProgressPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useContext(AuthContext);

    const [project, setProject] = useState(null);
    const [deliverables, setDeliverables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Deliverable upload states
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    const fetchProjectAndDeliverables = useCallback(async () => {
        if (authLoading) return;

        if (!user || !user.token) {
            setError("Authentication required.");
            setLoading(false);
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

            console.log("ProjectProgressPage - Fetched Project:", fetchedProject);
            console.log("ProjectProgressPage - User from AuthContext:", user);

            // Access control check
            const isClient = user.role === 'client' && fetchedProject.client_id === user.userId;
            const isAssignedFreelancer = user.role === 'freelancer' && fetchedProject.assigned_freelancer_id === user.userId;
            
            console.log("Is Client authorized?", isClient);
            console.log("Is Assigned Freelancer authorized?", isAssignedFreelancer);

            if (!isClient && !isAssignedFreelancer) {
                setError("Access Denied: You are not authorized to view the progress of this project.");
                setLoading(false);
                navigate('/dashboard'); // Redirect if not authorized
                return;
            }

            setProject(fetchedProject); // <--- Make sure this is updated with the latest status

            // Fetch deliverables
            const deliverablesResponse = await axios.get(`http://localhost:5000/api/deliverables/${projectId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setDeliverables(deliverablesResponse.data);

        } catch (err) {
            console.error("Error fetching project progress:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || "Failed to load project progress.");
            if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
                navigate('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    }, [projectId, user, navigate, authLoading]);

    useEffect(() => {
        fetchProjectAndDeliverables();
    }, [fetchProjectAndDeliverables]);

    const handleDeliverableUpload = async (e) => {
        e.preventDefault();
        setUploadError('');
        setUploadSuccess('');
        setUploading(true);

        if (!uploadFile) {
            setUploadError("Please select a file to upload.");
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('deliverableFile', uploadFile);
        formData.append('description', uploadDescription);

        try {
            const response = await axios.post(`http://localhost:5000/api/deliverables/upload/${projectId}`, formData, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadSuccess(response.data.message);
            setUploadFile(null);
            setUploadDescription('');
            fetchProjectAndDeliverables(); // Re-fetch deliverables AND project details to get updated status
        } catch (err) {
            console.error("Error uploading deliverable:", err.response?.data?.error || err.message);
            setUploadError(err.response?.data?.error || "Failed to upload deliverable.");
        } finally {
            setUploading(false);
        }
    };

    const handleMarkProjectComplete = async () => {
        // Using a custom modal/dialog would be better than window.confirm for a "one-of-a-kind" UI
        // For this exercise, I'll keep confirm for simplicity but note the improvement.
        if (!window.confirm("Are you sure you want to mark this project as completed? This action cannot be undone.")) {
            return;
        }
        setSuccessMessage('');
        setError('');
        try {
            const response = await axios.post(`http://localhost:5000/api/projects/${projectId}/complete`, {}, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            setSuccessMessage(response.data.message);
            fetchProjectAndDeliverables(); // Re-fetch project status to update UI
        } catch (err) {
            console.error("Error marking project complete:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || "Failed to mark project as complete.");
        }
    };

    const handleGoBack = () => {
        navigate('/my-projects'); // Navigate to the 'my-projects' page
    };


    if (loading || authLoading) {
        return (
            <div className="loading-page-container">
                <p className="loading-text">Loading project progress...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-page-container">
                <div className="alert-error" role="alert">
                    <strong>Error!</strong> {error}
                </div>
                <button
                    onClick={handleGoBack}
                    className="button secondary-button" // Changed to secondary-button
                >
                    Back to My Projects
                </button>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="error-page-container">
                <div className="alert-warning" role="alert">
                    <strong>Oops!</strong> Project not found or not accessible.
                </div>
                <button
                    onClick={handleGoBack}
                    className="button secondary-button" // Changed to secondary-button
                >
                    Back to My Projects
                </button>
            </div>
        );
    }

    const isClient = user?.role === 'client';
    const isAssignedFreelancer = user?.role === 'freelancer' && project.assigned_freelancer_id === user.userId;
    const canUploadDeliverables = isAssignedFreelancer && (project.project_status === 'assigned' || project.project_status === 'in progress');
    const canMarkComplete = isClient && (project.project_status === 'assigned' || project.project_status === 'in progress');

    return (
        <div className="page-container">
            <Header />
            <main className="project-progress-main">
                <div className="progress-main-card">
                    <h1 className="progress-page-title">Project Progress: <span className="project-title-highlight">{project.title}</span></h1>

                    {successMessage && (
                        <div className="alert-success">
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div className="alert-error">
                            {error}
                        </div>
                    )}

                    <section className="project-overview-section">
                        <h2 className="section-title">Project Details</h2>
                        <div className="project-details-grid">
                            <p><strong>Description:</strong> {project.description}</p>
                            <p><strong>Budget:</strong> ${parseFloat(project.budget).toFixed(2)}</p>
                            <p>
                                <strong>Current Status:</strong>
                                <span className={`status-badge status-${project.project_status.replace(/\s/g, '-')}`}>
                                    {project.project_status.toUpperCase()}
                                </span>
                            </p>
                            <p><strong>Deadline:</strong> {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</p>
                            {isClient && project.assigned_freelancer_id && (
                                <p><strong>Assigned Freelancer:</strong> <span className="freelancer-name-highlight">{project.assigned_freelancer_username || 'Loading...'}</span></p>
                            )}
                            {isAssignedFreelancer && project.client_id && (
                                <p><strong>Client:</strong> <span className="client-name-highlight">{project.client_username || 'Loading...'}</span></p>
                            )}
                        </div>
                        <div className="section-actions">
                            {canMarkComplete && (
                                <button
                                    onClick={handleMarkProjectComplete}
                                    className="button complete-button"
                                >
                                    Mark Project as Completed
                                </button>
                            )}
                            <button
                                onClick={handleGoBack}
                                className="button secondary-button" // Added 'secondary-button' class
                            >
                                Back to My Projects
                            </button>
                        </div>
                    </section>

                    {canUploadDeliverables && (
                        <section className="upload-deliverable-section">
                            <h2 className="section-title">Upload New Deliverable</h2>
                            <form onSubmit={handleDeliverableUpload} className="upload-form">
                                <div className="form-group">
                                    <label htmlFor="deliverableFile" className="form-label">Select File:</label>
                                    <input
                                        type="file"
                                        id="deliverableFile"
                                        onChange={(e) => setUploadFile(e.target.files[0])}
                                        className="form-input file-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="uploadDescription" className="form-label">Description (Optional):</label>
                                    <textarea
                                        id="uploadDescription"
                                        value={uploadDescription}
                                        onChange={(e) => setUploadDescription(e.target.value)}
                                        rows="4"
                                        placeholder="Briefly describe this deliverable..."
                                        className="form-input form-textarea"
                                    ></textarea>
                                </div>
                                <div className="form-actions form-actions-center">
                                    <button
                                        type="submit"
                                        className="button primary-button"
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Deliverable'}
                                    </button>
                                </div>
                                {uploadSuccess && <p className="success-text">{uploadSuccess}</p>}
                                {uploadError && <p className="error-text">{uploadError}</p>}
                            </form>
                        </section>
                    )}

                    <section className="deliverables-list-section">
                        <h2 className="section-title">Uploaded Deliverables</h2>
                        {deliverables.length === 0 ? (
                            <p className="no-deliverables-message">No deliverables uploaded yet. The freelancer will upload files here.</p>
                        ) : (
                            <div className="deliverables-grid">
                                {deliverables.map(deliverable => (
                                    <div key={deliverable.id} className="deliverable-card">
                                        <p className="deliverable-file-name">File: {deliverable.file_name}</p>
                                        <p className="deliverable-upload-date">Uploaded: {new Date(deliverable.upload_date).toLocaleString()}</p>
                                        {deliverable.description && <p className="deliverable-description">"{deliverable.description}"</p>}
                                        <a
                                            href={`http://localhost:5000/api/deliverables/download/${deliverable.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="button download-button"
                                        >
                                            Download File
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProjectProgressPage;
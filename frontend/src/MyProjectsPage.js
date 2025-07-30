import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // Adjusted path
import { useNavigate } from 'react-router-dom';
import './MyProjectsPage.css';
import Header from './components/Header'; // Adjusted path
import Footer from './components/Footer'; // Adjusted path

const MyProjectsPage = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [projectToDeleteId, setProjectToDeleteId] = useState(null);

    // Function to fetch projects, memoized with useCallback
    const fetchMyProjects = useCallback(async () => {
        if (authLoading) {
            // Wait for auth status to be determined
            return;
        }

        if (!user || !user.token) {
            // If user is null or token is missing after authLoading is false
            navigate('/login');
            return;
        }

        if (user.role !== 'client') {
            // Check role after user is confirmed
            setError("Access Denied: You must be a client to view this page.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // This endpoint fetches projects by client_id, including bid_count
            const response = await axios.get('http://localhost:5000/api/projects/my-projects', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setProjects(response.data);
        } catch (err) {
            console.error("Error fetching my projects:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || "Failed to load your projects. Please try again.");
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login'); // Redirect on auth/permission errors
            }
        } finally {
            setLoading(false);
        }
    }, [user, navigate, authLoading]); // Dependencies for useCallback

    // Effect to trigger fetching projects on component mount or dependencies change
    useEffect(() => {
        fetchMyProjects();
    }, [fetchMyProjects]); // Depend on the memoized fetchMyProjects

    // Function to initiate delete confirmation
    const handleDeleteProject = (projectId) => {
        setProjectToDeleteId(projectId);
        setShowConfirmModal(true);
    };

    // Function to confirm and proceed with deletion
    const confirmDelete = async () => {
        setShowConfirmModal(false); // Close modal
        setDeleteMessage(''); // Clear any previous messages
        setError(null);

        if (!projectToDeleteId) return; // Should not happen if modal is shown correctly

        try {
            await axios.delete(`http://localhost:5000/api/projects/delete/${projectToDeleteId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setDeleteMessage('Project deleted successfully!');
            fetchMyProjects(); // Re-fetch projects to update the list
            setTimeout(() => setDeleteMessage(''), 3000); // Clear message after 3 seconds
        } catch (err) {
            console.error('Error deleting project:', err.response?.data?.error || err.message);
            setError(err.response?.data?.error || 'Failed to delete project.');
        } finally {
            setProjectToDeleteId(null); // Clear ID
        }
    };

    // Function to cancel deletion
    const cancelDelete = () => {
        setShowConfirmModal(false);
        setProjectToDeleteId(null);
    };

    const handleEditProject = (projectId) => {
        navigate(`/edit-project/${projectId}`);
    };

    const handleViewProgress = (projectId) => {
        navigate(`/project-progress/${projectId}`);
    };

    // Render loading state
    if (loading || authLoading) {
        return (
            <div className="my-projects-container loading-state">
                <div className="spinner"></div>
                <p>Loading your projects...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="my-projects-container error-state">
                <p>{error}</p>
                {/* Only show Post Project button if it's a client and not an auth error */}
                {user && user.role === 'client' && !(error.includes("Authentication") || error.includes("Access Denied")) &&
                    <button onClick={() => navigate('/post-project')} className="call-to-action-button">Post a Project</button>
                }
            </div>
        );
    }

    return (
        <div className="my-projects-container">
            <Header />
            <h1 className="page-title">My Posted Projects</h1>

            {deleteMessage && (
                <div className="alert-success delete-success-message">
                    {deleteMessage}
                </div>
            )}

            {projects.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't posted any projects yet.</p>
                    <button className="call-to-action-button" onClick={() => navigate('/post-project')}>
                        Post Your First Project!
                    </button>
                </div>
            ) : (
                <div className="projects-list">
                    {projects.map(project => (
                        <div key={project.id} className="project-card">
                            <h2 className="project-card-title">{project.title}</h2>
                            <p className="project-card-description">{project.description}</p>
                            <div className="project-card-details">
                                <span className="detail-item">Budget: ${parseFloat(project.budget).toFixed(2)}</span>
                                <span className="detail-item status-item">
                                    Status:
                                    {project.project_status ? (
                                        <span className={`status-badge status-${project.project_status.replace(/\s/g, '-')}`}>
                                            {project.project_status.toUpperCase()}
                                        </span>
                                    ) : (
                                        <span className="status-badge status-unknown">UNKNOWN</span>
                                    )}
                                </span>
                                <span className="detail-item">Bids: {project.bid_count || 0}</span>
                                <span className="detail-item">Posted: {new Date(project.created_at).toLocaleDateString()}</span>
                                {project.assigned_freelancer_id && (
                                    <span className="detail-item">Assigned To: {project.assigned_freelancer_id}</span>
                                )}
                            </div>
                            <div className="project-card-actions">
                                {/* "View Bids" button - only for 'open' projects with bids */}
                                {project.project_status === 'open' && project.bid_count > 0 && (
                                    <button
                                        className="action-button primary-action-button"
                                        onClick={() => navigate(`/view-bids/${project.id}`)}
                                    >
                                        View Bids ({project.bid_count})
                                    </button>
                                )}
                                {/* Edit/Delete buttons for 'open' projects */}
                                {project.project_status === 'open' && (
                                    <>
                                        <button
                                            className="action-button secondary-action-button"
                                            onClick={() => handleEditProject(project.id)}
                                        >
                                            Edit Project
                                        </button>
                                        <button
                                            className="action-button delete-button"
                                            onClick={() => handleDeleteProject(project.id)}
                                        >
                                            Delete Project
                                        </button>
                                    </>
                                )}
                                {/* "View Progress" button for assigned/in progress/completed projects */}
                                {(project.project_status === 'assigned' || project.project_status === 'in_progress') && (
                                    <button
                                        className="action-button primary-action-button"
                                        onClick={() => handleViewProgress(project.id)}
                                    >
                                        View Progress
                                    </button>
                                )}

                                {/* NEW: Button for Client to Review Deliverables */}
                                {(project.project_status === 'submitted' || project.project_status === 'completed_pending_review') && (
                                    <button
                                        className="action-button primary-action-button review-deliverables-button"
                                        onClick={() => navigate(`/review-deliverables/${project.id}`)}
                                    >
                                        Review Deliverables
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Footer />

            {/* Custom Confirmation Modal */}
            {showConfirmModal && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal-content">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this project? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="action-button delete-button" onClick={confirmDelete}>Delete Anyway</button>
                            <button className="action-button secondary-action-button" onClick={cancelDelete}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProjectsPage;

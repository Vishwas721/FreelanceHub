import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FreelancerAssignedProjects.css';

const FreelancerAssignedProjects = () => {
    const [assignedProjects, setAssignedProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssignedProjects = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const response = await axios.get(
                    'http://localhost:5000/api/projects/assigned-to-me',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setAssignedProjects(response.data);
            } catch (err) {
                console.error('Error fetching assigned projects:', err);
                setError('Failed to load assigned projects.');
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                } else if (err.response && err.response.status === 403) {
                    setError('You are not authorized to view this page.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedProjects();
    }, [navigate]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <div className="assigned-projects-container">Loading assigned projects...</div>;
    }

    if (error) {
        return <div className="assigned-projects-container error">{error}</div>;
    }

    return (
        <div className="assigned-projects-container">
            <h1 className="page-title">My Assigned Projects</h1>
            <p className="page-subtitle">A list of all projects currently assigned to you.</p>

            {assignedProjects.length === 0 ? (
                <p className="no-projects-message">You currently have no projects assigned to you.</p>
            ) : (
                <div className="projects-list">
                    {assignedProjects.map((project) => (
                        <div key={project.id} className="project-card">
                            <div className="card-header">
                                <h3 className="project-title">{project.title}</h3>
                                {project.project_status === 'assigned' && <span className="status-badge accepted">Accepted</span>}
                                {project.project_status === 'in_progress' && <span className="status-badge in-progress">In Progress</span>}
                                {project.project_status === 'completed_pending_review' && <span className="status-badge pending-review">Pending Review</span>}
                                {project.project_status === 'completed' && <span className="status-badge completed">Completed</span>}
                            </div>
                            <div className="card-details">
                                <p className="bid-amount">Your Budget: <span>${project.budget}</span></p>
                                <p className="project-description">{project.description}</p>
                                <p className="deadline-date">Deadline: <span>{formatDate(project.deadline)}</span></p>
                                <p className="client-info">Client: <span>{project.client_username || 'N/A'}</span></p>
                            </div>
                            <div className="card-actions">
                                <button
                                    className="view-project-button"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    View Project
                                </button>
                                {(project.project_status === 'assigned' || project.project_status === 'in_progress') && (
                                    <button
                                        className="mark-for-review-button"
                                        onClick={async () => {
                                            try {
                                                const token = localStorage.getItem('token');
                                                await axios.post(
                                                    `http://localhost:5000/api/projects/${project.id}/mark-for-review`,
                                                    {},
                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                );
                                                alert('Project marked for review!');
                                                setLoading(true);
                                                setError(null);
                                                const updatedResponse = await axios.get(
                                                    'http://localhost:5000/api/projects/assigned-to-me',
                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                );
                                                setAssignedProjects(updatedResponse.data);
                                                setLoading(false);
                                            } catch (err) {
                                                console.error('Error marking project for review:', err);
                                                alert('Failed to mark project for review.');
                                            }
                                        }}
                                    >
                                        Mark as Completed
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FreelancerAssignedProjects;
// src/pages/EditProjectPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Adjusted path for AuthContext
import Header from './components/Header'; // Adjusted path for Header
import Footer from './components/Footer'; // Adjusted path for Footer
import './EditProjectPage.css'; // Import page-specific CSS

const EditProjectPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useContext(AuthContext); // Use 'loading' from AuthContext

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [skillsRequired, setSkillsRequired] = useState(''); // Stored as comma-separated string for input
    const [category, setCategory] = useState('');
    const [visibility, setVisibility] = useState('public');

    // Fetch project details
    const fetchProjectDetails = useCallback(async () => {
        if (authLoading) {
            // Wait for auth status to be determined
            return;
        }

        if (!user || !user.token || user.role !== 'client') {
            setError("Access Denied: Only clients can edit projects.");
            setLoading(false);
            navigate('/login'); // Redirect if not authorized
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const fetchedProject = response.data;

            // FIX: Convert fetchedProject.client_id to a number for comparison
            const clientOwnsProject = parseInt(fetchedProject.client_id, 10) === user.userId;

            // Ensure the logged-in client owns this project
            if (!clientOwnsProject) { // Use the boolean variable directly
                setError("Access Denied: You do not own this project.");
                setLoading(false);
                navigate('/my-projects'); // Redirect if not project owner
                return;
            }
            if (fetchedProject.project_status !== 'open') {
                setError("Project cannot be edited as it's no longer open.");
                setLoading(false);
                // Optionally redirect to project details or progress page
                navigate(`/project-details/${projectId}`); // Or a message indicating why it can't be edited
                return;
            }

            setProject(fetchedProject);
            setTitle(fetchedProject.title);
            setDescription(fetchedProject.description);
            setBudget(fetchedProject.budget);
            setDeadline(fetchedProject.deadline ? fetchedProject.deadline.split('T')[0] : ''); // Format date for input
            // Parse skills_required if it's a JSON string, then join for input
            let parsedSkills = [];
            if (typeof fetchedProject.skills_required === 'string') {
                try {
                    parsedSkills = JSON.parse(fetchedProject.skills_required);
                } catch (e) {
                    console.error("Error parsing skills_required:", e);
                    parsedSkills = fetchedProject.skills_required.split(',').map(s => s.trim()); // Fallback for comma-separated
                }
            } else if (Array.isArray(fetchedProject.skills_required)) {
                parsedSkills = fetchedProject.skills_required;
            }
            setSkillsRequired(parsedSkills.join(', '));
            setCategory(fetchedProject.category);
            setVisibility(fetchedProject.visibility);

        } catch (err) {
            console.error("Error fetching project for editing:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || "Failed to load project for editing.");
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [projectId, user, navigate, authLoading]);

    useEffect(() => {
        fetchProjectDetails();
    }, [fetchProjectDetails]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        if (!user || !user.token) {
            setError("Authentication token missing. Please log in.");
            navigate('/login');
            return;
        }

        try {
            const updatedSkillsArray = skillsRequired.split(',').map(s => s.trim()).filter(s => s); // Convert back to array
            const payload = {
                title,
                description,
                budget: parseFloat(budget),
                deadline,
                skillsRequired: updatedSkillsArray, // Send as array
                category,
                visibility,
            };

            const response = await axios.put(`http://localhost:5000/api/projects/${projectId}`, payload, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setSuccessMessage(response.data.message);
            // Optionally, navigate back to my projects or project details
            setTimeout(() => navigate(`/my-projects`), 2000);

        } catch (err) {
            console.error("Error updating project:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || "Failed to update project.");
        }
    };

    const handleGoBack = () => {
        navigate('/my-projects');
    };

    if (loading || authLoading) {
        return (
            <div className="loading-page-container">
                <div className="spinner"></div> {/* Custom spinner */}
                <p className="loading-text">Loading project details...</p>
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
                    className="button primary-button"
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
                    className="button primary-button"
                >
                    Back to My Projects
                </button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Header />
            <main className="edit-project-main">
                <div className="edit-project-card">
                    <h1 className="edit-project-title">Edit Project: <span className="project-title-highlight">{project.title}</span></h1>

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

                    <form onSubmit={handleSubmit} className="edit-project-form">
                        <div className="form-group">
                            <label htmlFor="title" className="form-label">Project Title</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="8"
                                className="form-input form-textarea"
                                required
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="budget" className="form-label">Budget ($)</label>
                            <input
                                type="number"
                                id="budget"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="form-input"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="deadline" className="form-label">Deadline</label>
                            <input
                                type="date"
                                id="deadline"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="skillsRequired" className="form-label">Skills Required (comma-separated)</label>
                            <input
                                type="text"
                                id="skillsRequired"
                                value={skillsRequired}
                                onChange={(e) => setSkillsRequired(e.target.value)}
                                placeholder="e.g., React, Node.js, SQL"
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category" className="form-label">Category</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="form-input form-select"
                                required
                            >
                                <option value="">Select a category</option>
                                <option value="Web Development">Web Development</option>
                                <option value="Mobile App Development">Mobile App Development</option>
                                <option value="UI/UX Design">UI/UX Design</option>
                                <option value="Graphic Design">Graphic Design</option>
                                <option value="Writing & Translation">Writing & Translation</option>
                                <option value="Digital Marketing">Digital Marketing</option>
                                <option value="Data Science">Data Science</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="visibility" className="form-label">Visibility</label>
                            <select
                                id="visibility"
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value)}
                                className="form-input form-select"
                                required
                            >
                                <option value="public">Public</option>
                                <option value="private">Private (Only visible to invited freelancers)</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={handleGoBack}
                                className="button secondary-button"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="button primary-button"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EditProjectPage;

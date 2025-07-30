import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Projects.css"; // Ensure this path is correct
import { useNavigate, Link } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // State for search term
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/projects/list", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setProjects(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching projects:", error);
                setError(error.message || "Failed to fetch projects.");
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Filter projects based on search term
    const filteredProjects = projects.filter(project => {
        const titleMatch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
        const descriptionMatch = project.description?.toLowerCase().includes(searchTerm.toLowerCase());
        let skillsMatch = false;
        if (project.skills_required) {
            try {
                const parsedSkills = typeof project.skills_required === 'string'
                    ? JSON.parse(project.skills_required)
                    : project.skills_required;
                if (Array.isArray(parsedSkills)) {
                    skillsMatch = parsedSkills.some(skill =>
                        skill.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
            } catch (e) {
                // Silently handle parsing errors for filtering
            }
        }
        return titleMatch || descriptionMatch || skillsMatch;
    });


    if (loading) {
        return (
            <div className="projects-page-container">
                <Header />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Fetching exciting projects...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="projects-page-container">
                <Header />
                <div className="error-state">
                    <h2>Oops! Something went wrong.</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-button">
                        Try Again
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="projects-page-container">
            <Header />
            <div className="projects-hero-section">
                <div className="hero-content">
                    <h1>Discover Your Next Big Project!</h1>
                    <p>Browse a wide range of freelance opportunities tailored to your skills.</p>
                    <div className="search-bar-container">
                        <input
                            type="text"
                            placeholder="Search projects by title, description, or skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="search-button">Search</button>
                    </div>
                </div>
            </div>

            <div className="projects-content-wrapper">
                {/* Main content area */}
                <div className="projects-main">
                    {filteredProjects.length > 0 ? (
                        <ul className="projects-grid">
                            {filteredProjects.map((project) => {
                                let parsedSkills = [];
                                if (project.skills_required) {
                                    try {
                                        parsedSkills = typeof project.skills_required === 'string'
                                            ? JSON.parse(project.skills_required)
                                            : project.skills_required;
                                        if (!Array.isArray(parsedSkills)) {
                                            parsedSkills = [];
                                        }
                                    } catch (e) {
                                        console.error("Error parsing skills_required for project ID:", project.id, e);
                                        parsedSkills = [];
                                    }
                                }

                                return (
                                    <li key={project.id} className="project-card">
                                        <div className="card-header">
                                            <h2 className="card-title">{project.title}</h2>
                                            <span className="project-status-badge open">Open</span> {/* Always 'Open' for available projects */}
                                        </div>
                                        <p className="card-description">{project.description && project.description.substring(0, 120)}...</p>

                                        {parsedSkills.length > 0 && (
                                            <div className="skills-tags-container">
                                                {parsedSkills.map((skill, index) => (
                                                    <span key={index} className="skill-tag">{skill}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="card-footer">
                                            <span className="card-budget">Budget: ${project.budget}</span>
                                            <Link className="view-project-button" to={`/projects/${project.id}`}>View Details</Link>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="no-projects-found">
                            <h2>No projects found matching your criteria.</h2>
                            <p>Try adjusting your search or check back later for new opportunities!</p>
                            <button onClick={() => setSearchTerm("")} className="clear-search-button">
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Projects;
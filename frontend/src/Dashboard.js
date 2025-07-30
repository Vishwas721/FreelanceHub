import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import ActivityFeed from "./ActivityFeed";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import DashboardStats from "./components/DashboardStats";
import FloatingActions from "./components/FloatingActions";
import NotificationsPanel from "./components/NotificationsPanel";
import DraggableWidget from "./components/DraggableWidget";
import { useDrop } from "react-dnd";
import axios from "axios";
import Footer from "./components/Footer";
// ... (imports and existing state/effects)

const Dashboard = () => {
    const { user, switchRole, unreadNotificationsCount, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [widgets, setWidgets] = useState([
        { id: 1, title: "Dashboard Analytics", content: <DashboardStats /> },
        { id: 2, title: "Live Activity Feed", content: <ActivityFeed /> },
    ]);
    const [recentProjects, setRecentProjects] = useState([]); // State for freelancer's recent projects
    const [assignedProjects, setAssignedProjects] = useState([]); // NEW: State for freelancer's assigned projects

    // Essential guard for unauthenticated users
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Debugging logs
    useEffect(() => {
        console.log('Dashboard User (from AuthContext):', user);
        console.log('Dashboard Unread Notifications Count:', unreadNotificationsCount);
    }, [user, unreadNotificationsCount]);

    // Function to handle role switch
    const handleSwitchRole = async () => {
        const newRole = user.role === "freelancer" ? "client" : "freelancer";
        await switchRole(newRole);
        navigate("/dashboard"); // Navigate to the dashboard after role switch
    };

    // Fetch recent projects (e.g., bids placed by freelancer)
    useEffect(() => {
        const fetchRecentProjects = async () => {
            if (user?.token && user?.role === "freelancer") {
                try {
                    const response = await axios.get("http://localhost:5000/api/projects/recent-for-freelancer", {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    setRecentProjects(response.data.slice(0, 3)); // Get top 3
                } catch (error) {
                    console.error("Error fetching recent projects:", error);
                }
            } else {
                setRecentProjects([]);
            }
        };

        fetchRecentProjects();
    }, [user?.role, user?.token]);

    // NEW: Fetch assigned projects for freelancer (projects where their bid was accepted)
    useEffect(() => {
        const fetchAssignedProjects = async () => {
            if (user?.token && user?.role === "freelancer") {
                try {
                    // Assuming you have an endpoint for assigned projects
                    const response = await axios.get("http://localhost:5000/api/projects/assigned-to-me", {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    setAssignedProjects(response.data);
                } catch (error) {
                    console.error("Error fetching assigned projects:", error);
                }
            } else {
                setAssignedProjects([]);
            }
        };

        fetchAssignedProjects();
    }, [user?.role, user?.token]);

    const moveWidget = (id) => {
        setWidgets((prevWidgets) => {
            const widgetToMove = prevWidgets.find((w) => w.id === id);
            const updatedWidgets = prevWidgets.filter((w) => w.id !== id);
            return [...updatedWidgets, widgetToMove];
        });
    };

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "WIDGET",
        drop: (item) => moveWidget(item.id),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    if (!user) {
        return null;
    }

    const displayUsername = user.username || 'User';
    const formattedRole = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown Role';

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <h2 className="sidebar-title">Dashboard</h2>
                <div className="user-info-sidebar">
                    <span className="welcome-text">Welcome,</span>
                    <span className="username-text">{displayUsername}</span>
                    <span className="role-indicator">({formattedRole})</span>
                </div>
                <button
                    className="sidebar-button"
                    onClick={() => navigate("/profile")}
                >
                    Profile
                </button>

                <button
                    className="sidebar-button notification-button"
                    onClick={() => navigate("/notifications")}
                >
                    Notifications
                    {unreadNotificationsCount > 0 && (
                        <span className="badge bg-danger rounded-pill notification-badge">{unreadNotificationsCount}</span>
                    )}
                </button>

                <button
                    className="sidebar-button switch-role-button"
                    onClick={handleSwitchRole}
                >
                    Switch to {user.role === "freelancer" ? "Client Mode" : "Freelancer Mode"}
                </button>

                {user.role === "admin" && (
                    <button
                        className="sidebar-button"
                        onClick={() => navigate("/admin-dashboard")}
                    >
                        Manage Users
                    </button>
                )}
                {user.role === "client" && (
                    <button
                        className="sidebar-button"
                        onClick={() => navigate("/my-projects")}
                    >
                        Manage Projects
                    </button>
                )}
                {user.role === "freelancer" && (
                    <>
                        <button
                            className="sidebar-button"
                            onClick={() => navigate("/projects")}
                        >
                            Find Work
                        </button>
                        {/* NEW: Button for assigned projects in sidebar */}
                        <button
                            className="sidebar-button"
                            onClick={() => navigate("/freelancer-assigned-projects")}
                        >
                            My Assigned Projects
                            {assignedProjects.length > 0 && (
                                <span className="badge bg-primary rounded-pill notification-badge">{assignedProjects.length}</span>
                            )}
                        </button>
                    </>
                )}
                <button
                    className="sidebar-button logout-button"
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                >
                    Logout
                </button>
            </nav>

            <main className="content">
                <div className="dashboard-header">
                    <h1 className="dashboard-heading">
                        {user.role === "freelancer"
                            ? "Project Opportunities & Overview"
                            : user.role === "client"
                                ? "Manage Your Projects"
                                : "Administrator Dashboard"}
                    </h1>
                </div>

                <div className="dashboard-flex" ref={drop}>
                    <div
                        className={`stats-activity-container ${
                            isOver ? "hovering" : ""
                        }`}
                    >
                        {widgets.map((widget) => (
                            <DraggableWidget
                                key={widget.id}
                                id={widget.id}
                                title={widget.title}
                            >
                                {widget.content}
                            </DraggableWidget>
                        ))}
                    </div>
                </div>

                <div className="card-container">
                    {user.role === "client" && (
                        <>
                            <div
                                className="card clickable-card"
                                onClick={() => navigate("/post-project")}
                            >
                                <div className="card-header">
                                    <h2 className="card-title">Post a Project</h2>
                                </div>
                                <div className="card-content card-cta-content"> {/* Added card-cta-content */}
                                    <div className="card-icon-wrapper">
                                        {/* Placeholder for icon - Replace with actual icon component */}
                                        <i className="bi bi-plus-circle card-icon"></i> {/* Example Bootstrap Icon */}
                                    </div>
                                    <p className="card-description">Create a new project & receive freelancer bids.</p>
                                    <span className="card-action-text">Start a New Project <i className="bi bi-arrow-right"></i></span>
                                </div>
                            </div>
                            <div
                                className="card clickable-card"
                                onClick={() => navigate("/my-projects")}
                            >
                                <div className="card-header">
                                    <h2 className="card-title">Manage Project Bids</h2>
                                </div>
                                <div className="card-content card-cta-content"> {/* Added card-cta-content */}
                                    <div className="card-icon-wrapper">
                                        {/* Placeholder for icon - Replace with actual icon component */}
                                        <i className="bi bi-hammer card-icon"></i> {/* Example Bootstrap Icon */}
                                    </div>
                                    <p className="card-description">View, accept, or reject bids on your posted projects.</p>
                                    <span className="card-action-text">View Your Bids <i className="bi bi-arrow-right"></i></span>
                                </div>
                            </div>
                        </>
                    )}

                    {user.role === "freelancer" && (
                        <>
                            <div
                                className="card clickable-card"
                                onClick={() => navigate("/projects")}
                            >
                                <div className="card-header">
                                    <h2 className="card-title">View Projects & Bid</h2>
                                </div>
                                <div className="card-content card-cta-content"> {/* Added card-cta-content */}
                                    <div className="card-icon-wrapper">
                                        {/* Placeholder for icon - Replace with actual icon component */}
                                        <i className="bi bi-search card-icon"></i> {/* Example Bootstrap Icon */}
                                    </div>
                                    <p className="card-description">Browse available projects & start bidding.</p>
                                    <span className="card-action-text">Find New Opportunities <i className="bi bi-arrow-right"></i></span>
                                </div>
                            </div>

                            {/* NEW: Card for Assigned Projects for Freelancers */}
                            <div
                                className="card clickable-card"
                                onClick={() => navigate("/freelancer-assigned-projects")}
                            >
                                <div className="card-header">
                                    <h2 className="card-title">My Assigned Projects</h2>
                                </div>
                                <div className="card-content card-cta-content"> {/* Added card-cta-content */}
                                    <div className="card-icon-wrapper">
                                        {/* Placeholder for icon - Replace with actual icon component */}
                                        <i className="bi bi-list-check card-icon"></i> {/* Example Bootstrap Icon */}
                                    </div>
                                    <p className="card-description">Projects you've been assigned. Upload deliverables here.</p>
                                    {assignedProjects.length > 0 && (
                                        <p className="text-muted card-badge-info mt-2">You have {assignedProjects.length} projects in progress.</p>
                                    )}
                                    <span className="card-action-text">Manage Tasks <i className="bi bi-arrow-right"></i></span>
                                </div>
                            </div>


                            {/* Existing Recent Projects card for Freelancers - renamed title for clarity */}
                            {recentProjects.length > 0 && (
                                <div className="card recent-projects-card">
                                    <div className="card-header">
                                        <h2 className="card-title">Recent Bid Activity</h2> {/* Changed title */}
                                    </div>
                                    <div className="card-content">
                                        <ul className="recent-projects-list">
                                            {recentProjects.map((project) => (
                                                <li
                                                    key={project.id}
                                                    className="project-activity-item"
                                                    onClick={() => navigate(`/project-details/${project.id}`)}
                                                >
                                                    <span className="project-title-link">
                                                        {project.title}
                                                    </span>
                                                    {/* Optional: Add status if your project object has it, e.g., project.myBidStatus */}
                                                    {/* <span className="project-status">Bid: {project.myBidStatus || 'Pending'}</span> */}
                                                </li>
                                            ))}
                                            <li className="view-all-link">
                                                ...{" "}
                                                <button
                                                    onClick={() => navigate("/my-bids")}
                                                    className="view-all-button"
                                                >
                                                    View All Bids
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <NotificationsPanel />
                <FloatingActions />
                <Footer />
            </main>
        </div>
    );
};

export default Dashboard;
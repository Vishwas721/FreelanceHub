import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./ActivityFeed.css";
import { AuthContext } from "./AuthContext"; // Assuming AuthContext is one level up

const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const token = localStorage.getItem("token");
                let apiUrl = "http://localhost:5000/api/activity"; // Fallback

                if (user?.role === "client") {
                    apiUrl = "http://localhost:5000/api/client/activity";
                } else if (user?.role === "freelancer") {
                    apiUrl = "http://localhost:5000/api/freelancer/activity";
                } else if (user?.role === "admin") {
                    apiUrl = "http://localhost:5000/api/admin/activity";
                }

                const response = await axios.get(apiUrl, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setActivities(response.data);
            } catch (error) {
                console.error("Error fetching activity feed:", error);
            }
        };

        fetchActivities();
        const interval = setInterval(fetchActivities, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [user?.role]);

    return (
        <div className="activity-feed">
            <h2>Live Activity Feed</h2>
            <ul>
                {activities.length > 0 ? (
                    activities.map((activity, index) => (
                        <li key={index} className="activity-item">
                            {user?.role === "client" && activity?.freelancer_username ? (
                                `New bid from ${activity.freelancer_username} on your project "${activity.project_title || 'Untitled Project'}"`
                            ) : user?.role === "freelancer" && activity?.title ? (
                                `New project posted: "${activity.title}" - ${activity.description?.substring(0, 50)}...`
                            ) : user?.role === "admin" && activity?.type === 'new_user' ? (
                                `New user registered: ${activity.username} (${activity.email})`
                            ) : user?.role === "admin" && activity?.type === 'new_project' ? (
                                `New project created: "${activity.title}"`
                            ) : (
                                activity?.message || "No activity message"
                            )}
                        </li>
                    ))
                ) : (
                    <p className="no-recent-activity">No recent activity.</p>
                )}
            </ul>
        </div>
    );
};

export default ActivityFeed;
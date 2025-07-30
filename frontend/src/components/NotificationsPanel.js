import { useEffect, useState, useRef, useContext } from "react"; // Add useContext
import axios from "axios";
import Draggable from "react-draggable";
import { AuthContext } from "../AuthContext"; // Import AuthContext
import "./NotificationsPanel.css";

const NotificationsPanel = () => {
    const { user } = useContext(AuthContext); // Get user from AuthContext
    const [notifications, setNotifications] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        // Use user.token from AuthContext for better reactivity
        if (!user?.token) {
            setNotifications([]);
            return;
        }

        const fetchRecentNotifications = async () => {
            try {
                // Change endpoint to /api/notifications/recent
                // Or if you modified the main / endpoint to accept limit:
                // const response = await axios.get("http://localhost:5000/api/notifications?limit=3", {
                const response = await axios.get("http://localhost:5000/api/notifications/recent?limit=3", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setNotifications(response.data); // Backend now sends only the 3 recent
            } catch (error) {
                console.error("Error fetching recent notifications for panel:", error.response?.data?.error || error.message);
                setNotifications([]);
            }
        };

        fetchRecentNotifications();

        // Optional: Set up a polling interval for the panel if you want it to update live
        // This is separate from the AuthContext's unread count polling
        const interval = setInterval(fetchRecentNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval); // Cleanup on unmount

    }, [user?.token]); // Dependency on user.token to re-fetch when user logs in/out

    return (
        <>
            <button
                className="notification-toggle"
                onClick={() => setShowPanel(!showPanel)}
                aria-label="Toggle Notifications"
            >
                🔔
            </button>

            {showPanel && (
                <Draggable nodeRef={panelRef}>
                    <div ref={panelRef} className="notifications-panel">
                        <h3>Recent Notifications</h3>
                        {notifications.length === 0 ? (
                            <p className="no-notifications">No recent notifications</p>
                        ) : (
                            <ul>
                                {notifications.map((notif) => (
                                    <li key={notif.id} className={notif.is_read ? 'read' : 'unread'}>
                                        {notif.message}
                                        {/* Optional: Add a timestamp or type */}
                                        <span className="timestamp">{new Date(notif.created_at).toLocaleTimeString()}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Draggable>
            )}
        </>
    );
};

export default NotificationsPanel;
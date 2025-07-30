import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import './NotificationsPage.css'; // This will now use the new CSS

const NotificationsPage = () => {
    const { user, fetchUnreadNotificationsCount } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedNotifications, setSelectedNotifications] = useState(new Set()); // For batch marking as read

    const fetchAllNotifications = useCallback(async () => {
        if (!user?.token) {
            setLoading(false);
            setError("User not authenticated.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setNotifications(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching all notifications:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || "Failed to load notifications.");
            setLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchAllNotifications();
    }, [fetchAllNotifications]);

    // Handle marking notifications as read
    const handleMarkAsRead = async (idsToMark) => {
        if (!user?.token || idsToMark.length === 0) return;

        try {
            await axios.post('http://localhost:5000/api/notifications/mark-as-read',
                { notificationIds: idsToMark },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            // Refresh list and count after marking as read
            fetchAllNotifications();
            fetchUnreadNotificationsCount(); // Update the count in AuthContext
            setSelectedNotifications(new Set()); // Clear selections
        } catch (err) {
            console.error("Error marking notifications as read:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || "Failed to mark notifications as read.");
        }
    };

    // Toggle selection for batch read
    const toggleSelectNotification = (notificationId) => {
        setSelectedNotifications(prev => {
            const newSet = new Set(prev);
            if (newSet.has(notificationId)) {
                newSet.delete(notificationId);
            } else {
                newSet.add(notificationId);
            }
            return newSet;
        });
    };

    if (loading) return <div className="notifications-page">Loading notifications...</div>;
    if (error) return <div className="notifications-page error-message">Error: {error}</div>;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="notifications-page">
            <header className="notifications-header">
                <h2>Your Notifications ({unreadCount} unread)</h2>
                <div className="header-buttons"> {/* Added a div to group buttons */}
                    {selectedNotifications.size > 0 && (
                        <button
                            className="mark-selected-read-button"
                            onClick={() => handleMarkAsRead(Array.from(selectedNotifications))}
                        >
                            Mark Selected as Read ({selectedNotifications.size})
                        </button>
                    )}
                    {unreadCount > 0 && selectedNotifications.size === 0 && (
                        <button
                            className="mark-all-read-button"
                            onClick={() => handleMarkAsRead(notifications.filter(n => !n.is_read).map(n => n.id))}
                        >
                            Mark All Unread as Read
                        </button>
                    )}
                </div>
            </header>

            <ul className="notifications-list">
                {notifications.length === 0 ? (
                    <li className="no-notifications">No notifications to display.</li>
                ) : (
                    notifications.map(notification => (
                        <li
                            key={notification.id}
                            className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedNotifications.has(notification.id)}
                                onChange={() => toggleSelectNotification(notification.id)}
                                className="notification-checkbox"
                            />
                            <div className="notification-content">
                                <p className="notification-message">{notification.message}</p>
                                <span className="notification-timestamp">
                                    {new Date(notification.created_at).toLocaleString()}
                                </span>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default NotificationsPage;
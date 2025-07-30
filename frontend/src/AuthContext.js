import { createContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Will store { token, role, username, userId }
    const [isLoading, setIsLoading] = useState(true); // New loading state
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const pollingIntervalRef = useRef(null); // To store the interval ID for notification polling

    // Initialize user from localStorage on mount
    useEffect(() => {
        const storedUserJSON = localStorage.getItem("user");
        if (storedUserJSON) {
            try {
                const parsedUser = JSON.parse(storedUserJSON);
                // Basic validation for the parsed user object
                if (parsedUser.token && parsedUser.role && parsedUser.username && parsedUser.userId !== undefined) {
                    setUser(parsedUser);
                } else {
                    console.warn("AuthContext: Incomplete or invalid user data in localStorage, clearing.");
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    setUser(null); // Explicitly set user to null
                }
            } catch (e) {
                console.error("AuthContext: Error parsing user from localStorage, clearing.", e);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                setUser(null); // Explicitly set user to null
            }
        }
        setIsLoading(false); // Set loading to false after attempting to load from localStorage
    }, []);

    // Function to fetch unread notification count
    const fetchUnreadNotificationsCount = useCallback(async () => {
        if (!user?.token) {
            setUnreadNotificationsCount(0);
            return;
        }
        try {
            const response = await axios.get('http://localhost:5000/api/notifications/unread-count', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setUnreadNotificationsCount(response.data.count);
        } catch (error) {
            console.error("AuthContext: Error fetching unread notification count:", error.response?.data?.error || error.message);
            setUnreadNotificationsCount(0); // Reset on error
            // If the error is 401/403, it might mean the token is invalid/expired.
            // Consider logging out the user if this happens consistently or is a 401.
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log("AuthContext: Token invalid/expired during notification fetch, logging out.");
                // logout(); // Uncomment this line if you want to automatically log out on token issues
            }
        }
    }, [user?.token]); // Dependency on user.token ensures it runs when token changes

    // Set up polling for notifications
    useEffect(() => {
        // Clear any existing interval to prevent duplicates
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }

        if (user?.token) {
            // Fetch immediately upon login/load
            fetchUnreadNotificationsCount();

            // Then set up interval for polling (e.g., every 10 seconds)
            pollingIntervalRef.current = setInterval(() => {
                fetchUnreadNotificationsCount();
            }, 10000); // Poll every 10 seconds (10000 ms)
        } else {
            // If no user/token, clear interval and reset count
            setUnreadNotificationsCount(0);
        }

        // Cleanup function: Clear interval when component unmounts or dependencies change
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [user?.token, fetchUnreadNotificationsCount]); // Re-run when user.token changes

    // Login function now expects an object with full user data
    const login = useCallback((userData) => { // userData should be { token, role, username, userId }
        if (!userData || !userData.token || !userData.role || !userData.username || userData.userId === undefined) {
            console.error("AuthContext: login() received invalid userData. Missing token, role, username, or userId!");
            return;
        }
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData)); // Store full user object
        // Keeping token/role separate for backward compatibility if other parts of code still rely on them directly
        // You can consider removing these if your app strictly uses the 'user' object from localStorage.
        localStorage.setItem("token", userData.token);
        localStorage.setItem("role", userData.role);

        // Immediately fetch notifications after login
        fetchUnreadNotificationsCount();
    }, [fetchUnreadNotificationsCount]);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUnreadNotificationsCount(0); // Reset count on logout

        // Clear polling interval on logout
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    const switchRole = useCallback(async (newRole) => {
        // Ensure user and userId are present before attempting to switch role
        if (!user || !user.token || user.userId === undefined) {
            console.error("AuthContext: User not authenticated or userId missing for role switch.");
            return; // This might be a reason for early exit
        }

        try {
            console.log(`AuthContext: Attempting to switch role for userId: ${user.userId} to new role: ${newRole}`);
            const response = await axios.post(
                "http://localhost:5000/api/auth/switch-role",
                { userId: user.userId, newRole: newRole }, // Pass userId from user state
                {
                    headers: { Authorization: `Bearer ${user.token}` }, // Send current token for authorization
                }
            );

            // Assuming backend sends updated token, new role, and potentially updated username/userId
            const updatedUserData = {
                token: response.data.token,
                role: response.data.newRole,
                username: response.data.username || user.username, // Fallback to current username if backend doesn't send
                userId: response.data.userId || user.userId // Fallback to current userId if backend doesn't send
            };

            console.log("AuthContext: Role switch successful. Updated user data:", updatedUserData);
            setUser(updatedUserData);
            localStorage.setItem('user', JSON.stringify(updatedUserData));
            localStorage.setItem("token", updatedUserData.token); // Update token in localStorage
            localStorage.setItem("role", updatedUserData.role);   // Update role in localStorage

            // Re-fetch notifications after role switch (relevant notifications might change)
            fetchUnreadNotificationsCount();
        } catch (error) {
            console.error("AuthContext: Error switching role:", error.response?.data?.error || error.message);
            // Optionally, revert the UI state or show an error message
        }
    }, [user, fetchUnreadNotificationsCount]);// Depend on 'user' to ensure latest user data is used

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole, unreadNotificationsCount, fetchUnreadNotificationsCount }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
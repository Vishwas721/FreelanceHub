import React from "react";
import "./Header.css"; // Create Header.css
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

const Header = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Or wherever your login route is
    };

    return (
        <header className="main-header">
            <div className="logo">FreelanceHub</div> {/* This text will be styled */}
            <nav className="main-nav">
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/projects">Projects</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><button onClick={handleLogout}>Logout</button></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
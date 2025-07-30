import React from "react";
import "./Footer.css"; // Create Footer.css
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="copyright">
                {/* Unicode copyright symbol will be added via CSS ::before */}
                {new Date().getFullYear()} FreelanceHub
            </div>
            <nav className="footer-nav">
                <ul>
                    <li><Link to="/privacy">Privacy Policy</Link></li>
                    <li><Link to="/terms">Terms of Service</Link></li>
                    <li><Link to="/contact">Contact Us</Link></li>
                </ul>
            </nav>
        </footer>
    );
};

export default Footer;
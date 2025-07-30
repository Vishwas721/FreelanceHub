import React from 'react';
import './Footer.css';
// Font Awesome is already globally imported in HomePage.js
// import '@fortawesome/fontawesome-free/css/all.min.css'; 

const Footer = () => {
    return (
        <footer className="footer-section py-5"> {/* Renamed */}
            <div className="container">
                <div className="row gy-4">
                    <div className="col-md-4 text-center text-md-start">
                        <h4 className="footer-brand mb-3">FreelanceHub</h4>
                        <p className="footer-description">Your trusted platform to connect top-tier freelancers with clients worldwide, ensuring quality and innovation.</p>
                    </div>
                    <div className="col-md-4 text-center">
                        <h5 className="mb-3">Quick Links</h5>
                        <ul className="list-unstyled footer-links">
                            <li><a href="/about-us" className="footer-link">About Us</a></li>
                            <li><a href="#services" className="footer-link">Services</a></li>
                            
                            <li><a href="#contact" className="footer-link">Contact</a></li>
                            <li><a href="/privacy" className="footer-link">Privacy Policy</a></li>
                            <li><a href="/terms" className="footer-link">Terms of Service</a></li> {/* Added new link */}
                        </ul>
                    </div>
                    <div className="col-md-4 text-center text-md-end">
                        <h5 className="mb-3">Connect With Us</h5>
                        <div className="social-icons-group">
                            <a href="https://facebook.com" target="_blank" aria-label="Facebook" rel="noopener noreferrer" className="social-icon-link me-3">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="https://twitter.com" target="_blank" aria-label="Twitter" rel="noopener noreferrer" className="social-icon-link me-3">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="https://linkedin.com" target="_blank" aria-label="LinkedIn" rel="noopener noreferrer" className="social-icon-link me-3">
                                <i className="fab fa-linkedin-in"></i>
                            </a>
                            <a href="https://instagram.com" target="_blank" aria-label="Instagram" rel="noopener noreferrer" className="social-icon-link">
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <hr className="footer-divider my-4" />
                <div className="text-center small footer-copyright">
                    &copy; {new Date().getFullYear()} FreelanceHub. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
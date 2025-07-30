import React from 'react';
import './Navbar.css'; // Component-specific CSS


const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm freelancehub-navbar">
            <div className="container">
                <a className="navbar-brand fw-bold" href="#">FreelanceHub</a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                    aria-controls="navbarContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item"><a className="nav-link active" aria-current="page" href="#home">Home</a></li>
                        <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
                        <li className="nav-item"><a className="nav-link" href="#projects">Projects</a></li> {/* Added link for projects */}
                        <li className="nav-item"><a className="nav-link" href="#testimonials">Testimonials</a></li> {/* Added link for testimonials */}
                        <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
                    </ul>
                    <div className="d-flex gap-2">
                        <a href="/register" className="btn btn-outline-primary nav-btn-signup">Sign Up</a>
                        <a href="/login" className="btn btn-primary nav-btn-signin">Sign In</a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
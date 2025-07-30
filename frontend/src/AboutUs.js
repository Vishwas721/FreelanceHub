import React from 'react';
import './AboutUs.css';
const AboutUs = () => {
    return (
        <div className="about-us-container">
            <div className="about-us-header">
                <h1>About FreelanceHub</h1>
            </div>
            <div className="about-us-content">
                <div className="about-us-section">
                    <h2>Our Mission</h2>
                    <p>
                        FreelanceHub is a platform connecting freelancers with clients seeking
                        their expertise. Our mission is to provide a seamless and efficient
                        way for businesses to find top talent and for freelancers to discover
                        exciting opportunities.
                    </p>
                </div>
                <div className="about-us-section">
                    <h2>Our Vision</h2>
                    <p>
                        To be the leading freelance marketplace, empowering individuals and
                        businesses to achieve their goals through collaboration and innovation.
                    </p>
                </div>
                <div className="about-us-section">
                    <h2>What We Offer</h2>
                    <ul>
                        <li>A wide range of freelance services</li>
                        <li>Secure payment processing</li>
                        <li>A user-friendly interface</li>
                        <li>Dedicated support</li>
                    </ul>
                </div>
                <div className="about-us-section">
                    <h2>Our Team</h2>
                    <p>
                        We are a team of passionate individuals dedicated to making
                        FreelanceHub the best platform for freelancers and clients alike.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
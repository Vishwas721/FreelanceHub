import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
    return (
        <section className="how-it-works-section bg-gradient-primary py-5"> {/* Using a gradient background */}
            <div className="container">
                <div className="section-header text-center mb-5">
                    <h2 className="section-title text-white">How It Works</h2> {/* White title on dark background */}
                    <p className="section-subtitle text-white-75">Get your project done in just 3 simple steps</p> {/* Lighter subtitle */}
                </div>
                <div className="row g-4 justify-content-center">
                    <div className="col-md-4">
                        <div className="work-step card-hover-effect">
                            <div className="step-icon mb-3">
                                <i className="fas fa-bullhorn"></i> {/* Icon for posting */}
                            </div>
                            <h3 className="h5 mb-2">Post Your Project</h3>
                            <p className="text-muted">Describe what you need and set your budget.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="work-step card-hover-effect">
                            <div className="step-icon mb-3">
                                <i className="fas fa-comments"></i> {/* Icon for proposals */}
                            </div>
                            <h3 className="h5 mb-2">Receive Proposals</h3>
                            <p className="text-muted">Get bids from qualified freelancers.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="work-step card-hover-effect">
                            <div className="step-icon mb-3">
                                <i className="fas fa-handshake"></i> {/* Icon for collaboration */}
                            </div>
                            <h3 className="h5 mb-2">Choose & Collaborate</h3>
                            <p className="text-muted">Select the best fit and start working.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
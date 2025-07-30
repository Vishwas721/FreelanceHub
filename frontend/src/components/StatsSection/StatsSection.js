import React from 'react';
import './StatsSection.css';

const StatsSection = () => {
    return (
        <section className="stats-section bg-gradient-primary text-white py-5"> {/* Use primary gradient */}
            <div className="container">
                <div className="row text-center g-4">
                    <div className="col-md-3 col-6">
                        <div className="stats-item">
                            <i className="fas fa-check-circle stats-icon mb-3"></i> {/* Icon */}
                            <h3 className="display-4 fw-bold mb-1">10K+</h3> {/* Slightly smaller display for numbers */}
                            <p className="mb-0">Projects Completed</p>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="stats-item">
                            <i className="fas fa-users stats-icon mb-3"></i> {/* Icon */}
                            <h3 className="display-4 fw-bold mb-1">5K+</h3>
                            <p className="mb-0">Freelancers</p>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="stats-item">
                            <i className="fas fa-handshake stats-icon mb-3"></i> {/* Icon */}
                            <h3 className="display-4 fw-bold mb-1">8K+</h3>
                            <p className="mb-0">Clients Served</p>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="stats-item">
                            <i className="fas fa-star stats-icon mb-3"></i> {/* Icon */}
                            <h3 className="display-4 fw-bold mb-1">99%</h3>
                            <p className="mb-0">Satisfaction Rate</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
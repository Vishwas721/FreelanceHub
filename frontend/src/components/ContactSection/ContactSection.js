import React from 'react';
import './ContactSection.css';

const ContactSection = () => {
    return (
        <section className="contact-section py-5" id="contact"> {/* Renamed and added ID */}
            <div className="container">
                <div className="section-header text-center mb-5">
                    <h2 className="section-title">Contact Us</h2>
                    <p className="section-subtitle text-muted">We’d love to hear from you</p>
                </div>
                <form className="contact-form mx-auto" style={{ maxWidth: '700px' }}> {/* Slightly wider form */}
                    <div className="mb-4"> {/* Increased margin bottom */}
                        <label htmlFor="name" className="form-label">Name</label>
                        <input type="text" className="form-control" id="name" placeholder="Your full name" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" className="form-control" id="email" placeholder="your.email@example.com" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="message" className="form-label">Message</label>
                        <textarea className="form-control" id="message" rows="6" placeholder="Tell us about your needs..." required></textarea> {/* More rows for message */}
                    </div>
                    <button type="submit" className="btn btn-primary w-100 contact-submit-btn">Send Message</button>
                </form>
            </div>
        </section>
    );
};

export default ContactSection;
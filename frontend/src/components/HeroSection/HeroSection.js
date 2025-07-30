import React, { useState } from 'react'; // Import useState
import './HeroSection.css';
import 'animate.css';

const HeroSection = ({ onSearch }) => { // Accept onSearch prop
    const [searchQuery, setSearchQuery] = useState(''); // State to hold the search input

    const handleSearchSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission behavior (page reload)
        if (searchQuery.trim()) { // Ensure query is not just whitespace
            onSearch(searchQuery); // Pass the query to the parent component's search handler
        }
    };

    return (
        <section className="hero-section video-hero" id="home">
            <video className="hero-video" autoPlay muted loop playsInline>
                <source src="/Vid.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className="hero-overlay"></div>

            <div className="container hero-content">
                <h1 className="hero-title animate__animated animate__fadeInUp">
                    Find Your Perfect Freelancer
                </h1>
                <p className="hero-subtitle animate__animated animate__fadeInUp animate__delay-1s">
                    Search from thousands of vetted professionals ready to help you.
                </p>
                <div className="search-container animate__animated animate__fadeInUp animate__delay-2s">
                    <form className="input-group hero-search-form" onSubmit={handleSearchSubmit}> {/* Add onSubmit */}
                        <input
                            type="text"
                            className="form-control hero-search-input"
                            placeholder="Search for freelancers, skills, or projects..."
                            name="search"
                            aria-label="Search"
                            required
                            value={searchQuery} // Bind input value to state
                            onChange={(e) => setSearchQuery(e.target.value)} // Update state on change
                        />
                        <button type="submit" className="btn btn-search-hero">
                            <i className="fas fa-search me-2"></i>Search
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
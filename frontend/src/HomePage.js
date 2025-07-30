import React, { useState, useRef } from 'react'; // Import useState and useRef
import './HomePage.css'; // Global styles for the page
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Global Font Awesome import

// Import individual components
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import PopularServices from './components/PopularServices/PopularServices';
import HowItWorks from './components/HowItWorks/HowItWorks';
import StatsSection from './components/StatsSection/StatsSection';
import TestimonialsSection from './components/TestimonialsSection/TestimonialsSection';
import CallToAction from './components/CallToAction/CallToAction';
import ContactSection from './components/ContactSection/ContactSection';
import Footer from './components/Footer/Footer';

const HomePage = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const searchResultsRef = useRef(null); // Create a ref for the search results section

    const handleSearch = async (query) => {
        setLoading(true);
        setError(null);
        setSearchResults([]); // Clear previous results
        setSearchPerformed(true); // Mark that a search has been initiated

        try {
            const response = await fetch(`http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Server error'}`);
            }
            const data = await response.json();
            setSearchResults(data);

            // Scroll to results section only if results are found or search was performed
            if (searchResultsRef.current) {
                searchResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

        } catch (err) {
            console.error("Error fetching search results:", err);
            setError(`Failed to fetch search results: ${err.message}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <HeroSection onSearch={handleSearch} /> {/* Pass the handleSearch function */}
            <PopularServices />
            <HowItWorks />
            <TestimonialsSection />
            <StatsSection />
            
            {/* Display Search Results Section */}
            {/* Attach the ref to this div */}
            <div className="search-results-section container my-5" ref={searchResultsRef}> 
                {loading && (
                    <div className="text-center my-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Searching for freelancers...</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger text-center my-4" role="alert">
                        {error}
                    </div>
                )}

                {!loading && !error && searchPerformed && searchResults.length === 0 && (
                    <div className="alert alert-info text-center my-4" role="alert">
                        No freelancers found matching your search.
                    </div>
                )}

                {!loading && !error && searchResults.length > 0 && (
                    <div className="search-results-display">
                        <h3 className="text-center mb-4">Available Freelancers</h3>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                            {searchResults.map(user => (
                                <div className="col" key={user.id}>
                                    <div className="card h-100 shadow-sm rounded-3">
                                        <div className="card-body">
                                            <h5 className="card-title text-primary">{user.username}</h5>
                                            <p className="card-text mb-1"><strong>Role:</strong> {user.role}</p>
                                            {user.email && <p className="card-text mb-1"><strong>Email:</strong> {user.email}</p>}
                                            {user.location && <p className="card-text mb-1"><strong>Location:</strong> {user.location}</p>}
                                            {user.skills && <p className="card-text mb-1"><strong>Skills:</strong> {user.skills}</p>}
                                            {user.hourly_rate && <p className="card-text mb-1"><strong>Hourly Rate:</strong> ${user.hourly_rate}</p>}
                                            {user.bio && <p className="card-text text-muted mt-2">{user.bio.substring(0, 100)}...</p>}
                                            {/* Removed the "View Profile" link as per request */}
                                            {/* <a href={`/profile/${user.id}`} className="btn btn-outline-primary btn-sm mt-3">View Profile</a> */}
                                        </div>
                                        <div className="card-footer bg-light border-0">
                                            <small className="text-muted">
                                                Rating: {typeof user.rating === 'number' ? user.rating.toFixed(1) : 'N/A'}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <CallToAction />
            <ContactSection />
            <Footer />
        </>
    );
};

export default HomePage;

import React from 'react';
import './TestimonialsSection.css';

const testimonialsData = [
    {
        text: "FreelanceHub connected us with the perfect designer. The process was smooth, communication was excellent, and the quality outstanding. A truly invaluable service!",
        author: "Tanveer Pasha S.",
        title: "Founder, Creative Agency"
    },
    {
        text: "This platform is a game-changer! I've found talented freelancers for multiple projects, from web development to content creation. Highly recommend for any project size.",
        author: "Vinod Kumar Y.",
        title: "CEO, Tech Startup"
    },
    {
        text: "Our go-to freelance marketplace for all marketing campaigns. The professionalism and efficiency of the freelancers here are unmatched. The communication is always clear and results are delivered on time.",
        author: "Sujan B.K.",
        title: "Marketing Director"
    },
    {
        text: "As a freelancer, FreelanceHub has opened up so many opportunities. The tools are intuitive, and I love the steady stream of high-quality projects. Highly satisfied!",
        author: "Diwakar.",
        title: "Lead Web Developer"
    },
    {
        text: "Finding specialized talent used to be a headache. FreelanceHub makes it effortless. We've scaled our team with experts we wouldn't have found otherwise.",
        author: "Nachiketha.",
        title: "Head of Product"
    },
];

const TestimonialsSection = () => {
    return (
        <section className="testimonials-section bg-light" id="testimonials">
            <div className="container">
                <div className="section-header text-center mb-5">
                    <h2 className="section-title">What Our Clients Say</h2>
                    <p className="section-subtitle text-muted">Trusted by businesses and freelancers worldwide</p>
                </div>
                <div className="row g-4 justify-content-center">
                    {testimonialsData.map((testimonial, index) => (
                        <div className="col-lg-4 col-md-6" key={index}>
                            <div className="testimonial-card card-hover-effect">
                                <div className="testimonial-quote-icon mb-3">
                                    <i className="fas fa-quote-left"></i> {/* Quote icon */}
                                </div>
                                <p className="testimonial-text">
                                    "{testimonial.text}"
                                </p>
                                <div className="testimonial-author-info mt-auto"> {/* Push to bottom */}
                                    <h5 className="testimonial-author mb-0">- {testimonial.author}</h5>
                                    <p className="testimonial-title text-muted small mb-0">{testimonial.title}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
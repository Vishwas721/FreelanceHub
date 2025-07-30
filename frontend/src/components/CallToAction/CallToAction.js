import React from 'react';
import './CallToAction.css';

const CallToAction = () => {
    return (
        <section className="cta-section">
            <div className="cta-container">
                <div className="cta-logo">
                  
                </div>
                <h2 className="cta-title">
                    Instant results. <br />Top talent.
                </h2>
                <p className="cta-description">
                    Get what you need faster from freelancers who trained their own personal <b>AI Creation Models</b>.
                    Now you can browse, prompt, and generate instantly. And if you need a tweak or change, the freelancer is always there to help you perfect it.
                </p>
                <a
                    href="/go/hub/explore"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary cta-btn"
                >
                    Get started
                </a>
                <div className="cta-video-container">
                    <video
                        className="cta-video"
                        src="https://fiverr-res.cloudinary.com/video/upload/v1/video-attachments/generic_asset/asset/f4b1924c68e6916c6d100527c7ff3d9c-1743494584325/Image%20model"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                </div>
            </div>
        </section>
    );
};

export default CallToAction;

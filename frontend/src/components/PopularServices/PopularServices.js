import React, { useState, useRef } from 'react';
import './PopularServices.css';

const serviceCategories = [
    {
        title: "Website Development",
        link: "/categories/programming-tech/website-development",
        imgSrcBase: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156477/website-development.png",
        imgSrcSmall: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156477/website-development.png",
        imgSrcSmall2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156477/website-development.png",
        imgSrcLarge2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156477/website-development.png",
        alt: "Website Development"
    },
    {
        title: "Video Editing",
        link: "/categories/video-animation/video-editing",
        imgSrcBase: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156494/video-editing.png",
        imgSrcSmall: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156494/video-editing.png",
        imgSrcSmall2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156494/video-editing.png",
        imgSrcLarge2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156494/video-editing.png",
        alt: "Video Editing"
    },
    {
        title: "Software Development",
        link: "/categories/programming-tech/software-development",
        imgSrcBase: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156476/software-development.png",
        imgSrcSmall: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156476/software-development.png",
        imgSrcSmall2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156476/software-development.png",
        imgSrcLarge2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156476/software-development.png",
        alt: "Software Development"
    },
    {
        title: "SEO",
        link: "/categories/online-marketing/seo-services",
        imgSrcBase: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156488/seo.png",
        imgSrcSmall: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156488/seo.png",
        imgSrcSmall2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156488/seo.png",
        imgSrcLarge2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156488/seo.png",
        alt: "SEO"
    },
    {
        title: "Architecture & Interior Design",
        link: "/categories/graphics-design/architectural-design-services",
        imgSrcBase: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156473/architecture-design.png",
        imgSrcSmall: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156473/architecture-design.png",
        imgSrcSmall2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156473/architecture-design.png",
        imgSrcLarge2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156473/architecture-design.png",
        alt: "Architecture & Interior Design"
    },
    {
        title: "Book Design",
        link: "/categories/graphics-design/book-design",
        imgSrcBase: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_1.0/v1/attachments/generic_asset/asset/af48c6702af221956ea7adf0055854e6-1745826082297/Book%20Design.png",
        imgSrcSmall: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_1.0/v1/attachments/generic_asset/asset/af48c6702af221956ea7adf0055854e6-1745826082297/Book%20Design.png",
        imgSrcSmall2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_2.0/v1/attachments/generic_asset/asset/af48c6702af221956ea7adf0055854e6-1745826082297/Book%20Design.png",
        imgSrcLarge2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_2.0/v1/attachments/generic_asset/asset/af48c6702af221956ea7adf0055854e6-1745826082297/Book%20Design.png",
        alt: "Book Design"
    },
    {
        title: "UGC Videos",
        link: "/categories/video-animation/ugc-videos",
        imgSrcBase: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_1.0/v1/attachments/generic_asset/asset/ece24f7f595e2dd44b26567705d1c600-1728279781879/UGC%20Video%20img.png",
        imgSrcSmall: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_1.0/v1/attachments/generic_asset/asset/ece24f7f595e2dd44b26567705d1c600-1728279781879/UGC%20Video%20img.png",
        imgSrcSmall2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_2.0/v1/attachments/generic_asset/asset/ece24f7f595e2dd44b26567705d1c600-1728279781879/UGC%20Video%20img.png",
        imgSrcLarge2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_2.0/v1/attachments/generic_asset/asset/ece24f7f595e2dd44b26567705d1c600-1728279781879/UGC%20Video%20img.png",
        alt: "UGC Videos"
    },
    {
        title: "Voice Over",
        link: "/categories/music-audio/voice-overs",
        imgSrcBase: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156479/voice-over.png",
        imgSrcSmall: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156479/voice-over.png",
        imgSrcSmall2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156479/voice-over.png",
        imgSrcLarge2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156479/voice-over.png",
        alt: "Voice Over"
    },
    {
        title: "Social Media Marketing",
        link: "/categories/online-marketing/social-marketing",
        imgSrcBase: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156476/social-media-marketing.png",
        imgSrcSmall: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156476/social-media-marketing.png",
        imgSrcSmall2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156476/social-media-marketing.png",
        imgSrcLarge2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156476/social-media-marketing.png",
        alt: "Social Media Marketing"
    },
    {
        title: "AI Development",
        link: "/categories/programming-tech/ai-coding",
        imgSrcBase: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_1.0/v1/attachments/generic_asset/asset/4d23a927c9a0acf93aac6642714de09f-1745826013295/AI%20Development.png",
        imgSrcSmall: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_1.0/v1/attachments/generic_asset/asset/4d23a927c9a0acf93aac6642714de09f-1745826013295/AI%20Development.png",
        imgSrcSmall2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_2.0/v1/attachments/generic_asset/asset/4d23a927c9a0acf93aac6642714de09f-1745826013295/AI%20Development.png",
        imgSrcLarge2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_2.0/v1/attachments/generic_asset/asset/4d23a927c9a0acf93aac6642714de09f-1745826013295/AI%20Development.png",
        alt: "AI Development"
    },
    {
        title: "Logo Design",
        link: "/categories/graphics-design/creative-logo-design",
        imgSrcBase: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156494/logo-design.png",
        imgSrcSmall: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_1.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156494/logo-design.png",
        imgSrcSmall2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156494/logo-design.png",
        imgSrcLarge2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_2.0/v1/attachments/generic_asset/asset/798403f5b92b1b5af997acc704a3d21c-1702465156494/logo-design.png",
        alt: "Logo Design"
    },
    {
        title: "Website Design",
        link: "/categories/graphics-design/website-design",
        imgSrcBase: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_1.0/v1/attachments/generic_asset/asset/9d03d60a4fbbbed75ac139f57819ab74-1745826123751/Website%20Design.png",
        imgSrcSmall: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_1.0/v1/attachments/generic_asset/asset/9d03d60a4fbbbed75ac139f57819ab74-1745826123751/Website%20Design.png",
        imgSrcSmall2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_130,dpr_2.0/v1/attachments/generic_asset/asset/9d03d60a4fbbbed75ac139f57819ab74-1745826123751/Website%20Design.png",
        imgSrcLarge2x: "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_188,dpr_2.0/v1/attachments/generic_asset/asset/9d03d60a4fbbbed75ac139f57819ab74-1745826123751/Website%20Design.png",
        alt: "Website Design"
    },
];

const PopularServices = () => {
    const slidesTrackRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const scroll = (direction) => {
        if (slidesTrackRef.current) {
            const firstSlide = slidesTrackRef.current.children[0];
            const slideMarginRight = firstSlide ? parseFloat(getComputedStyle(firstSlide).marginRight) : 0;

            const slideWidth = firstSlide ? (firstSlide.offsetWidth + slideMarginRight) : 0;
            if (slideWidth === 0) return;

            const slidesWrapperWidth = slidesTrackRef.current.parentElement.offsetWidth;
            const visibleSlides = Math.floor(slidesWrapperWidth / slideWidth);

            let newIndex = currentIndex;
            if (direction === 'left') {
                newIndex = Math.max(0, currentIndex - visibleSlides);
            } else {
                newIndex = Math.min(serviceCategories.length - visibleSlides, currentIndex + visibleSlides);
            }
            setCurrentIndex(newIndex);
            slidesTrackRef.current.style.transform = `translateX(-${newIndex * slideWidth}px)`;
        }
    };

    return (
        <section className="popular-services-section" id="services">
            <h2 className="section-title">Popular Services</h2>
            <div className="carousel-container-custom"> {/* Changed to carousel-container-custom */}
                <button className="arrow-btn left-arrow" aria-label="Previous slide" onClick={() => scroll('left')}>
                    <svg width="8" height="15" viewBox="0 0 8 15" xmlns="http://www.w3.org/2000/svg"><path d="M7.2279 0.690653L7.84662 1.30934C7.99306 1.45578 7.99306 1.69322 7.84662 1.83968L2.19978 7.5L7.84662 13.1603C7.99306 13.3067 7.99306 13.5442 7.84662 13.6907L7.2279 14.3094C7.08147 14.4558 6.84403 14.4558 6.69756 14.3094L0.153374 7.76518C0.00693607 7.61875 0.00693607 7.38131 0.153374 7.23484L6.69756 0.690653C6.84403 0.544184 7.08147 0.544184 7.2279 0.690653Z"></path></svg>
                </button>
                <div className="slides-wrapper">
                    <div className="slides-track" ref={slidesTrackRef}>
                        {serviceCategories.map((service, index) => (
                            <div className="slide" key={index}>
                                <a href={service.link} className="service-card">
                                    <h3 className="service-title">{service.title}</h3>
                                    <picture>
                                        <source media="(max-width: 899px)" srcSet={`${service.imgSrcSmall} 1x, ${service.imgSrcSmall2x} 2x`} />
                                        <source media="(min-width: 900px)" srcSet={`${service.imgSrcBase} 1x, ${service.imgSrcLarge2x} 2x`} />
                                        <img className="service-image" alt={service.alt} src={service.imgSrcBase} />
                                    </picture>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="arrow-btn right-arrow" aria-label="Next slide" onClick={() => scroll('right')}>
                    <svg width="8" height="16" viewBox="0 0 8 16" xmlns="http://www.w3.org/2000/svg"><path d="M0.772126 1.19065L0.153407 1.80934C0.00696973 1.95578 0.00696973 2.19322 0.153407 2.33969L5.80025 8L0.153407 13.6603C0.00696973 13.8067 0.00696973 14.0442 0.153407 14.1907L0.772126 14.8094C0.918563 14.9558 1.156 14.9558 1.30247 14.8094L7.84666 8.26519C7.99309 8.11875 7.99309 7.88131 7.84666 7.73484L1.30247 1.19065C1.156 1.04419 0.918563 1.04419 0.772126 1.19065Z"></path></svg>
                </button>
            </div>
        </section>
    );
};

export default PopularServices;
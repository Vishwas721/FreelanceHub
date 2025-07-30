// src/pages/PrivacyPolicyPage.js
import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './LegalPages.module.css'; // Reusing a common CSS module for legal pages

const PrivacyPolicyPage = () => {
    return (
        <div className={styles.pageContainer}>
            <Header />
            <main className={styles.mainContent}>
                <div className={styles.legalCard}>
                    <h1 className={styles.title}>Privacy Policy</h1>
                    <p className={styles.lastUpdated}>Last Updated: May 24, 2025</p>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Introduction</h2>
                        <p className={styles.paragraph}>
                            Welcome to FreelanceHub! We are committed to protecting your privacy and handling your data in an open and transparent manner. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                        </p>
                        <p className={styles.paragraph}>
                            Please read this Privacy Policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Information We Collect</h2>
                        <h3 className={styles.subSectionTitle}>Personal Data:</h3>
                        <p className={styles.paragraph}>
                            We collect personally identifiable information, such as your name, email address, phone number, and demographic information (like age or gender), that you voluntarily give to us when you register for an account, create a profile, post a project, submit a bid, or communicate with us.
                        </p>
                        <h3 className={styles.subSectionTitle}>Derivative Data:</h3>
                        <p className={styles.paragraph}>
                            Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
                        </p>
                        <h3 className={styles.subSectionTitle}>Financial Data:</h3>
                        <p className={styles.paragraph}>
                            Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor, [e.g., Stripe, PayPal], and you are encouraged to review their privacy policy and contact them directly for responses to your questions.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. How We Use Your Information</h2>
                        <p className={styles.paragraph}>
                            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                        </p>
                        <ul className={styles.list}>
                            <li>Create and manage your account.</li>
                            <li>Enable user-to-user communications.</li>
                            <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                            <li>Notify you of updates to the Site.</li>
                            <li>Offer new products, services, and/or recommendations to you.</li>
                            <li>Perform other business activities as needed.</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>4. Disclosure of Your Information</h2>
                        <p className={styles.paragraph}>
                            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                        </p>
                        <h3 className={styles.subSectionTitle}>By Law or to Protect Rights:</h3>
                        <p className={styles.paragraph}>
                            If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, or safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
                        </p>
                        <h3 className={styles.subSectionTitle}>Third-Party Service Providers:</h3>
                        <p className={styles.paragraph}>
                            We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>5. Security of Your Information</h2>
                        <p className={styles.paragraph}>
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>6. Your Rights</h2>
                        <p className={styles.paragraph}>
                            You have certain rights regarding your personal information, including the right to access, correct, or delete your data. To exercise these rights, please contact us using the information provided below.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>7. Contact Us</h2>
                        <p className={styles.paragraph}>
                            If you have questions or comments about this Privacy Policy, please contact us at:
                        </p>
                        <address className={styles.contactAddress}>
                            FreelanceHub<br/>
                            Bengaluru,Karnataka<br/>
                            Email: <a href="mailto:privacy@[freelancehub.com]">privacy@[freelancehub.com]</a>
                        </address>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
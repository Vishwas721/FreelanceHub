// src/pages/TermsOfServicePage.js
import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './LegalPages.module.css'; // Reusing a common CSS module for legal pages

const TermsOfServicePage = () => {
    return (
        <div className={styles.pageContainer}>
            <Header />
            <main className={styles.mainContent}>
                <div className={styles.legalCard}>
                    <h1 className={styles.title}>Terms of Service</h1>
                    <p className={styles.lastUpdated}>Last Updated: May 24, 2025</p>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
                        <p className={styles.paragraph}>
                            By accessing or using the services provided by FreelanceHub , you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Eligibility</h2>
                        <p className={styles.paragraph}>
                            You must be at least 18 years old to use this Service. By using the Service, you represent and warrant that you are at least 18 years old and capable of entering into a binding contract.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. User Accounts</h2>
                        <p className={styles.paragraph}>
                            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                        <p className={styles.paragraph}>
                            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>4. Project Posting (Clients)</h2>
                        <ul className={styles.list}>
                            <li>Clients agree to provide accurate and detailed project descriptions.</li>
                            <li>Clients are responsible for timely communication with freelancers.</li>
                            <li>Clients agree to make payments as agreed upon through the platform's payment system.</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>5. Bidding and Work (Freelancers)</h2>
                        <ul className={styles.list}>
                            <li>Freelancers agree to provide accurate representations of their skills and experience.</li>
                            <li>Freelancers are responsible for completing projects according to agreed terms and deadlines.</li>
                            <li>Freelancers acknowledge that payments are contingent upon client satisfaction and project completion.</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>6. Fees and Payments</h2>
                        <p className={styles.paragraph}>
                            FreelanceHub may charge fees for certain services (e.g., project listing fees, service fees on completed projects). All fees will be clearly communicated. You are responsible for all applicable taxes.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>7. Intellectual Property</h2>
                        <p className={styles.paragraph}>
                            The Service and its original content, features, and functionality are and will remain the exclusive property of FreelanceHub and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of [Your Company Name].
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>8. Termination</h2>
                        <p className={styles.paragraph}>
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>9. Governing Law</h2>
                        <p className={styles.paragraph}>
                            These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>10. Changes to Terms</h2>
                        <p className={styles.paragraph}>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>11. Contact Us</h2>
                        <p className={styles.paragraph}>
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <address className={styles.contactAddress}>
                            FreelanceHub<br/>
                            Bengaluru,Karnataka<br/>
                            Email: <a href="freelance:support@[freelancehub.com]">support@[freelancehub.com]</a>
                        </address>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfServicePage;
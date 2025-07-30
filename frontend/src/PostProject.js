import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Adjusted path
import Header from './components/Header'; // Added Header
import Footer from './components/Footer'; // Added Footer
import './PostProject.css';

const PostProject = () => {
    const { user } = useContext(AuthContext); // Destructuring only user, as token is on user object
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [files, setFiles] = useState([]);
    const [skillsRequired, setSkillsRequired] = useState([]); // Array for tags
    const [currentSkillInput, setCurrentSkillInput] = useState(''); // For the skill input field
    const [category, setCategory] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    // Handlers for basic inputs
    const handleTitleChange = (e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: '' })); };
    const handleDescriptionChange = (e) => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: '' })); };
    const handleBudgetChange = (e) => { setBudget(e.target.value); setErrors(prev => ({ ...prev, budget: '' })); };
    const handleDeadlineChange = (e) => { setDeadline(e.target.value); setErrors(prev => ({ ...prev, deadline: '' })); };
    const handleCategoryChange = (e) => { setCategory(e.target.value); setErrors(prev => ({ ...prev, category: '' })); };
    const handleVisibilityChange = (e) => setVisibility(e.target.value);
    const handleTermsChange = (e) => { setTermsAgreed(e.target.checked); setErrors(prev => ({ ...prev, termsAgreed: '' })); };

    const handleFileChange = (e) => {
        setFiles([...files, ...Array.from(e.target.files)]);
    };

    const removeFile = (indexToRemove) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    // Handlers for skill tags
    const handleSkillInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
            e.preventDefault();
            const skill = currentSkillInput.trim();
            if (skill && !skillsRequired.includes(skill)) {
                setSkillsRequired(prevSkills => [...prevSkills, skill]);
                setCurrentSkillInput('');
                setErrors(prev => ({ ...prev, skillsRequired: '' })); // Clear error once a skill is added
            } else if (skill && skillsRequired.includes(skill)) {
                // Optionally show a temporary message that skill already exists
            }
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkillsRequired(prevSkills => prevSkills.filter(skill => skill !== skillToRemove));
        setErrors(prev => ({ ...prev, skillsRequired: '' })); // Clear error if all skills are removed
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({}); // Clear previous errors
        setSubmissionSuccess(false);

        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Project title is required.';
        if (!description.trim()) newErrors.description = 'Project description is required.';
        if (!budget || isNaN(parseFloat(budget)) || parseFloat(budget) <= 0) newErrors.budget = 'Budget must be a positive number.';
        if (!deadline) newErrors.deadline = 'Please select a deadline.';
        if (skillsRequired.length === 0) newErrors.skillsRequired = 'Please add at least one required skill.';
        if (!category) newErrors.category = 'Please select a project category.';
        if (!termsAgreed) newErrors.termsAgreed = 'You must agree to the terms and conditions.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        if (!user || !user.token) {
            setErrors({ general: 'You must be logged in to post a project.' });
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('budget', parseFloat(budget));
            formData.append('deadline', deadline);
            files.forEach(file => formData.append('files', file));
            // Append skills as separate fields for array parsing on backend
            skillsRequired.forEach(skill => formData.append('skillsRequired', skill));
            formData.append('category', category);
            formData.append('visibility', visibility);

            const response = await fetch('http://localhost:5000/api/projects', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
                body: formData,
            });

            if (response.ok) {
                setSubmissionSuccess(true);
                // Clear form fields
                setTitle('');
                setDescription('');
                setBudget('');
                setDeadline('');
                setFiles([]);
                setSkillsRequired([]);
                setCurrentSkillInput('');
                setCategory('');
                setVisibility('public');
                setTermsAgreed(false);
                setLoading(false);
                setTimeout(() => navigate('/dashboard'), 2000); // Redirect after success message
            } else {
                const errorData = await response.json();
                console.error('Backend Validation Errors:', errorData);
                setErrors(errorData.errors || { general: errorData.message || 'Failed to post project due to data errors.' });
                setLoading(false);
            }
        } catch (error) {
            console.error('Error posting project:', error);
            setErrors({ general: 'Failed to connect to the server. Please try again later.' });
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <Header />
            <main className="post-project-main">
                <div className="post-project-card">
                    <h1 className="post-project-title">Post a New Project</h1>

                    {submissionSuccess && (
                        <div className="alert alert-success">
                            Project posted successfully! Redirecting to your dashboard...
                        </div>
                    )}
                    {errors.general && (
                        <div className="alert alert-error">{errors.general}</div>
                    )}

                    <form onSubmit={handleSubmit} className="post-project-form">
                        <div className="form-group">
                            <label htmlFor="title" className="form-label">Project Title</label>
                            <input
                                type="text"
                                id="title"
                                className="form-input"
                                value={title}
                                onChange={handleTitleChange}
                                maxLength="255"
                                required
                            />
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Project Description</label>
                            <textarea
                                id="description"
                                className="form-input form-textarea"
                                value={description}
                                onChange={handleDescriptionChange}
                                rows="7" // Reduced rows for better initial fit, can be resized
                                required
                            />
                            {errors.description && <span className="error-message">{errors.description}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="budget" className="form-label">Budget ($)</label>
                            <input
                                type="number"
                                id="budget"
                                className="form-input"
                                placeholder="e.g., 500"
                                value={budget}
                                onChange={handleBudgetChange}
                                min="0"
                                step="0.01"
                                required
                            />
                            {errors.budget && <span className="error-message">{errors.budget}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="deadline" className="form-label">Deadline</label>
                            <input
                                type="date"
                                id="deadline"
                                className="form-input"
                                value={deadline}
                                onChange={handleDeadlineChange}
                                required
                            />
                            {errors.deadline && <span className="error-message">{errors.deadline}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="skillsRequired" className="form-label">Skills Required</label>
                            <div className="skills-input-container">
                                <input
                                    type="text"
                                    id="skillsRequiredInput" // Separate ID for the text input
                                    className="form-input skills-input"
                                    value={currentSkillInput}
                                    onChange={(e) => setCurrentSkillInput(e.target.value)}
                                    onKeyDown={handleSkillInputKeyDown}
                                    placeholder="Type a skill and press Enter/Comma (e.g., React, Node.js)"
                                />
                                <div className="skill-tag-list">
                                    {skillsRequired.map((skill, index) => (
                                        <span key={index} className="skill-tag">
                                            {skill}
                                            <button type="button" className="remove-skill-btn" onClick={() => removeSkill(skill)}>
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {errors.skillsRequired && <span className="error-message">{errors.skillsRequired}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="category" className="form-label">Project Category</label>
                            <select
                                id="category"
                                className="form-input form-select"
                                value={category}
                                onChange={handleCategoryChange}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Web Development">Web Development</option>
                                <option value="Mobile App Development">Mobile App Development</option>
                                <option value="UI/UX Design">UI/UX Design</option>
                                <option value="Graphic Design">Graphic Design</option>
                                <option value="Writing & Translation">Writing & Translation</option>
                                <option value="Digital Marketing">Digital Marketing</option>
                                <option value="Data Science">Data Science</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.category && <span className="error-message">{errors.category}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="files" className="form-label">Attachments (Optional)</label>
                            <input
                                type="file"
                                id="files"
                                className="form-input form-file-input" // Custom class for file input
                                multiple
                                onChange={handleFileChange}
                            />
                            {files.length > 0 && (
                                <div className="file-list">
                                    {files.map((file, index) => (
                                        <span key={index} className="file-item">
                                            {file.name}
                                            <button type="button" className="remove-file-btn" onClick={() => removeFile(index)}>
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Visibility</label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="public"
                                        checked={visibility === 'public'}
                                        onChange={handleVisibilityChange}
                                        className="form-radio-input"
                                    />
                                    <span className="radio-custom"></span> {/* Custom radio indicator */}
                                    Public
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="private"
                                        checked={visibility === 'private'}
                                        onChange={handleVisibilityChange}
                                        className="form-radio-input"
                                    />
                                    <span className="radio-custom"></span> {/* Custom radio indicator */}
                                    Private (Invite Only)
                                </label>
                            </div>
                        </div>

                        <div className="form-group terms-group">
                            <label htmlFor="termsAgreed" className="checkbox-label">
                                <input
                                    type="checkbox"
                                    id="termsAgreed"
                                    className="form-checkbox-input"
                                    checked={termsAgreed}
                                    onChange={handleTermsChange}
                                    required
                                />
                                <span className="checkbox-custom"></span> {/* Custom checkbox indicator */}
                                I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="terms-link">terms and conditions</a>
                            </label>
                            {errors.termsAgreed && <span className="error-message">{errors.termsAgreed}</span>}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="button primary-button" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="button-spinner"></span> Posting...
                                    </>
                                ) : (
                                    'Post Project'
                                )}
                            </button>
                            <button type="button" className="button secondary-button" onClick={() => navigate(-1)} disabled={loading}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PostProject;
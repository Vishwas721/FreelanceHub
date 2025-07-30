import { BrowserRouter as Router, Routes, Route, useLocation,Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { AuthContext } from "../AuthContext";
import AuthProvider from "../AuthContext"; // Use default import
import Login from "../Login";
import Register from "../Register";
import AdminDashboard from "../AdminDashboard";
import Dashboard from "../Dashboard";
import "../App.css"; // ✅ Import your CSS file for global styles
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // ✅ Import Bootstrap JS for components
import Projects from "../Projects";
import "bootstrap/dist/css/bootstrap.min.css";
import ProjectDetails from "./ProjectDetails";
import PostProject from "../PostProject";
import NotificationsPage from "../NotificationsPage";
import ViewBidsPage from "../ViewBidsPage";
import MyProjectsPage from "../MyProjectsPage";
import EditProjectPage from "../EditProjectPage";
import ProjectProgressPage from "../ProjectProgressPage";
import FeedbackPage from "../FeedbackPage";
import PrivacyPolicyPage from "../PrivacyPolicyPage";
import TermsOfServicePage from "../TermsOfServicePage";
import ContactPage from "../ContactPage";
import ProfilePage from "../ProfilePage";
import MyBidsPage from "../MyBidsPage";
import EditProfilePage from "../EditProfilePage";
import FreelancerAssignedProjects from "../FreelancerAssignedProjects";
import ClientReviewDeliverablesPage from "../ClientReviewDeliverablesPage";
import HomePage from "../HomePage";
import AboutUs from "../AboutUs";

const pageVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
};

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user?.role === "admin" ? children : <Navigate to="/dashboard" />;
}

function AnimatedRoutes() {
  const location = useLocation(); // ✅ Tracks route changes

  return (
    <AuthProvider>
    <AnimatePresence mode="wait"> {/* ✅ Ensures smooth animations */}
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
             <Route path="/post-project" element={<PostProject />} />
             <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/view-bids/:projectId" element={<ViewBidsPage /> }/> 
          <Route path="/my-projects" element={<MyProjectsPage />} />
          <Route path="/edit-project/:projectId" element={<EditProjectPage />} />
          <Route path="/project-progress/:projectId" element={<ProjectProgressPage />} />
           <Route path="/feedback" element={<FeedbackPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/contact" element={<ContactPage />} />
                                        <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-bids" element={<MyBidsPage />} /> {/* <--- Add this route */}
                    <Route path="/edit-profile/:userId" element={<EditProfilePage />} /> 
<Route path="/about-us" element={<AboutUs / >} /> {/* Add About Us route */}
                    <Route path="/freelancer-assigned-projects" element={<FreelancerAssignedProjects />} />  
                    <Route path="/review-deliverables/:projectId" element={<ClientReviewDeliverablesPage />} />                           

        </Routes>
      </motion.div>
    </AnimatePresence>
    </AuthProvider>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes /> {/* ✅ Routes wrapped in motion div for global animations */}
    </Router>
  );
}

export default App;
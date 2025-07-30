// src/Login.js
import { useState, useContext } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Get the login function from AuthContext
    const [form, setForm] = useState({ email: "", password: "" });

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", form);
            console.log("Login.js: Backend /api/auth/login response.data:", response.data);

            // Crucial: Ensure your backend sends username and userId in the login response
            const { token, role, username, userId } = response.data;
            login({ token, role, username, userId }); // Pass the complete object to AuthContext

            navigate("/dashboard");
        } catch (error) {
            console.error("Login.js: Login error:", error.response?.data?.message || error.message);
            alert("Login failed! Please check your credentials.");
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const response = await axios.post("http://localhost:5000/api/auth/google-login", { token: credentialResponse.credential });
            console.log("Login.js: Backend /api/auth/google-login response.data:", response.data);

            // Crucial: Ensure your backend sends username and userId in the Google login response
            const { token, role, username, userId } = response.data;
            login({ token, role, username, userId }); // Pass the complete object to AuthContext

            alert("Google Login Successful!");
            navigate("/dashboard"); // Always land on the dashboard
        } catch (error) {
            console.error("Login.js: Google login error:", error.response?.data?.message || error.message);
            alert(`Google login failed: ${error.message}`);
        }
    };

    return (
        <GoogleOAuthProvider clientId="1038553412182-e6jsck4jab8fjdjpq6khe1jmvoook2f3.apps.googleusercontent.com">
            <form className="container w-25 mt-5" onSubmit={handleLogin}>
                <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
                <div className="form-floating mb-2">
                    <input type="email" className="form-control" placeholder="Email"
                        onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    <label>Email address</label>
                </div>
                <div className="form-floating mb-2">
                    <input type="password" className="form-control" placeholder="Password"
                        onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    <label>Password</label>
                </div>
                <div className="form-check text-start my-3">
                    <input className="form-check-input" type="checkbox" /> <label>Remember me</label>
                </div>
                <button className="btn btn-primary w-100 py-2" type="submit">Sign in</button>
                <div className="mt-3">
                    <GoogleLogin onSuccess={handleGoogleLogin} onError={(error) => console.error("Google Login onError:", error)} />
                </div>
            </form>
        </GoogleOAuthProvider>
    );
};

export default Login;
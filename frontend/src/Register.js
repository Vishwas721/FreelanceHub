import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";   // ← import
import 'bootstrap/dist/css/bootstrap.min.css';



const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "freelancer",
  });
  const navigate = useNavigate();  // ← hook

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        form,
        { headers: { "Content-Type": "application/json" } }
      );
      alert(response.data.message);
      // ➡️ Redirect to login after successful signup:
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error.response || error.message);
      alert("Registration failed. Please try again.");
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/google-signup",
        { token: credentialResponse.credential }
      );
      alert(response.data.message);
      // ➡️ Also redirect after Google signup:
      navigate("/dashboard");
    } catch (error) {
      console.error("Google signup error:", error); // Log the entire error object
      alert(`Google signup failed: ${error.message}`); // Display a more informative alert
    }
  };

  return (
    <GoogleOAuthProvider clientId="1038553412182-e6jsck4jab8fjdjpq6khe1jmvoook2f3.apps.googleusercontent.com">
      <form className="container w-25 mt-5" onSubmit={handleRegister}>
        <h1 className="h3 mb-3 fw-normal">Sign up</h1>

        <div className="form-floating mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            required
          />
          <label>Username</label>
        </div>

        <div className="form-floating mb-2">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label>Email address</label>
        </div>

        <div className="form-floating mb-2">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />
          <label>Password</label>
        </div>

       <div className="form-floating mb-2">

          <select

            className="form-control"

            onChange={(e) => setForm({ ...form, role: e.target.value })}

            value={form.role}

            required

          >

            <option value="client">Client</option>

            <option value="freelancer">Freelancer</option>

          </select>

          <label>User Role</label>

        </div>

        <div className="form-check text-start my-3">
          <input className="form-check-input" type="checkbox" />
          <label>Remember me</label>
        </div>

        <button className="btn btn-success w-100 py-2" type="submit">
          Sign Up
        </button>

        <div className="mt-3">
          <GoogleLogin
            onSuccess={handleGoogleSignup}
            onError={(error) => console.error("Google Signup onError:", error)} // Log onError
          />
        </div>
      </form>
    </GoogleOAuthProvider>
  );
};

export default Register;
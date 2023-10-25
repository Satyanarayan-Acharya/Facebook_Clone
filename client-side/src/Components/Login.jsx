import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/Registration.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      if (response.status === 200) {
        const token = response.data.token;
        // Store the JWT token securely (e.g., in local storage)
        localStorage.setItem("token", token);

        // Redirect to the dashboard or any desired route
        navigate("/dashboard");
      } else {
        // Handle login failure (display an error message to the us4er, etc.)
        console.error("Login error:", response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      // Handle other errors (network issues, server down, etc.)
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Login</button>
        <br />
        <p>
          Don't have account{" "}
          <button onClick={() => navigate("/register")}>Create Account</button>
        </p>
      </form>
    </div>
  );
}

export default Login;

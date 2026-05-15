import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});
function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register"

  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (mode === "login") {
        const res = await api.post("/auth/login", {
          username: form.username,
          password: form.password,
        });
        localStorage.setItem("token", res.data.access_token);
        onLogin(res.data.access_token, form.username);
      } else {
        await api.post("/auth/register", {
          username: form.username,
          full_name: form.full_name,
          email: form.email,
          password: form.password,
        });
        setMessage("Account created! Please log in.");
        setMode("login");
        setForm({ username: "", full_name: "", email: "", password: "" });
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-badge">🐿️</span>
          <h1>SaveSavvy</h1>
        </div>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Welcome back! Log in to continue."
            : "Create your account to get started."}
        </p>

        {/* Mode Toggle */}
        <div className="auth-toggle">
          <button
            className={`toggle-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
            type="button"
          >
            Log In
          </button>
          <button
            className={`toggle-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError("");
              setMessage("");
            }}
            type="button"
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          {mode === "register" && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button className="btn auth-btn" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Log In"
                : "Create Account"}
          </button>
        </form>

        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}
      </div>
    </div>
  );
}

export default Login;

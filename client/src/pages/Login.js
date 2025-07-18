import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import logo from '../assets/logo.jpg'; // make sure logo is placed correctly

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/auth/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="logo-img" />
      <h1 className="login-header">PROBUILDTECH</h1>
      <h2 className="login-subheader">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="login-input"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="login-input"
        />
        <button type="submit" className="login-btn">Login</button>
        <p className="login-text">
          Don't have an account? <Link to="/signup" className="login-link">Signup</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;



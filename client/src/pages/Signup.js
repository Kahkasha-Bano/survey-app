import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import logo from '../assets/logo.jpg'; // same logo

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/auth/signup', { ...form, role: 'user' });
      alert('User created');
      navigate('/');
    } catch {
      alert('Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <img src={logo} alt="Logo" className="logo-img" />
      <h1 className="signup-header">PROBUILDTECH</h1>
      <h2 className="signup-subheader">Create an Account</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
          className="signup-input"
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="signup-input"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="signup-input"
        />
        <button type="submit" className="signup-btn">Signup</button>
        <p className="signup-text">
          Already have an account? <Link to="/" className="signup-link">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;




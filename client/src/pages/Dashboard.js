import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';
import logo from '../assets/logo.jpg';

const Dashboard = () => {
  const [surveys, setSurveys] = useState([]);
  const [filterClient, setFilterClient] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/survey/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSurveys(res.data);
      } catch (err) {
        alert('Failed to load surveys');
      }
    };
    fetchData();
  }, []);

  const filteredSurveys = surveys.filter((survey) =>
    (survey.clientName || '').toLowerCase().includes(filterClient.toLowerCase())
  );

  return (
    <>
      {/* Custom Sticky Navbar */}
      <nav className="custom-navbar">
        <div className="navbar-content">
          <Link className="navbar-brand" to="/">
            <img
              src={logo}
              alt="ProbuildTech Logo"
              width="30"
              height="30"
            />
            <span className="brand-text">ProbuildTech</span>
          </Link>

          <form className="search-controls" role="search">
            <input
              className="dashboard-search"
              type="text"
              placeholder="Search by client name"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            />
            <Link to="/create" className="dashboard-button">
              Add Survey
            </Link>
          </form>
        </div>
      </nav>

      {/* Card Display Section */}
      <div className="dashboard-container container-fluid">
       
          {filteredSurveys.map((survey) => (
            <div key={survey._id} className="dashboard-card">
              <p><strong>Client:</strong> {survey.clientName}</p>
              <p><strong>Date:</strong> {new Date(survey.surveyDate).toLocaleDateString()}</p>
              <p><strong>Progress:</strong> {survey.progress}</p>
              <Link to={`/survey/${survey._id}`} className="dashboard-link">
                View Details
              </Link>
            </div>
          ))}
        </div>
    </>
  );
};

export default Dashboard;

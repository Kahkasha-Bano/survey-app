import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import md5 from 'md5'; // Import md5 for Gravatar
import '../styles/Dashboard.css'; // Import your custom styles

const Dashboard = () => {
  const [surveys, setSurveys] = useState([]);
  const [activities, setActivities] = useState([]);

  const [activeTab, setActiveTab] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null); // State to store fetched user data
  const [loadingUser, setLoadingUser] = useState(true); // Loading state for user data

  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch all surveys
    const fetchSurveys = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/survey/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSurveys(res.data);
      } catch (err) {
        console.error('Failed to load surveys:', err);
        // You might want to show a more user-friendly error message
        alert('Failed to load surveys.');
      }
    };
  //recent Activity fetching
  const fetchActivities = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/activity/recent', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setActivities(res.data);
  } catch (err) {
    console.error('Failed to load activity log:', err);
  }
};


    // Function to fetch current user data
    const fetchUserData = async () => {
      try {
        setLoadingUser(true);
        const token = localStorage.getItem('token');
        if (!token) {
          // If no token, redirect to login or handle unauthenticated state
          navigate('/login');
          return;
        }
        const res = await axios.get('http://localhost:5000/auth/me', { // Assuming /api/auth/me is your endpoint
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data); // Store user data in state
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        // Handle token expiration or invalid token here
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/login'); // Redirect to login
          alert('Session expired or unauthorized. Please log in again.');
        } else {
          alert('Failed to load user data.');
        }
      } finally {
        setLoadingUser(false);
      }
    };

    fetchSurveys();
    fetchUserData(); // Call the function to fetch user data
    fetchActivities(); // Fetch recent activities
  }, [navigate]); // Add navigate to dependency array

  // Categorize logic (remains the same)
  const categorizeSurvey = (survey) => {
    const progress = survey.progress;
    if (!progress || progress === "Survey Started") return "Pending";
    if (progress === "Survey Completed" || progress === "Drafting Started") return "In Progress";
    if (progress === "Drafting Completed" || progress === "Final Submitted") return "Completed";
    return "Unknown";
  };

  const renderText = (activity) => {
  let action = '';

  switch (activity.type) {
    case 'created':
      action = `Survey created for ${activity.clientName}`;
      break;
    case 'updated':
      const fields = activity.updatedFields?.join(', ') || 'fields';
      action = `Survey updated for ${activity.clientName} – ${fields} updated`;
      break;
    case 'file_uploaded':
      action = `Files uploaded for ${activity.clientName}`;
      break;
    default:
      action = `Activity on ${activity.clientName}`;
  }

  return action;
};


  const filteredSurveys = surveys.filter(
    (survey) =>
      categorizeSurvey(survey) === activeTab &&
      survey.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (surveyId) => {
    navigate(`/survey/${surveyId}`);
  };

  // Function to generate Gravatar URL
  const getGravatarUrl = (email, size = 40) => {
    if (!email) {
      // Return a default image if email is not available
      return `https://www.gravatar.com/avatar/?d=mp&s=${size}`; // 'mp' for mystery person
    }
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`; // 'identicon' for unique geometric pattern
  };

  // Show a loading state if user data is still being fetched
  if (loadingUser) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border custom-navy-text" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If currentUser is null after loading (e.g., failed to fetch), handle it gracefully
  if (!currentUser) {
    return (
      <div className="text-center p-5">
        <h4>Error loading user data. Please try again.</h4>
        <button className="btn custom-navy-bg text-white mt-3" onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm fixed-top py-2">
        <div className="container-fluid px-4">
          {/* Left: Logo and Brand Name */}
          <Link to="/" className="navbar-brand d-flex align-items-center me-auto">
            <img
              src={logo}
              alt="Survey Tool Logo"
              width="50"
              height="50"
              className="me-2"
            />
            <span className="fw-bold fs-5 text-dark"> Probuildtech Surveys </span>
          </Link>

          {/* Right: Profile Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center"
              type="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ width: '40px', height: '40px', overflow: 'hidden' }}
            >
              <img
                src={getGravatarUrl(currentUser.email)} // Use Gravatar URL from user email
                alt={`${currentUser.name}'s Profile`}
                className="img-fluid rounded-circle"
              />
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="profileDropdown">
              <li><h6 className="dropdown-header">{currentUser.name} ({currentUser.role})</h6></li> {/* Display user's name and role */}
              <li><p className="dropdown-item-text text-muted small">{currentUser.email}</p></li> {/* Display email */}
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="/profile">My Profile</a></li>
              <li><a className="dropdown-item" href="/settings">Settings</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item text-danger" href="/logout">Logout</a></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <div className="container mt-5 pt-4">
        <h2 className="fw-bold mb-4">Welcome back, {currentUser.name}</h2>

        {/* Stats Section */}
        <div className="row g-3 mb-5">
          <div className="col-md-3 col-sm-6">
            <div className="card bg-light p-4 rounded shadow-sm text-center">
              <p className="mb-1 text-muted text-dark">Total Surveys</p>
              <h4 className="fw-bold text-dark">{surveys.length}</h4>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className=" card bg-light p-4 rounded shadow-sm text-center">
              <p className="mb-1 text-muted text-dark">Pending Surveys</p>
              <h4 className="fw-bold text-dark">{surveys.filter(s => categorizeSurvey(s) === 'Pending').length}</h4>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card bg-light p-4 rounded shadow-sm text-center">
              <p className="mb-1 text-muted text-dark">Completed Surveys</p>
              <h4 className="fw-bold text-dark">{surveys.filter(s => categorizeSurvey(s) === 'Completed').length}</h4>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className=" card bg-light p-4 rounded shadow-sm text-center">
              <p className="mb-1 text-muted text-dark">Surveys This Week</p>
              <h4 className="fw-bold text-dark">{surveys.filter(s => new Date(s.surveyDate) >= new Date(new Date().setDate(new Date().getDate() - 7))).length}</h4>
            </div>
          </div>
        </div>

        <h3 className="fw-bold mb-3">Surveys</h3>

        {/* Search Bar */}
        <div className="input-group mb-4 rounded-pill overflow-hidden shadow-sm">
          <span className="input-group-text bg-white border-0 ps-3">
            <i className="bi bi-search text-dark"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 py-2 background-dark "
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <ul className="nav nav-pills mb-4">
          {['Pending', 'In Progress', 'Completed'].map(status => (
            <li className="nav-item me-2" key={status}>
              <button
                className={`nav-link text-body fw-bold ${activeTab === status ? 'active custom-navy-bg text-white' : 'bg-light'}`}
                onClick={() => setActiveTab(status)}
              >
                {status}
              </button>
            </li>
          ))}
        </ul>

        {/* Survey Table */}
        <div className="table-responsive bg-white rounded shadow-sm p-3">
          <table className="table table-borderless table-hover mb-0">
            <thead className="text-muted border-bottom">
              <tr>
                <th className="py-3 text-dark">Client Name</th>
                <th className="py-3 text-dark">Location</th>
                <th className="py-3 text-dark">Status</th>
                <th className="py-3 text-dark">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurveys.map((survey) => (
                <tr
                  key={survey._id}
                  onClick={() => handleRowClick(survey._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="py-3 text-dark">{survey.clientName}</td>
                  <td className="py-3 text-dark">{survey.location}</td>
                  <td className="py-3">
                    <span
                      className={`badge rounded-pill px-3 py-2 fw-normal fs-6 text-capitalize ${
                        categorizeSurvey(survey) === 'Pending'
                          ? 'bg-warning text-dark'
                          : categorizeSurvey(survey) === 'In Progress'
                          ? 'bg-primary'
                          : 'bg-success'
                      }`}
                    >
                      {categorizeSurvey(survey)}
                    </span>
                  </td>
                  <td className="py-3">{new Date(survey.surveyDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Survey Button */}
        <div className="d-flex justify-content-end my-4">
          <Link to="/create" className="btn custom-navy-bg  rounded-pill px-4 py-2 fw-bold">
             Create Survey
          </Link>
        </div>

        {/* Recent Activity */}
       {/* Recent Activity */}
<div className="mt-5">
  <h5 className="fw-bold mb-3">Recent Activity</h5>
  <ul className="list-group list-group-flush border rounded shadow-sm">
    {activities.slice(0, 5).map((activity) => (
      <li key={activity._id} className="list-group-item d-flex justify-content-between align-items-center py-3">
        <span>{renderText(activity)}</span>
        <span className="text-muted small">
          {new Date(activity.timestamp).toLocaleDateString()}
        </span>
      </li>
    ))}
  </ul>
</div>

      </div>
    </>
  );
};

export default Dashboard;


























// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';
// import '../styles/Dashboard.css';
// import logo from '../assets/logo.jpg';

// const Dashboard = () => {
//   const [surveys, setSurveys] = useState([]);
//   const [filterClient, setFilterClient] = useState('');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get('http://localhost:5000/api/survey/all', {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         });
//         setSurveys(res.data);
//       } catch (err) {
//         alert('Failed to load surveys');
//       }
//     };
//     fetchData();
//   }, []);

//   const filteredSurveys = surveys.filter((survey) =>
//     (survey.clientName || '').toLowerCase().includes(filterClient.toLowerCase())
//   );

//   return (
//     <>
//       {/* Custom Sticky Navbar */}
//       <nav className="custom-navbar">
//         <div className="navbar-content">
//           <Link className="navbar-brand" to="/">
//             <img
//               src={logo}
//               alt="ProbuildTech Logo"
//               width="30"
//               height="30"
//             />
//             <span className="brand-text">ProbuildTech</span>
//           </Link>

//           <form className="search-controls" role="search">
//             <input
//               className="dashboard-search"
//               type="text"
//               placeholder="Search by client name"
//               value={filterClient}
//               onChange={(e) => setFilterClient(e.target.value)}
//             />
//             <Link to="/create" className="dashboard-button">
//               Add Survey
//             </Link>
//           </form>
//         </div>
//       </nav>

//       {/* Card Display Section */}
//       <div className="dashboard-container container-fluid">
       
//           {filteredSurveys.map((survey) => (
//             <div key={survey._id} className="dashboard-card">
//               <p><strong>Client:</strong> {survey.clientName}</p>
//               <p><strong>Date:</strong> {new Date(survey.surveyDate).toLocaleDateString()}</p>
//               <p><strong>Progress:</strong> {survey.progress}</p>
//               <Link to={`/survey/${survey._id}`} className="dashboard-link">
//                 View Details
//               </Link>
//             </div>
//           ))}
//         </div>
//     </>
//   );
// };

// export default Dashboard;

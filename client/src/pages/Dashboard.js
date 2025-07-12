import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/survey/all', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => setSurveys(res.data));
  }, []);

  return (
    <div>
      <h2>Survey Dashboard</h2>
      <ul>
        {surveys.map(survey => (
          <li key={survey.id}>{survey.client_name} - {survey.progress}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
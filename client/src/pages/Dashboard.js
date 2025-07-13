import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [surveys, setSurveys] = useState([]);
  const [filterClient, setFilterClient] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/survey/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSurveys(res.data);
      } catch (err) {
        console.error("❌ API Error:", err);
        alert("Failed to load surveys");
      }
    };
    fetchData();
  }, []);

  // Filter logic
  const filteredSurveys = surveys.filter((survey) =>
    survey.clientName.toLowerCase().includes(filterClient.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📋 Survey Dashboard</h2>

      {/* Filter Input */}
      <input
        type="text"
        placeholder="🔍 Search by client name"
        value={filterClient}
        onChange={(e) => setFilterClient(e.target.value)}
        className="mb-6 px-4 py-2 border rounded w-full md:w-1/2"
      />

      {/* Survey Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurveys.map((survey) => (
          <div key={survey._id} className="bg-white shadow p-4 rounded">
            <h3 className="text-lg font-semibold">{survey.clientName}</h3>
            <p><strong>Date:</strong> {new Date(survey.surveyDate).toLocaleDateString()}</p>
            <p><strong>Progress:</strong> {survey.progress}%</p>
            <p><strong>Location:</strong> {survey.latitude}, {survey.longitude}</p>
            <Link
              to={`/survey/${survey._id}`}
              className="mt-2 inline-block text-blue-600 hover:underline"
            >
              View Details →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

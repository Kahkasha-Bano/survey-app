import React, { useState } from 'react';
import axios from 'axios';

const SurveyForm = () => {
  const [form, setForm] = useState({ clientName: '', surveyDate: '', surveyedBy: '', progress: '', latitude: '', longitude: '' });
  const [file, setFile] = useState(null);
  const [siteImage, setSiteImage] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      setForm({ ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    formData.append('file', file);
    formData.append('siteImage', siteImage);

    await axios.post('http://localhost:5000/api/survey', formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    alert('Submitted');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="clientName" placeholder="Client Name" onChange={handleChange} />
      <input type="date" name="surveyDate" onChange={handleChange} />
      <input name="surveyedBy" placeholder="Surveyed By" onChange={handleChange} />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input type="file" onChange={(e) => setSiteImage(e.target.files[0])} />
      <select name="progress" onChange={handleChange}>
        <option value="">Select Progress</option>
        <option>Not Started</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>
      <button type="button" onClick={getLocation}>Get Location</button>
      <button type="submit">Submit</button>
    </form>
  );
};

export default SurveyForm;
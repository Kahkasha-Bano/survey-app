import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateProject.css';

const SurveyForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    clientName: '',
    surveyDate: '',
    surveyedBy: '',
    progress: '',
    latitude: '',
    longitude: '',
    totalAmount: '',
    amountReceived: '',
  });

  const [file, setfile] = useState(null);
  const [images, setImages] = useState([]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm({
        ...form,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Append form fields
    Object.entries(form).forEach(([key, val]) =>
      formData.append(key, val)
    );

    // Append PDF file
    if (file) {
      formData.append('file', file);
    }

    // Append multiple images
    images.forEach((img) => formData.append('images', img));


    try {
      await axios.post('http://localhost:5000/api/survey', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Survey Submitted Successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Submission failed');
    }
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <h2>Create New Survey</h2>

      <input
        name="clientName"
        placeholder="Client Name"
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="surveyDate"
        onChange={handleChange}
        required
      />
      <input
        name="surveyedBy"
        placeholder="Surveyed By"
        onChange={handleChange}
        required
      />

      <div className="mb-3">
  <label htmlFor="file" className="form-label">Attach PDF:</label>
  <input
    type="file"
    className="form-control"
    accept=".pdf"
    onChange={(e) => setfile(e.target.files[0])}
  />
</div>

<div className="mb-3">
  <label htmlFor="images" className="form-label">Upload Images:</label>
  <input
  id="images"
  name="images"
  type="file"
  className="form-control"
  multiple
  accept="image/*"
  onChange={(e) => setImages(Array.from(e.target.files))}
/>

</div>


      <select name="progress" onChange={handleChange} required>
        <option value="">Select Progress</option>
        <option>Survey Started</option>
        <option>Survey Completed</option>
        <option>Drafting Started</option>
        <option>Drafting Completed</option>
        <option>Final Submitted</option>
      </select>

      <input
        type="number"
        name="totalAmount"
        placeholder="Total Amount"
        value={form.totalAmount}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="amountReceived"
        placeholder="Amount Received (if any)"
        value={form.amountReceived}
        onChange={handleChange}
      />

      <button type="button" onClick={getLocation} className="location-btn">
        Get Location
      </button>
      <button type="submit" className="submit-btn">
        Submit
      </button>
    </form>
  );
};

export default SurveyForm;


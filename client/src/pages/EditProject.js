import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LocationPicker = ({ setForm }) => {
  useMapEvents({
    click(e) {
      setForm((prev) => ({
        ...prev,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      }));
    },
  });
  return null;
};

const EditProject = () => {
  const { id } = useParams();
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
    images: [],
    pdf: null,
  });

  useEffect(() => {
    const fetchSurvey = async () => {
      const { data } = await axios.get(`http://localhost:5000/api/survey/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setForm((prev) => ({
        ...prev,
        ...data,
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        images: [],
        pdf: null,
      }));
    };
    fetchSurvey();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'images') {
      setForm({ ...form, images: [...files] });
    } else if (name === 'pdf') {
      setForm({ ...form, pdf: files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (let key in form) {
        if (key === 'images') {
          form.images.forEach((img) => formData.append('images', img));
        } else if (key === 'pdf') {
          formData.append('pdf', form.pdf);
        } else {
          formData.append(key, form[key]);
        }
      }

      await axios.put(`http://localhost:5000/api/survey/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('Survey updated successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">Edit Survey</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-bold">Client Name</label>
          <input
            type="text"
            name="clientName"
            className="form-control"
            value={form.clientName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-bold">Survey Date</label>
          <input
            type="date"
            name="surveyDate"
            className="form-control"
            value={form.surveyDate?.substring(0, 10)}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-bold">Surveyed By</label>
          <input
            type="text"
            name="surveyedBy"
            className="form-control"
            value={form.surveyedBy}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-bold">Progress</label>
          <select
            name="progress"
            className="form-select"
            value={form.progress}
            onChange={handleChange}
            required
          >
            <option value="">Select Progress</option>
            <option>Survey Started</option>
            <option>Survey Completed</option>
            <option>Drafting Started</option>
            <option>Drafting Completed</option>
            <option>Final Submitted</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-bold">Total Amount</label>
          <input
            type="number"
            name="totalAmount"
            className="form-control"
            value={form.totalAmount}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-bold">Amount Received</label>
          <input
            type="number"
            name="amountReceived"
            className="form-control"
            value={form.amountReceived}
            onChange={handleChange}
          />
        </div>

        {/* PDF Upload */}
        <div className="col-12">
          <label className="form-label fw-bold">Upload PDF</label>
          <input
            type="file"
            name="pdf"
            accept=".pdf"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>

        {/* Images Upload */}
        <div className="col-12">
          <label className="form-label fw-bold">Upload Images</label>
          <input
            type="file"
            name="images"
            accept="image/*"
            className="form-control"
            multiple
            onChange={handleFileChange}
          />
        </div>

        {/* Map Location */}
        <div className="col-12">
          <label className="form-label fw-bold">Select Location on Map</label>
          <MapContainer
            center={[form.latitude || 19.2, form.longitude || 72.8]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap"
            />
            <LocationPicker setForm={setForm} />
            {form.latitude && form.longitude && (
              <Marker position={[form.latitude, form.longitude]} />
            )}
          </MapContainer>
        </div>

        <div className="col-6">
          <label className="form-label fw-bold">Latitude</label>
          <input
            type="text"
            name="latitude"
            className="form-control"
            value={form.latitude}
            onChange={handleChange}
            readOnly
          />
        </div>
        <div className="col-6">
          <label className="form-label fw-bold">Longitude</label>
          <input
            type="text"
            name="longitude"
            className="form-control"
            value={form.longitude}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div className="col-12 d-flex justify-content-end gap-3 mt-3">
          <button type="submit" className="btn btn-primary">
            Save
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;

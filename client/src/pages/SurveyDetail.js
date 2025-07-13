import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useParams } from 'react-router-dom';

const SurveyDetail = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/survey/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSurvey(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load survey details");
      }
    };
    fetchSurvey();
  }, [id]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:5000/api/survey/${id}/payment`,
        { amount: Number(amount), mode, paymentDate, notes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("✅ Payment added");
      setSurvey(res.data.survey); // or res.data, depending on API response
      setAmount('');
      setMode('');
      setPaymentDate('');
      setNotes('');
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add payment");
    }
  };

  const handleProgressChange = (e) => {
    setSurvey({ ...survey, progress: Number(e.target.value) });
  };

  const generatePDF = async () => {
    const input = document.getElementById('pdf-content');
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save(`${survey.clientName}_report.pdf`);
  };

  if (!survey) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-white rounded shadow">
      {/* Download PDF Button */}
      <button
        onClick={generatePDF}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        📄 Download PDF Report
      </button>

      {/* Exportable Content */}
      <div id="pdf-content">
        <h2 className="text-2xl font-bold mb-4">{survey.clientName}</h2>
        <p><strong>Survey Date:</strong> {new Date(survey.surveyDate).toLocaleDateString()}</p>
        <p><strong>Surveyed By:</strong> {survey.surveyedBy}</p>
        <p><strong>Progress:</strong> {survey.progress}%</p>
        <p><strong>Location:</strong> {survey.latitude}, {survey.longitude}</p>

        {/* Progress Slider */}
        <input
          type="range"
          min="0"
          max="100"
          step="25"
          value={survey.progress}
          onChange={handleProgressChange}
          className="w-full my-4"
        />

        {/* Timeline View */}
        {survey.timeline && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">📍 Project Timeline</h3>
            <ul className="border-l-2 border-gray-400 pl-4 space-y-1 text-sm">
              {survey.timeline.surveyStarted && (
                <li> Survey Started — {new Date(survey.timeline.surveyStarted).toLocaleDateString()}</li>
              )}
              {survey.timeline.surveyCompleted && (
                <li> Survey Completed — {new Date(survey.timeline.surveyCompleted).toLocaleDateString()}</li>
              )}
              {survey.timeline.draftingStarted && (
                <li> Drafting Started — {new Date(survey.timeline.draftingStarted).toLocaleDateString()}</li>
              )}
              {survey.timeline.draftingCompleted && (
                <li> Drafting Completed — {new Date(survey.timeline.draftingCompleted).toLocaleDateString()}</li>
              )}
              {survey.timeline.finalSubmitted && (
                <li> Final Submitted — {new Date(survey.timeline.finalSubmitted).toLocaleDateString()}</li>
              )}
            </ul>
          </div>
        )}

        {/* Document */}
        {survey.filePath && (
          <p className="mt-4">
            <a
              href={`http://localhost:5000/${survey.filePath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
               View Document
            </a>
          </p>
        )}

        {/* Site Image */}
        {survey.imagePath && (
          <img
            src={`http://localhost:5000/${survey.imagePath}`}
            alt="Site"
            className="mt-4 w-full max-w-md"
          />
        )}

        {/* 💳 Payment Summary */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">💰 Payment Summary</h3>
          <p><strong>Total Amount:</strong> ₹{survey.totalAmount || 0}</p>
          <p><strong>Received:</strong> ₹{survey.amountReceived || 0}</p>
          <p><strong>Status:</strong> {survey.paymentStatus}</p>

          {survey.payments?.length > 0 && (
            <ul className="mt-3 text-sm">
              {survey.payments.map((p, i) => (
                <li key={i} className="mb-1">
                  ₹{p.amount} via {p.mode} on {new Date(p.paymentDate).toLocaleDateString()}
                  {p.notes && ` — ${p.notes}`}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* 📋 Copy Google Maps Link Button */}
{survey.latitude && survey.longitude && (
  <button
    onClick={() => {
      const mapURL = `https://www.google.com/maps?q=${survey.latitude},${survey.longitude}`;
      navigator.clipboard.writeText(mapURL);
      alert("✅ Google Maps link copied!");
    }}
    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    📋 Copy Google Maps Link
  </button>
)}


        {/* ➕ Add Payment Form */}
        <form onSubmit={handleAddPayment} className="mt-4">
          <input
            type="number"
            placeholder="Amount"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <select
            required
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          >
            <option value="">Select Mode</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Cheque">Cheque</option>
          </select>
          <input
            type="date"
            required
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            ➕ Add Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default SurveyDetail;


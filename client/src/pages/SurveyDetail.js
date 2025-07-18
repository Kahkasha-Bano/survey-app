import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SurveyDetail = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/survey/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSurvey(res.data);
      } catch (err) {
        alert("Error loading survey.");
      }
    };
    fetchSurvey();
  }, [id]);

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this survey?");
    if (!confirm) return;
    try {
      await axios.delete(`http://localhost:5000/api/survey/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Survey deleted successfully");
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to delete survey");
    }
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

  if (!survey) return <div className="text-center p-5">Loading...</div>;

  const total = Number(survey.totalAmount || 0);
  const received = Number(survey.amountReceived || 0);
  const due = total - received;

  return (
    <div className="container-fluid px-4 py-4" id="pdf-content">
      <h2 className="mb-4 text-center">{survey.clientName}</h2>

      {/* Main Info Block */}
      <div className="row gy-3">
        <div className="col-12 d-flex">
          <label className="fw-bold me-3" style={{ minWidth: '160px' }}>Surveyed By:</label>
          <div className="flex-grow-1 bg-light border px-3 py-2 w-100">{survey.surveyedBy}</div>
        </div>

        <div className="col-12 d-flex">
          <label className="fw-bold me-3" style={{ minWidth: '160px' }}>Survey Date:</label>
          <div className="flex-grow-1 bg-light border px-3 py-2 w-100">
            {new Date(survey.surveyDate).toLocaleDateString()}
          </div>
        </div>

        <div className="col-12 d-flex">
          <label className="fw-bold me-3" style={{ minWidth: '160px' }}>Total Amount:</label>
          <div className="flex-grow-1 bg-light border px-3 py-2 w-100">₹{total}</div>
        </div>

        <div className="col-12 d-flex">
          <label className="fw-bold me-3" style={{ minWidth: '160px' }}>Amount Received:</label>
          <div className="flex-grow-1 bg-light border px-3 py-2 w-100">₹{received}</div>
        </div>

        <div className="col-12 d-flex">
          <label className="fw-bold me-3" style={{ minWidth: '160px' }}>Due:</label>
          <div className="flex-grow-1 bg-light border px-3 py-2 w-100">₹{due}</div>
        </div>

        <div className="col-12 d-flex">
          <label className="fw-bold me-3" style={{ minWidth: '160px' }}>Progress:</label>
          <div className="flex-grow-1 bg-light border px-3 py-2 w-100">{survey.progress}</div>
        </div>

        {/* PDF File (if any) */}
        {survey.file && (
          <div className="col-12 d-flex">
            <label className="fw-bold me-3" style={{ minWidth: '160px' }}>Document:</label>
            <a
              href={survey.file}
              target="_blank"
              rel="noopener noreferrer"
              className="fw-bold text-decoration-none bg-light border px-3 py-2 w-100"
            >
              View Attached Document
            </a>
          </div>
        )}

       {/* Uploaded Images (if any) */}
{survey.images && survey.images.length > 0 && (
  <div className="col-12">
    <label className="fw-bold d-block mb-2">Uploaded Images:</label>
    <div className="d-flex flex-wrap gap-3">
      {survey.images.map((img, index) => (
        <img
          key={index}
          src={img} 
          alt={`Uploaded ${index}`}
          style={{
            width: '200px',
            height: 'auto',
            objectFit: 'cover',
            border: '1px solid #ccc',
            borderRadius: '6px'
          }}
        />
      ))}
    </div>
  </div>
)}


        {/* Google Maps Location */}
        {survey.latitude && survey.longitude && (
          <div className="col-12 d-flex">
            <label className="fw-bold me-3" style={{ minWidth: '160px' }}>Site Location:</label>
            <a
              href={`https://www.google.com/maps?q=${survey.latitude},${survey.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary"
            >
              View on Map
            </a>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-wrap gap-3 mt-4">
        <button
          className="btn btn-outline-success"
          onClick={() => navigate(`/edit/${survey._id}`)}
        >
          Edit
        </button>
        <button className="btn btn-outline-danger" onClick={handleDelete}>
          Delete
        </button>
        <button className="btn btn-outline-secondary ms-auto" onClick={generatePDF}>
          Download Report
        </button>
      </div>
    </div>
  );
};

export default SurveyDetail;
























// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { useParams, useNavigate } from 'react-router-dom';
// import '../styles/SurveyDetail.css';

// const SurveyDetail = () => {
//   const { id } = useParams();
//   const [survey, setSurvey] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchSurvey = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/api/survey/${id}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });
//         setSurvey(res.data);
//       } catch (err) {
//         console.error(err);
//         alert("Failed to load survey details");
//       }
//     };
//     fetchSurvey();
//   }, [id]);

//   const handleDelete = async () => {
//     const confirm = window.confirm("Are you sure you want to delete this survey?");
//     if (!confirm) return;

//     try {
//       await axios.delete(`http://localhost:5000/api/survey/${id}`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       alert("Survey deleted successfully");
//       navigate("/dashboard");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete survey");
//     }
//   };

//   const generatePDF = async () => {
//     const input = document.getElementById('pdf-content');
//     if (!input) return;

//     const canvas = await html2canvas(input);
//     const imgData = canvas.toDataURL('image/png');
//     const pdf = new jsPDF();
//     pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
//     pdf.save(`${survey.clientName}_report.pdf`);
//   };

//   if (!survey) return <div>Loading...</div>;

//   const total = Number(survey.totalAmount || 0);
//   const received = Number(survey.amountReceived || 0);
//   const due = total - received;

//   return (
//     <div className="survey-container">
//       <button onClick={generatePDF} className="download-btn">Download Report</button>

//       <div id="pdf-content">
//         <h2>{survey.clientName}</h2>
//         <p><strong>Survey Date:</strong> {new Date(survey.surveyDate).toLocaleDateString()}</p>
//         <p><strong>Surveyed By:</strong> {survey.surveyedBy}</p>
//         <p><strong>Progress:</strong> {survey.progress}</p>

//         {survey.filePath && (
//           <p className="mt-4">
//             <a
//               href={`http://localhost:5000/${survey.filePath}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="document-link"
//             >
//               View Document
//             </a>
//           </p>
//         )}

//         <div className="payment-summary">
//           <h3>Payment Info</h3>
//           <p><strong>Total Amount:</strong> ₹{total}</p>
//           <p><strong>Amount Received:</strong> ₹{received}</p>
//           <p><strong>Due:</strong> ₹{due}</p>
//         </div>

//         {survey.latitude && survey.longitude && (
//           <a
//             href={`https://www.google.com/maps?q=${survey.latitude},${survey.longitude}`}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="map-btn"
//           >
//            View Site Location on Map
//           </a>
//         )}

//         <div className="action-buttons">
//           <button onClick={() => navigate(`/edit/${survey._id}`)} className="edit-btn">
//             Edit
//           </button>
//           <button onClick={handleDelete} className="delete-btn">
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SurveyDetail;





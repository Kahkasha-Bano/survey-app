
// client/src/pages/SurveyDetail.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { differenceInDays } from 'date-fns';

const SurveyDetail = () => { // <--- SurveyDetail component starts here
  const { id } = useParams();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState(null);
  const [loadingSurvey, setLoadingSurvey] = useState(true);
  const [error, setError] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingSurvey(true);
      setLoadingUser(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const userRes = await axios.get('http://localhost:5000/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(userRes.data);

        const surveyRes = await axios.get(`http://localhost:5000/api/survey/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSurvey(surveyRes.data);

      } catch (err) {
        console.error("Error loading data:", err.response ? err.response.data : err.message);
        setError("Failed to load survey details or user data. Please try again.");

        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          alert("Session expired or unauthorized. Please log in again.");
        } else if (err.response && err.response.status === 403) {
          setError(err.response.data.msg || "Access denied to this survey.");
          setSurvey({});
        }
      } finally {
        setLoadingSurvey(false);
        setLoadingUser(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const isEditable = () => {
    if (!survey || !currentUser) return false;

    if (currentUser.role === 'admin' || currentUser.role === 'supervisor') {
      return true;
    }

    const surveyCreationDate = new Date(survey.createdAt);
    const today = new Date();
    const daysDiff = differenceInDays(today, surveyCreationDate);

    return daysDiff <= 10;
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this survey?")) return;
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

  if (loadingSurvey || loadingUser) {
    return (
      <div className="d-flex justify-content-center align-items-center text-white" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-5 text-danger">{error}</div>;
  }

  if (!survey || Object.keys(survey).length === 0) {
    return <div className="text-center p-5 text-white">Survey not found or access denied.</div>;
  }

  const total = Number(survey.totalAmount || 0);
  const received = Number(survey.amountReceived || 0);
  const due = total - received;

  const isNormalUser = currentUser && currentUser.role === 'user';
  const isSurveyOlderThan10Days = survey && survey.createdAt ? differenceInDays(new Date(), new Date(survey.createdAt)) > 10 : false;
  const hideSensitiveContent = isNormalUser && isSurveyOlderThan10Days;

  return (
    <div className="container-fluid px-4 py-4 " id="pdf-content">
      <h1
        className="mb-4 text-center fw-bold"
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '2.8rem',                   // क्लाइंट नाम का बेस फ़ॉन्ट साइज़
        color: '#007C80',                    // क्लाइंट नाम का रंग
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
          borderBottom: '2px solid rgba(0, 124, 128, 0.5)', // क्लाइंट नाम के नीचे बॉर्डर
          paddingBottom: '10px',
          lineHeight: '1.2',
        }}
      >
        <span
          style={{
            fontSize: '1.8rem',    // "Survey Details for:" के लिए छोटा फ़ॉन्ट साइज़
          color: '#007C80',     // "Survey Details for:" के लिए अलग सायन शेड
            fontWeight: 'normal',  // इसे कम बोल्ड रखें
            display: 'block',      // इसे अपनी लाइन पर रखने के लिए
            marginBottom: '5px',   // क्लाइंट नाम से थोड़ी दूरी
          }}
        >
          Survey Details for : {survey.clientName}
        </span>
        
      </h1> {/* Corrected to h1 from h2, and added bold */}

      <div className="row gy-3">
        <InfoRow label="Surveyed By" value={survey.surveyedBy} />
        <InfoRow label="Survey Date" value={new Date(survey.surveyDate).toLocaleDateString()} />
        <InfoRow label="Total Amount" value={`₹${total}`} />
        <InfoRow label="Amount Received" value={`₹${received}`} />
        <InfoRow label="Due" value={`₹${due}`} />
        <InfoRow label="Progress" value={survey.progress} />

        {/* Conditional rendering for Document (PDF) */}
        {hideSensitiveContent ? (
          <div className="col-12 alert alert-warning" role="alert">
            Document access restricted for normal users on surveys older than 10 days.
          </div>
        ) : (
          survey.file && (
            <InfoRow
              label="Document"
              valueNode={ // Using valueNode for a custom link element
                <a
                  href={survey.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fw-bold text-decoration-none bg-light border px-3 py-2 text-dark"
                  style={{ display: 'block', width: '70%' }} // Ensure it fills the InfoRow's value div
                >
                  View Attached Document
                </a>
              }
            />
          )
        )}

        {/* Conditional rendering for Images */}
        {hideSensitiveContent ? (
          <div className="col-12 alert alert-warning" role="alert">
            Image access restricted for normal users on surveys older than 10 days.
          </div>
        ) : (
          survey.images?.length > 0 && (
            <div className="col-12">
              <label className="fw-bold d-block mb-2 ">Uploaded Images:</label>
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
          )
        )}

        {/* Modified: Site Location using InfoRow */}
        {survey.latitude && survey.longitude && (
          <InfoRow
            label="Site Location"
            valueNode={ // Using valueNode for the map link button
              <a
                href={`https://maps.google.com/?q=$${survey.latitude},${survey.longitude}`} // Corrected Google Maps URL
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary"
              >
                View on Map
              </a>
            }
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-wrap gap-3 mt-4">
        {isEditable() && (
          <button
            className="btn" // Bootstrap की मूल बटन स्टाइल के लिए 'btn' रखें
            style={{
              color: '#007C80',       // एक गहरा cyan shade, आप अपनी पसंद का hex code डाल सकते हैं
              borderColor: '#007C80', // Border भी उसी shade का
              backgroundColor: 'transparent', // Outline के लिए बैकग्राउंड ट्रांसपेरेंट
              // यहां कोई भी :hover, :active, या :focus स्टाइल नहीं जोड़ा जा सकता
            }}
            onClick={() => navigate(`/edit/${survey._id}`)}
          >
            Edit
          </button>
        )}
        <button
          className="btn"
          style={{
            color: '#007C80',
            borderColor: '#007C80',
            backgroundColor: 'transparent',
          }}
          onClick={handleDelete}
        >
          Delete
        </button>
        <button
          className="btn ms-auto" // ms-auto को यहाँ भी रखें
          style={{
            color: '#007C80',
            borderColor: '#007C80',
            backgroundColor: 'transparent',
          }}
          onClick={generatePDF}
        >
          Download Report
        </button>
      </div>

      {!isEditable() && currentUser.role === 'user' && (
        <p className="mt-3 text-muted">Editing disabled for normal users after 10 days.</p>
      )}
    </div>
  );
}; // <--- SurveyDetail component ends here


// Helper component for cleaner info rows
const InfoRow = ({ label, value, valueNode }) => ( // Added valueNode prop
  <div className="col-12 d-flex">
    <label className="fw-bold me-3 " style={{ minWidth: '160px' }}>{label}:</label>
    {valueNode ? ( // If valueNode is provided, render it inside the value div
      <div className="flex-grow-1 bg-light border px-3 py-2 w-100 text-dark d-flex align-items-center">
          {valueNode}
      </div>
    ) : ( // Otherwise, render the plain value
      <div className="flex-grow-1 bg-light border px-3 py-2 w-100 text-dark">{value}</div>
    )}
  </div>
);

export default SurveyDetail;















// {/* {/* // import React, { useEffect, useState } from 'react';
// // import axios from 'axios';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import jsPDF from 'jspdf';
// // import html2canvas from 'html2canvas';
// // import { differenceInDays } from 'date-fns';

// // const SurveyDetail = () => { */}
// {/* //   const { id } = useParams();
// //   const [survey, setSurvey] = useState(null);
// //   const [user, setUser] = useState({ role: 'admin' }); // Replace with actual user role logic
// //   const navigate = useNavigate();

// //   useEffect(() => { */}
// {/* ////   const fetchSurvey = async () => { */}
// //       try {
//         const res = await axios.get(`http://localhost:5000/api/survey/${id}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });
//         setSurvey(res.data);
//       } catch (err) {
//         alert("Error loading survey.");
//       }
//     };
//     fetchSurvey();
//   }, [id]);

//   const isEditable = () => {
//     const surveyDate = new Date(survey.createdAt);
//     const today = new Date();
//     const daysDiff = differenceInDays(today, surveyDate);
//     return daysDiff <= 10 || user.role === 'admin' || user.role === 'supervisor';
//   };

//   const handleDelete = async () => {
//     if (!window.confirm("Are you sure you want to delete this survey?")) return;
//     try {
//       await axios.delete(`http://localhost:5000/api/survey/${id}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });
//       alert("Survey deleted successfully");
//       navigate("/dashboard");
//     } catch (err) {
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

//   if (!survey) return <div className="text-center p-5">Loading...</div>;

//   const total = Number(survey.totalAmount || 0);
//   const received = Number(survey.amountReceived || 0);
//   const due = total - received;

//   return (
//     <div className="container-fluid px-4 py-4" id="pdf-content">
//       <h2 className="mb-4 text-center">{survey.clientName}</h2>

//       <div className="row gy-3">
//         <InfoRow label="Surveyed By" value={survey.surveyedBy} />
//         <InfoRow label="Survey Date" value={new Date(survey.surveyDate).toLocaleDateString()} />
//         <InfoRow label="Total Amount" value={`₹${total}`} />
//         <InfoRow label="Amount Received" value={`₹${received}`} />
//         <InfoRow label="Due" value={`₹${due}`} />
//         <InfoRow label="Progress" value={survey.progress} />

//         {survey.file && (
//           <div className="col-12 d-flex">
//             <label className="fw-bold me-3" style={{ minWidth: '160px' }}>Document:</label>
//             <a
//               href={survey.file}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="fw-bold text-decoration-none bg-light border px-3 py-2 w-100"
//             >
//               View Attached Document
//             </a>
//           </div>
//         )}

//         {survey.images?.length > 0 && (
//           <div className="col-12">
//             <label className="fw-bold d-block mb-2">Uploaded Images:</label>
//             <div className="d-flex flex-wrap gap-3">
//               {survey.images.map((img, index) => (
//                 <img
//                   key={index}
//                   src={img}
//                   alt={`Uploaded ${index}`}
//                   style={{
//                     width: '200px',
//                     height: 'auto',
//                     objectFit: 'cover',
//                     border: '1px solid #ccc',
//                     borderRadius: '6px'
//                   }}
//                 />
//               ))}
//             </div>
//           </div>
//         )}

//         {survey.latitude && survey.longitude && (
//           <div className="col-12 d-flex">
//             <label className="fw-bold me-3" style={{ minWidth: '160px' }}>Site Location:</label>
//             <a
//               href={`https://www.google.com/maps?q=${survey.latitude},${survey.longitude}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="btn btn-sm btn-primary"
//             >
//               View on Map
//             </a>
//           </div>
//         )}
//       </div>

//       {/* Action Buttons */}
//       <div className="d-flex flex-wrap gap-3 mt-4">
//         {isEditable() && (
//           <button className="btn btn-outline-success" onClick={() => navigate(`/edit/${survey._id}`)}>
//             Edit
//           </button>
//         )}
//         <button className="btn btn-outline-danger" onClick={handleDelete}>
//           Delete
//         </button>
//         <button className="btn btn-outline-secondary ms-auto" onClick={generatePDF}>
//           Download Report
//         </button>
//       </div>

//       {!isEditable() && (
//         <p className="mt-3 text-muted">Editing disabled after 10 days.</p>
//       )}
//     </div>
//   );
// };

// // Helper component for cleaner info rows
// const InfoRow = ({ label, value }) => (
//   <div className="col-12 d-flex">
//     <label className="fw-bold me-3" style={{ minWidth: '160px' }}>{label}:</label>
//     <div className="flex-grow-1 bg-light border px-3 py-2 w-100">{value}</div>
//   </div>
// );

// export default SurveyDetail;






















 


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





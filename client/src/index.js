import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ✅ Correct: this is the main router
//import './index.css'; // optional, if you have global styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



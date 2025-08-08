import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import ProtectedRoute from './pages/protectedRoute';
 import SurveyDetail from './pages/SurveyDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
       

        <Route path="/survey/:id" element={<ProtectedRoute><SurveyDetail /></ProtectedRoute>} />

        <Route path="/create" element={
          <ProtectedRoute><CreateProject /></ProtectedRoute>
        } />

        <Route path="/edit/:id" element={
          <ProtectedRoute><EditProject /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

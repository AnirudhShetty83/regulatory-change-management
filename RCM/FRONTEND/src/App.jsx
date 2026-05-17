import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import List from './pages/List';
import Form from './pages/Form';
import Dashboard from './pages/Dashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import Chatbox from './components/Chatbox';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const WorkerRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" />;
  if (role === 'WORKER') return children;
  return <Navigate to="/list" />;
};

export default function App() {
  const role = localStorage.getItem('role');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={role === 'WORKER' ? "/worker-dashboard" : "/list"} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/list" element={
          <ProtectedRoute><List /></ProtectedRoute>
        } />
        <Route path="/form" element={
          <ProtectedRoute><Form /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/worker-dashboard" element={
          <WorkerRoute><WorkerDashboard /></WorkerRoute>
        } />
      </Routes>
      {localStorage.getItem('token') && <Chatbox />}
    </BrowserRouter>
  );
}

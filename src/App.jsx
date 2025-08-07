// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Signup';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import CommunityPost from './pages/CommunityPost';
import AdminContentManagement from './pages/AdminPosts';
import DoctorDashboard from './pages/DoctorAppointments';
import AdminAppointments from './pages/AdminAppointment';
import Reports from './pages/Report';
import CommunicationHub from './pages/Chat';
import PatientDashboard from './pages/PatientAppointment';
import Groups from './pages/Group';

const App = () => {
    const [role, setRole] = useState(localStorage.getItem('role'));

    useEffect(() => {
        const handleRoleChange = () => {
            setRole(localStorage.getItem('role'));
        };
        window.addEventListener('roleChange', handleRoleChange);
        return () => {
            window.removeEventListener('roleChange', handleRoleChange);
        };
    }, []);

    return (
        <BrowserRouter>
            {!role && <Navbar />}
            {(role === 'patient') && <Navbar loggedIn />}
<div className="flex">
  {/* Sidebar for admin and doctor */}
  {(role === 'admin' || role === 'doctor') && role !== null && <Sidebar />}

  {/* Main content area with conditional left margin */}
  <div className={`flex-1 p-4 ${role === 'admin' || role === 'doctor' ? 'ml-64' : ''}`}>
    <Routes>
        
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forum" element={<CommunityPost />} />
                        <Route path="/chat" element={<CommunicationHub />} />
                        <Route path="/adminforums" element={<AdminContentManagement />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                        <Route path="/appointments" element={<PatientDashboard />} />
                        <Route path="/admin-appointments" element={<AdminAppointments />} />
                        <Route path="/manage-users" element={<ManageUsers />} />
                        <Route path="/groups" element={<Groups/>} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
};

export default App;
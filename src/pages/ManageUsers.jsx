import React, { useState, useEffect } from 'react';
import API_URL from '../api';
import axios from 'axios';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [userForm, setUserForm] = useState({ username: '', name: '', email: '', phone: '', address: '', skills: '', experience: '', education: '', role: 'user', password: '' });

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`${API_URL}/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user.id);
        setUserForm({ ...user, password: '' }); // Don't overwrite password
        setShowForm(true);
    };

    const handleSubmit = async () => {
        try {
            if (editingUser) {
                const updatedData = { ...userForm };
                if (!updatedData.password) delete updatedData.password; // Remove password if empty
                await axios.put(`${API_URL}/users/${editingUser}`, updatedData);
            } else {
                await axios.post(`${API_URL}/users/register`, userForm);
            }
            fetchUsers();
            setEditingUser(null);
            setUserForm({ username: '', name: '', email: '', phone: '', address: '', skills: '', experience: '', education: '', role: 'user', password: '' });
            setShowForm(false);
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-green-900 px-6 py-4 text-white">
            <h1 className="text-4xl font-extrabold text-white tracking-wide">Manage Users</h1>
                </div>

                <div className="p-6">
                    <button 
                        onClick={() => setShowForm(!showForm)} 
                        className="mb-6 px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300 flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>{showForm ? 'Close Form' : 'Add User'}</span>
                    </button>

                    {showForm && (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 mb-6 animate-fadeIn">
                            <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
                                {editingUser ? 'Edit User' : 'Add User'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input 
                                    type="text" 
                                    placeholder="Username" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    value={userForm.username} 
                                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Name" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    value={userForm.name} 
                                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} 
                                />
                                <input 
                                    type="email" 
                                    placeholder="Email" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    value={userForm.email} 
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Phone" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    value={userForm.phone} 
                                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Address" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    value={userForm.address} 
                                    onChange={(e) => setUserForm({ ...userForm, address: e.target.value })} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Skills" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    value={userForm.skills} 
                                    onChange={(e) => setUserForm({ ...userForm, skills: e.target.value })} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Experience" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    value={userForm.experience} 
                                    onChange={(e) => setUserForm({ ...userForm, experience: e.target.value })} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Education" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    value={userForm.education} 
                                    onChange={(e) => setUserForm({ ...userForm, education: e.target.value })} 
                                />
                                <select 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    value={userForm.role} 
                                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                >
                                    <option value="admin">Admin – Manages the system, creates user accounts, monitors bookings, and troubleshoots issues</option>
<option value="doctor">Doctor – Views appointments, conducts consultations, and updates patient records</option>
<option value="patient">Patient – Registers, books consultations, attends appointments, and accesses medical history</option>

                                </select>
                                <input 
                                    type="password" 
                                    placeholder="Password (Leave blank to keep existing)" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                                    value={userForm.password} 
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} 
                                />
                            </div>
                            <button 
                                className="mt-6 w-full bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300 font-semibold"
                                onClick={handleSubmit}
                            >
                                {editingUser ? 'Update' : 'Add'} User
                            </button>
                        </div>
                    )}

                    <div className="overflow-x-auto rounded-lg shadow-lg">
                        <table className="w-full bg-white">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">ID</th>
                                    <th className="py-3 px-6 text-left">Username</th>
                                    <th className="py-3 px-6 text-left">Name</th>
                                    <th className="py-3 px-6 text-left">Email</th>
                                    <th className="py-3 px-6 text-left">Role</th>
                                    <th className="py-3 px-6 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {users.map(user => (
                                    <tr 
                                        key={user.id} 
                                        className="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <td className="py-3 px-6">{user.id}</td>
                                        <td className="py-3 px-6">{user.username}</td>
                                        <td className="py-3 px-6">{user.name}</td>
                                        <td className="py-3 px-6">{user.email}</td>
                                        <td className="py-3 px-6">
                                           <span className={`
  px-3 py-1 rounded-full text-xs font-bold
  ${user.role === 'admin' ? 'bg-red-200 text-red-800' : 
    user.role === 'patient' ? 'bg-green-200 text-green-800' : 
    user.role === 'doctor' ? 'bg-yellow-200 text-yellow-800' :

    'bg-green-200 text-green-800'}
`}>
  {user.role}
</span>

                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center space-x-1"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                    <span>Edit</span>
                                                </button>
                                                <button 
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center space-x-1"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Custom Animation */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ManageUsers;
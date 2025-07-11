import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        skills: '',
        experience: '',
        education: '',
        role: 'user'
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/users/register`, formData);
            alert('Registration Successful');
            navigate('/login');
        } catch (error) {
            alert('Registration Failed: ' + error.response.data.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
                <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6">
                        <h2 className="text-3xl font-extrabold text-white text-center tracking-wider">
                            Create Your Account
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="username" 
                                    placeholder="Username" 
                                    value={formData.username} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
                                />
                                <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Username</span>
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="name" 
                                    placeholder="Full Name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
                                />
                                <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Full Name</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
                                />
                                <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Email</span>
                            </div>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="Password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
                                />
                                <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Password</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="phone" 
                                    placeholder="Phone" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
                                />
                                <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Phone</span>
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="address" 
                                    placeholder="Address" 
                                    value={formData.address} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
                                />
                                <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Address</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="skills" 
                                    placeholder="Skills (comma-separated)" 
                                    value={formData.skills} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
                                />
                                <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Skills</span>
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="experience" 
                                    placeholder="Experience" 
                                    value={formData.experience} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
                                />
                                <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Experience</span>
                            </div>
                        </div>

                        <div className="relative">
                            <input 
                                type="text" 
                                name="education" 
                                placeholder="Education" 
                                value={formData.education} 
                                onChange={handleChange} 
                                required 
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
                            />
                            <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Education</span>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-blue-500 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Create Account
                        </button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Already have an account? 
                                <span 
                                    onClick={() => navigate('/login')} 
                                    className="text-blue-600 hover:text-blue-800 cursor-pointer ml-2 font-semibold"
                                >
                                    Log in
                                </span>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
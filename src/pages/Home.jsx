import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');
    
    // Check for user in memory storage on component mount
    useEffect(() => {
        // Look for either token or role in memory to determine login state
        const token = sessionStorage.getItem('token') || '';
        const role = sessionStorage.getItem('role') || '';
        
        // Consider user logged in if either token or role exists
        setIsLoggedIn(token || role ? true : false);
        setUserRole(role);
    }, []);

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Beautiful background with medical theme */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-teal-50 to-white z-0"></div>
            
            {/* Subtle decorative elements */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-20 right-10 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-40 left-40 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            
            {/* Content container */}
            <div className="relative z-10 container mx-auto px-4 py-24">
                {/* Logo and Title Section */}
                <div className="flex flex-col items-center mb-16">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3 rounded-xl shadow-lg transform transition-transform hover:scale-105 duration-300 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-700 mb-4">
                        MedConnect Rwanda
                    </h1>
                    <p className="text-xl text-gray-700 text-center max-w-2xl">
                        Connecting healthcare professionals for collaborative patient care and seamless medical consultations.
                    </p>
                </div>
                
                {/* Content based on login state and user role */}
                {isLoggedIn ? (
                    // User dashboard preview when logged in
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {userRole === 'admin' && (
                            <>
                                <Link to="/admin/users" className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                                    <div className="bg-red-100 text-red-600 p-3 rounded-lg inline-block mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">User Management</h3>
                                    <p className="text-gray-600">Create and manage doctor and patient accounts in the system.</p>
                                </Link>
                                
                                <Link to="/admin/appointments" className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                                    <div className="bg-green-100 text-green-600 p-3 rounded-lg inline-block mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 0L8 7m8 4l-8 4m8-4h6a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V13a2 2 0 012-2h6z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Monitor Appointments</h3>
                                    <p className="text-gray-600">Track and manage appointment bookings and system activities.</p>
                                </Link>
                                
                                <Link to="/admin/support" className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                                    <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg inline-block mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12l.01.01M12 12l.01.01M12 12l.01.01M12 12l.01.01" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">System Support</h3>
                                    <p className="text-gray-600">Provide technical support and resolve system issues.</p>
                                </Link>
                            </>
                        )}
                        
                        {userRole === 'doctor' && (
                            <>
                                <Link to="/doctor/appointments" className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                                    <div className="bg-emerald-100 text-emerald-600 p-3 rounded-lg inline-block mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 0L8 7m8 4l-8 4m8-4h6a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V13a2 2 0 012-2h6z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">My Appointments</h3>
                                    <p className="text-gray-600">View and manage your scheduled consultations for today.</p>
                                </Link>
                                
                                <Link to="/doctor/consultations" className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                                    <div className="bg-teal-100 text-teal-600 p-3 rounded-lg inline-block mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Consultations</h3>
                                    <p className="text-gray-600">Conduct consultations and update patient records.</p>
                                </Link>
                                
                                <Link to="/doctor/collaborate" className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                                    <div className="bg-purple-100 text-purple-600 p-3 rounded-lg inline-block mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
                                    <p className="text-gray-600">Collaborate with other doctors for complex cases and consultations.</p>
                                </Link>
                            </>
                        )}
                        
                        {userRole === 'patient' && (
                            <>
                                <Link to="/patient/book" className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                                    <div className="bg-green-100 text-green-600 p-3 rounded-lg inline-block mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 0L8 7m8 4l-8 4m8-4h6a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V13a2 2 0 012-2h6z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Book Appointment</h3>
                                    <p className="text-gray-600">Schedule consultations with available doctors based on your needs.</p>
                                </Link>
                                
                                <Link to="/patient/appointments" className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                                    <div className="bg-emerald-100 text-emerald-600 p-3 rounded-lg inline-block mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">My Appointments</h3>
                                    <p className="text-gray-600">View your upcoming and past consultations.</p>
                                </Link>
                                
                                <Link to="/patient/history" className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                                    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg inline-block mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Medical History</h3>
                                    <p className="text-gray-600">Access your medical records, prescriptions, and health progress.</p>
                                </Link>
                            </>
                        )}
                    </div>
                ) : (
                    // For visitors who are not logged in
                    <div className="grid md:grid-cols-2 gap-16 mb-16 items-center">
                        {/* Information side */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Doctor Collaboration</h3>
                                        <p className="text-gray-600">Enable seamless collaboration between healthcare professionals for enhanced patient care and medical expertise sharing.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 0L8 7m8 4l-8 4m8-4h6a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V13a2 2 0 012-2h6z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Appointment Management</h3>
                                        <p className="text-gray-600">Streamlined appointment booking system for patients and efficient schedule management for healthcare providers.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="bg-cyan-100 text-cyan-600 p-2 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Medical Records</h3>
                                        <p className="text-gray-600">Secure digital medical records system allowing patients to access their health history and doctors to update treatment information.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Telemedicine</h3>
                                        <p className="text-gray-600">Remote consultation capabilities enabling healthcare access from anywhere, improving patient convenience and care continuity.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Sign up card */}
                        <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl border border-white border-opacity-20 p-8 md:p-10 max-w-md mx-auto w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Join MedConnect</h2>
                            <p className="text-gray-600 mb-8 text-center">
                                Connect with our healthcare network for collaborative patient care and seamless medical consultations.
                            </p>
                            
                            <div className="space-y-4">
                                <Link 
                                    to="/register" 
                                    className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-0.5"
                                >
                                    Register Now
                                </Link>
                                
                                <Link 
                                    to="/login" 
                                    className="block w-full bg-white hover:bg-gray-50 text-emerald-600 font-medium py-3 px-6 rounded-xl border border-emerald-100 shadow-md hover:shadow-lg transition-all duration-300 text-center transform hover:-translate-y-0.5"
                                >
                                    Sign In
                                </Link>
                            </div>
                            
                            <div className="mt-8 text-center text-sm text-gray-500">
                                Join healthcare professionals and patients in Rwanda's premier medical collaboration platform.
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Success Stories Section */}
                <div className="bg-white bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-8 mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Success Stories</h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                                    DM
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-semibold">Dr. Marie K.</h4>
                                    <p className="text-sm text-gray-500">Cardiologist</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">"MedConnect has revolutionized how I collaborate with specialists. The seamless consultation system has improved patient outcomes significantly."</p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg">
                                    JB
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-semibold">Jean Baptiste</h4>
                                    <p className="text-sm text-gray-500">Patient</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">"Booking appointments is now so simple, and I can access all my medical records in one place. The telemedicine feature saved me during the pandemic."</p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-lg">
                                    DN
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-semibold">Dr. Nelly A.</h4>
                                    <p className="text-sm text-gray-500">General Practitioner</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">"The collaboration features help me consult with specialists instantly for complex cases. Patient care has never been more efficient."</p>
                        </div>
                    </div>
                </div>
                
                {/* Call to action */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-700 mb-6">
                        Transform Healthcare in Rwanda
                    </h2>
                    <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                        Join the revolution in healthcare collaboration. Connect with medical professionals and patients for better health outcomes.
                    </p>
                    
                    {!isLoggedIn && (
                        <Link 
                            to="/register" 
                            className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-0.5"
                        >
                            Get Started
                        </Link>
                    )}
                </div>
            </div>
            
            {/* Footer */}
            <footer className="relative z-10 mt-auto bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg border-t border-gray-100 py-8">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} MedConnect Rwanda. Connecting healthcare professionals for better patient care.</p>
                    <p className="mt-2">A platform dedicated to revolutionizing healthcare collaboration in Rwanda.</p>
                </div>
            </footer>
        </div>
    );
};

// Add animation styles
const animationStyles = `
@keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
    animation: blob 7s infinite;
}

.animation-delay-2000 {
    animation-delay: 2s;
}

.animation-delay-4000 {
    animation-delay: 4s;
}
`;

// Add animation styles to document head
if (typeof document !== 'undefined' && !document.getElementById('animation-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'animation-styles';
    styleElement.innerHTML = animationStyles;
    document.head.appendChild(styleElement);
}

export default Home;
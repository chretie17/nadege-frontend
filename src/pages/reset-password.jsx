import React, { useState, useEffect } from 'react';

const SimplePasswordReset = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showMessage, setShowMessage] = useState({ visible: false, text: '', type: 'success' });
    const [token, setToken] = useState('');

    const API_BASE = 'http://localhost:5000/api';

    // Extract token from URL on component mount
   useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
        setToken(urlToken);
    }
}, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simple validation
        if (newPassword !== confirmPassword) {
            displayMessage('Passwords do not match!', 'error');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            displayMessage('Password must be at least 6 characters long!', 'error');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/users/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    token: token, 
                    newPassword 
                })
            });

            const data = await response.json();

            if (response.ok) {
                displayMessage(data.message || 'Password reset successfully!', 'success');
                
                // Redirect to login page after success
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                displayMessage(data.message || 'Failed to reset password. Please try again.', 'error');
            }
        } catch (error) {
            displayMessage('Network error. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const displayMessage = (text, type = 'success') => {
        setShowMessage({ visible: true, text, type });
        setTimeout(() => {
            setShowMessage({ visible: false, text: '', type: 'success' });
        }, 4000);
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-green-50 to-green-50">
            {/* Left side - MedConnect Rwanda description */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-700 text-white p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="white" strokeWidth="0.5" />
                        <path d="M0,0 L100,100 M100,0 L0,100" stroke="white" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="0.5" />
                        <path d="M30,50 L45,60 L70,35" stroke="white" strokeWidth="1" fill="none" />
                    </svg>
                </div>
                
                <div className="relative z-10 max-w-md">
                    <div className="flex items-center mb-8 space-x-3">
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">MedConnect Rwanda</h1>
                    </div>
                    
                    <h2 className="text-2xl font-semibold mb-6">Secure Password Reset</h2>
                    
                    <p className="text-white/80 mb-12 leading-relaxed">
                        Create a new secure password for your MedConnect Rwanda account. Your password should be strong and unique to protect your medical data.
                    </p>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <div className="text-green-200 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="font-medium text-xl mb-2">Password Security</h3>
                        <ul className="text-white/70 space-y-2">
                            <li>• Minimum 6 characters required</li>
                            <li>• Use a combination of letters and numbers</li>
                            <li>• Keep your password confidential</li>
                            <li>• Your data is encrypted and secure</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            {/* Right side - Reset form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {/* Mobile-only logo */}
                    <div className="flex items-center mb-8 lg:hidden">
                        <div className="bg-green-600 p-2 rounded-lg shadow-md mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">MedConnect Rwanda</h1>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="px-8 pt-8 pb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">Reset Your Password</h2>
                            <p className="text-gray-500 mb-8">Create a new secure password for your account</p>
                            
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="newPassword"
                                            type="password"
                                            required
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            placeholder="Enter new password (min 6 characters)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            required
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-white font-medium text-sm
                                        ${isLoading 
                                            ? 'bg-green-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-300'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating Password...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Reset Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-600">
                                Remember your password? 
                                <a href="/login" className="ml-1 font-medium text-green-600 hover:text-green-800 transition-colors">
                                    Back to Login
                                </a>
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 mb-4">
                            Secure healthcare collaboration platform
                        </p>
                        <div className="flex justify-center space-x-6">
                            <div className="flex items-center text-xs text-gray-400">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                HIPAA Compliant
                            </div>
                            <div className="flex items-center text-xs text-gray-400">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Encrypted Data
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                        <span className="text-xs text-gray-500">
                            By resetting your password, you agree to our 
                            <a href="#" className="text-green-600 hover:underline ml-1">Terms of Service</a> and 
                            <a href="#" className="text-green-600 hover:underline ml-1">Privacy Policy</a>
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Message Snackbar */}
            {showMessage.visible && (
                <div className={`fixed bottom-4 right-4 z-50 rounded-lg shadow-xl max-w-sm overflow-hidden ${
                    showMessage.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                } transition-all duration-300 animate-fade-in`}>
                    <div className="flex items-center px-4 py-3">
                        <svg className="h-6 w-6 text-white mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {showMessage.type === 'error' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            )}
                        </svg>
                        <p className="text-white pr-2 text-sm">{showMessage.text}</p>
                    </div>
                    <div className="h-1 bg-white/20">
                        <div className="h-full bg-white/40 animate-shrink"></div>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-shrink {
                    animation: shrink 4s linear forwards;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default SimplePasswordReset;
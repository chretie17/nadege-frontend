import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import API_URL from '../api';
import axios from 'axios';

const Login = () => {
    const [currentView, setCurrentView] = useState('login'); // 'login', 'forgot', 'reset'
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Login form state
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Forgot password state
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Reset password state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    
    // Common state
    const [isLoading, setIsLoading] = useState(false);
    const [showMessage, setShowMessage] = useState({ visible: false, text: '', type: 'success' });

    // Check for reset token in URL on component mount
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setResetToken(token);
            setCurrentView('reset');
        }
    }, [searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/users/login`, { usernameOrEmail, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.dispatchEvent(new Event('roleChange'));
            
            let welcomeMessage = 'Login successful. Welcome to MedConnect Rwanda!';
            if (response.data.role === 'admin') {
                welcomeMessage = 'Welcome back, Admin! Ready to manage the system.';
            } else if (response.data.role === 'doctor') {
                welcomeMessage = 'Welcome back, Doctor! Your patients are waiting.';
            } else if (response.data.role === 'patient') {
                welcomeMessage = 'Welcome back! Your health journey continues.';
            }
            
            displayMessage(welcomeMessage, 'success');
            
            setTimeout(() => {
                if (response.data.role === 'admin' || response.data.role === 'doctor') {
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
            }, 1500);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Login failed. Please verify your credentials and try again.';
            displayMessage(errorMsg, 'error');
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await axios.post(`${API_URL}/users/forgot-password`, { email });
            displayMessage(response.data.message, 'success');
            setIsEmailSent(true);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to send reset email. Please try again.';
            displayMessage(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            displayMessage('Passwords do not match!', 'error');
            return;
        }

        if (newPassword.length < 6) {
            displayMessage('Password must be at least 6 characters long!', 'error');
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await axios.post(`${API_URL}/users/reset-password`, { 
                token: resetToken, 
                newPassword 
            });
            displayMessage(response.data.message, 'success');
            
            setTimeout(() => {
                setCurrentView('login');
                // Clear URL parameters
                navigate('/login', { replace: true });
            }, 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to reset password. Please try again.';
            displayMessage(errorMsg, 'error');
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

    const resetForm = () => {
        setUsernameOrEmail('');
        setPassword('');
        setEmail('');
        setNewPassword('');
        setConfirmPassword('');
        setIsEmailSent(false);
        setShowMessage({ visible: false, text: '', type: 'success' });
    };

    const switchView = (view) => {
        setCurrentView(view);
        resetForm();
        if (view === 'login') {
            navigate('/login', { replace: true });
        }
    };

    const renderLoginForm = () => (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
            <p className="text-gray-500 mb-8">Access your medical collaboration platform</p>
            
            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Username or Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <input
                            id="usernameOrEmail"
                            type="text"
                            required
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Enter your username or email"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                        />
                    </div>
                </div>
                
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                       <div className="relative">
    <input
        id="password"
        type={showPassword ? "text" : "password"}
        required
        className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
    />
    <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
    >
        {showPassword ? "🙈" : "👁️"}
    </button>
</div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                            Remember me
                        </label>
                    </div>
                    <button 
                        type="button"
                        onClick={() => switchView('forgot')}
                        className="text-sm text-green-600 hover:text-green-800 transition-colors"
                    >
                        Forgot password?
                    </button>
                </div>
                
                <button
                    type="submit"
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
                            Signing in...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                            </svg>
                            Sign in to MedConnect
                        </>
                    )}
                </button>
            </form>
        </>
    );

    const renderForgotPasswordForm = () => (
        <>
            <div className="mb-4">
                <button 
                    onClick={() => switchView('login')}
                    className="flex items-center text-green-600 hover:text-green-800 transition-colors"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Login
                </button>
            </div>

            {!isEmailSent ? (
                <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Reset Password</h2>
                    <p className="text-gray-500 mb-8">Enter your email address and we'll send you a link to reset your password</p>
                    
                    <form onSubmit={handleForgotPassword} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
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
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                    Send Reset Link
                                </>
                            )}
                        </button>
                    </form>
                </>
            ) : (
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
                    <p className="text-gray-600 mb-6">We've sent a password reset link to <strong>{email}</strong></p>
                    <div className="space-y-3">
                        <button
                            onClick={() => setIsEmailSent(false)}
                            className="w-full py-2 px-4 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        >
                            Resend Email
                        </button>
                        <button
                            onClick={() => switchView('login')}
                            className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            )}
        </>
    );

    const renderResetPasswordForm = () => (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Set New Password</h2>
            <p className="text-gray-500 mb-8">Create a strong password for your account</p>
            
            <form onSubmit={handleResetPassword} className="space-y-5">
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
                            minLength={6}
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
                            minLength={6}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
                
                <button
                    type="submit"
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
                            Update Password
                        </>
                    )}
                </button>
            </form>
        </>
    );

    const getCurrentFormTitle = () => {
        switch (currentView) {
            case 'forgot': return 'Password Recovery';
            case 'reset': return 'Password Reset';
            default: return 'Welcome Back';
        }
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
                    
                    <h2 className="text-2xl font-semibold mb-6">Connecting Healthcare Professionals</h2>
                    
                    <p className="text-white/80 mb-12 leading-relaxed">
                        MedConnect Rwanda facilitates seamless collaboration between doctors, efficient patient management, 
                        and streamlined healthcare delivery across Rwanda's medical community.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                            <div className="text-green-200 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-lg mb-1">Patient Management</h3>
                            <p className="text-white/70">Comprehensive patient records and appointment scheduling</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                            <div className="text-green-200 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-lg mb-1">Doctor Collaboration</h3>
                            <p className="text-white/70">Seamless consultation and case sharing between doctors</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                            <div className="text-green-200 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-lg mb-1">Appointment System</h3>
                            <p className="text-white/70">Efficient scheduling and appointment management</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                            <div className="text-green-200 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-lg mb-1">Health Analytics</h3>
                            <p className="text-white/70">Track patient progress and system performance</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right side - Dynamic form */}
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
                            {/* Render appropriate form based on current view */}
                            {currentView === 'login' && renderLoginForm()}
                            {currentView === 'forgot' && renderForgotPasswordForm()}
                            {currentView === 'reset' && renderResetPasswordForm()}
                        </div>
                        
                        {/* Footer - only show on login view */}
                        {currentView === 'login' && (
                            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                                <p className="text-sm text-gray-600">
                                    Need access to the system? 
                                    <Link to="/" className="ml-1 font-medium text-green-600 hover:text-green-800 transition-colors">
                                        Contact Administrator
                                    </Link>
                                </p>
                            </div>
                        )}
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
                            By signing in, you agree to our <a href="#" className="text-green-600 hover:underline">Terms of Service</a> and <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
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
        </div>
    );
};

// Add animations styles
if (!document.getElementById('login-animations')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "login-animations";
    styleSheet.type = "text/css";
    styleSheet.innerText = `
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
    `;
    document.head.appendChild(styleSheet);
}

export default Login;
import React, { useState, useEffect } from 'react';

// Mock navigation utilities since react-router-dom can't be imported
const useNavigate = () => {
    return (path) => {
        window.location.href = path;
    };
};

const Link = ({ to, children, className, onClick }) => {
    const handleClick = (e) => {
        if (onClick) onClick(e);
        window.location.href = to;
    };

    return (
        <a href={to} className={className} onClick={handleClick}>
            {children}
        </a>
    );
};

const Navbar = ({ loggedIn }) => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };
        
        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);
    
    const handleLogout = () => {
        // Remove all user-related items from localStorage
        localStorage.removeItem('role');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        
        // Clear any other user-specific local storage items
        localStorage.clear(); // Optional: use this if you want to clear all local storage

        // Redirect to login page
        window.location.href = '/login';
    };
    
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };
    
    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${
            scrolled 
                ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-100' 
                : 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 dark:from-blue-950 dark:via-blue-900 dark:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border-b border-blue-800/20 hover:border-blue-700/30'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo section with refined styling */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link 
                            to="/" 
                            className={`flex items-center space-x-3 group transition-all duration-300 ${
                                scrolled ? 'text-blue-700' : 'text-white'
                            }`}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-9 w-9 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 ${
                                    scrolled ? 'text-blue-600' : 'text-white/90'
                                }`} 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            <span className={`font-bold text-xl tracking-tight transition-all duration-300 group-hover:tracking-wide group-hover:text-opacity-90 ${
                                scrolled ? 'text-gray-800' : 'text-white'
                            }`}>
                                Empower
                            </span>
                        </Link>
                    </div>
                    
                    {/* Desktop menu with enhanced interactivity */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-4">
                            <Link 
                                to="/" 
                                className={`px-3 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                                    scrolled 
                                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-blue-100' 
                                        : 'text-blue-100 hover:text-white hover:bg-white/20 hover:shadow-white/20'
                                }`}
                            >
                                Home
                            </Link>
                            
                            {!loggedIn ? (
                                <>
                                    <Link 
                                        to="/login" 
                                        className={`px-3 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                                            scrolled 
                                                ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-blue-100' 
                                                : 'text-blue-100 hover:text-white hover:bg-white/20 hover:shadow-white/20'
                                        }`}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                            scrolled
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                                : 'bg-white text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg'
                                        }`}
                                    >
                                        Register
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/jobs" 
                                        className={`px-3 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                                            scrolled 
                                                ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-blue-100' 
                                                : 'text-blue-100 hover:text-white hover:bg-white/20 hover:shadow-white/20'
                                        }`}
                                    >
                                        Jobs
                                    </Link>
                                    <Link 
                                        to="/userapplications" 
                                        className={`px-3 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                                            scrolled 
                                                ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-blue-100' 
                                                : 'text-blue-100 hover:text-white hover:bg-white/20 hover:shadow-white/20'
                                        }`}
                                    >
                                        Your Applications
                                    </Link>
                                    <Link 
                                        to="/skillsassessment" 
                                        className={`px-3 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                                            scrolled 
                                                ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-blue-100' 
                                                : 'text-blue-100 hover:text-white hover:bg-white/20 hover:shadow-white/20'
                                        }`}
                                    >
                                        Skills Assesment
                                    </Link>
                                    <Link 
                                        to="/forum" 
                                        className={`px-3 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                                            scrolled 
                                                ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-blue-100' 
                                                : 'text-blue-100 hover:text-white hover:bg-white/20 hover:shadow-white/20'
                                        }`}
                                    >
                                        Forums
                                    </Link>
                                    <button 
                                        onClick={handleLogout} 
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                            scrolled 
                                                ? 'border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-600' 
                                                : 'border-white/60 text-white hover:bg-red-500/20 hover:border-white'
                                        }`}
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Mobile menu button with improved accessibility */}
                    <div className="flex md:hidden">
                        <button 
                            onClick={toggleMobileMenu}
                            className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                scrolled 
                                    ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-500' 
                                    : 'text-white hover:bg-blue-500/50 focus:ring-white'
                            }`}
                            aria-expanded={mobileMenuOpen}
                            aria-label="Toggle mobile menu"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Hamburger and close icons with smoother transitions */}
                            <svg 
                                className={`${mobileMenuOpen ? 'opacity-0 absolute' : 'opacity-100'} h-6 w-6 transition-all duration-300`} 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor" 
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg 
                                className={`${mobileMenuOpen ? 'opacity-100' : 'opacity-0 absolute'} h-6 w-6 transition-all duration-300`} 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor" 
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile menu with smoother transitions and enhanced styling */}
            <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden transition-all duration-500 ease-in-out`}>
                <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg ${
                    scrolled 
                        ? 'bg-white border-t border-gray-200' 
                        : 'bg-gradient-to-b from-blue-700/95 to-blue-800/95 shadow-xl'
                }`}>
                    <Link 
                        to="/" 
                        className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ease-in-out hover:translate-x-2 ${
                            scrolled 
                                ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                                : 'text-white hover:bg-white/20'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Home
                    </Link>
                    
                    {!loggedIn ? (
                        <>
                            <Link 
                                to="/login" 
                                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ease-in-out hover:translate-x-2 ${
                                    scrolled 
                                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                                        : 'text-white hover:bg-white/20'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link 
                                to="/register" 
                                className={`block px-3 py-2 rounded-lg text-base font-semibold transition-all duration-300 ease-in-out hover:translate-x-2 ${
                                    scrolled
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-white text-blue-600 hover:bg-blue-50'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link 
                                to="/jobs" 
                                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ease-in-out hover:translate-x-2 ${
                                    scrolled 
                                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                                        : 'text-white hover:bg-white/20'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Jobs
                            </Link>
                            <Link 
                                to="/userapplications" 
                                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ease-in-out hover:translate-x-2 ${
                                    scrolled 
                                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                                        : 'text-white hover:bg-white/20'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Your Applications
                            </Link>
                            <button 
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }} 
                                className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ease-in-out hover:translate-x-2 ${
                                    scrolled 
                                        ? 'text-red-500 hover:bg-red-50' 
                                        : 'text-white hover:bg-red-500/20'
                                }`}
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
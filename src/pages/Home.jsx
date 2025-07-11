import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // Check for user in localStorage on component mount
    useEffect(() => {
        // Look for either token or role in localStorage to determine login state
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        // Consider user logged in if either token or role exists
        setIsLoggedIn(token || role ? true : false);
    }, []);

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Beautiful background with subtle pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-indigo-50 to-white z-0"></div>
            
            {/* Subtle decorative elements */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-40 left-40 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            
            {/* Content container */}
            <div className="relative z-10 container mx-auto px-4 py-24">
                {/* Logo and Title Section */}
                <div className="flex flex-col items-center mb-16">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg transform transition-transform hover:scale-105 duration-300 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-4">
                        EmpowerLink
                    </h1>
                    <p className="text-xl text-gray-700 text-center max-w-2xl">
                        Connecting refugees with opportunities, building bridges to a sustainable future.
                    </p>
                </div>
                
                {/* Content based on login state */}
                {isLoggedIn ? (
                    // User dashboard preview when logged in
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        <Link to="/jobs" className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg inline-block mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Browse Jobs</h3>
                            <p className="text-gray-600">Explore open positions matched to your skills and experience.</p>
                        </Link>
                        
                        <Link to="/skillsassessment" className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                            <div className="bg-green-100 text-green-600 p-3 rounded-lg inline-block mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Skills Assessment</h3>
                            <p className="text-gray-600">Evaluate your skills and get personalized recommendations.</p>
                        </Link>
                        
                        <Link to="/forum" className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                            <div className="bg-purple-100 text-purple-600 p-3 rounded-lg inline-block mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Community Forum</h3>
                            <p className="text-gray-600">Connect with others, share experiences, and get support.</p>
                        </Link>
                    </div>
                ) : (
                    // For visitors who are not logged in
                    <div className="grid md:grid-cols-2 gap-16 mb-16 items-center">
                        {/* Information side */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Job Opportunities</h3>
                                        <p className="text-gray-600">Access curated job listings from employers committed to inclusive hiring practices and refugee employment.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Skills Assessment</h3>
                                        <p className="text-gray-600">Identify your strengths and transferable skills to build a roadmap for career success in your new home.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Community Support</h3>
                                        <p className="text-gray-600">Connect with a vibrant community of peers and mentors who understand your journey and can provide guidance.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Resources & Training</h3>
                                        <p className="text-gray-600">Access free educational resources, language training, and professional development courses.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Sign up card */}
                        <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl border border-white border-opacity-20 p-8 md:p-10 max-w-md mx-auto w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Join Our Community</h2>
                            <p className="text-gray-600 mb-8 text-center">
                                Create your free account to access job opportunities, skill assessments, and connect with our supportive community.
                            </p>
                            
                            <div className="space-y-4">
                                <Link 
                                    to="/register" 
                                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-0.5"
                                >
                                    Create Account
                                </Link>
                                
                                <Link 
                                    to="/login" 
                                    className="block w-full bg-white hover:bg-gray-50 text-indigo-600 font-medium py-3 px-6 rounded-xl border border-indigo-100 shadow-md hover:shadow-lg transition-all duration-300 text-center transform hover:-translate-y-0.5"
                                >
                                    Sign In
                                </Link>
                            </div>
                            
                            <div className="mt-8 text-center text-sm text-gray-500">
                                By joining, you'll get personalized job recommendations and resources based on your unique skills and experience.
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Testimonials Section */}
                <div className="bg-white bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 p-8 mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Success Stories</h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                    SA
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-semibold">Sarah A.</h4>
                                    <p className="text-sm text-gray-500">Software Developer</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">"EmpowerLink helped me translate my skills from my home country into opportunities here. Within two months, I found a job that matched my experience."</p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
                                    MK
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-semibold">Mohammed K.</h4>
                                    <p className="text-sm text-gray-500">Healthcare Assistant</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">"The skills assessment helped me identify transferable skills from my previous work. The community here guided me through certification requirements."</p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                                    EL
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-semibold">Elena L.</h4>
                                    <p className="text-sm text-gray-500">Restaurant Owner</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">"From refugee to business owner in three years. The entrepreneurship resources and mentoring provided by EmpowerLink were invaluable to my journey."</p>
                        </div>
                    </div>
                </div>
                
                {/* Call to action */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-6">
                        Start Your Journey Today
                    </h2>
                    <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                        Join thousands of refugees who have found meaningful employment and built new lives with EmpowerLink.
                    </p>
                    
                    {!isLoggedIn && (
                        <Link 
                            to="/register" 
                            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-0.5"
                        >
                            Get Started
                        </Link>
                    )}
                </div>
            </div>
            
            {/* Footer */}
            <footer className="relative z-10 mt-auto bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg border-t border-gray-100 py-8">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} EmpowerLink. Connecting refugees with opportunities.</p>
                    <p className="mt-2">A platform dedicated to building bridges to sustainable futures.</p>
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
import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, Clock, User } from 'lucide-react';

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
    const [showNotifications, setShowNotifications] = useState(false);
    
    // Notification state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    
    // Get user data (mock for this example)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const API_BASE = 'http://localhost:5000/api';
    
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

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user.id) return;
        
        setNotificationsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/notifications/user/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setNotificationsLoading(false);
        }
    };

    // Fetch unread count
    const fetchUnreadCount = async () => {
        if (!user.id) return;
        
        try {
            const response = await fetch(`${API_BASE}/notifications/user/${user.id}/unread-count`);
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.unread_count);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: user.id })
            });
            
            if (response.ok) {
                setNotifications(prev => 
                    prev.map(notif => 
                        notif.id === notificationId 
                            ? { ...notif, is_read: true }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        if (!user.id) return;
        
        try {
            const response = await fetch(`${API_BASE}/notifications/user/${user.id}/read-all`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                setNotifications(prev => 
                    prev.map(notif => ({ ...notif, is_read: true }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: user.id })
            });
            
            if (response.ok) {
                setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
                // Update unread count if the deleted notification was unread
                const deletedNotif = notifications.find(n => n.id === notificationId);
                if (deletedNotif && !deletedNotif.is_read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    // Get notification type icon
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking_confirmation':
                return <Calendar className="h-4 w-4" />;
            case 'status_change':
                return <Clock className="h-4 w-4" />;
            case 'reminder':
                return <Bell className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    // Format notification time
    const formatNotificationTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        
        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        if (loggedIn && user.id) {
            fetchNotifications();
            fetchUnreadCount();
            
            // Poll for new notifications every 30 seconds
            const interval = setInterval(() => {
                fetchUnreadCount();
            }, 30000);
            
            return () => clearInterval(interval);
        }
    }, [loggedIn, user.id]);

    // Handle notification dropdown toggle
    const handleNotificationToggle = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            fetchNotifications();
        }
    };

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showNotifications && !event.target.closest('.notifications-dropdown')) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);
    
    const handleLogout = () => {
        // Remove all user-related items
        const keysToRemove = ['role', 'token', 'userId', 'username', 'email', 'user'];
        keysToRemove.forEach(key => {
            // Note: In actual implementation, you'd use localStorage.removeItem(key)
            // For this demo, we'll just simulate it
            console.log(`Removing ${key} from localStorage`);
        });
        
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
                : 'bg-gradient-to-r from-green-900 via-green-800 to-green-700 dark:from-green-950 dark:via-green-900 dark:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border-b border-green-800/20 hover:border-green-700/30'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo section with refined styling */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link 
                            to="/" 
                            className={`flex items-center space-x-3 group transition-all duration-300 ${
                                scrolled ? 'text-green-700' : 'text-white'
                            }`}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-9 w-9 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 ${
                                    scrolled ? 'text-green-600' : 'text-white/90'
                                }`} 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            <span className={`font-bold text-xl tracking-tight transition-all duration-300 group-hover:tracking-wide group-hover:text-opacity-90 ${
                                scrolled ? 'text-gray-800' : 'text-white'
                            }`}>
                                Med Connect
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
                                        ? 'text-gray-700 hover:text-green-600 hover:bg-green-50 hover:shadow-green-100' 
                                        : 'text-green-100 hover:text-white hover:bg-white/20 hover:shadow-white/20'
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
                                                ? 'text-gray-700 hover:text-green-600 hover:bg-green-50 hover:shadow-green-100' 
                                                : 'text-green-100 hover:text-white hover:bg-white/20 hover:shadow-white/20'
                                        }`}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                            scrolled
                                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                                                : 'bg-white text-green-600 hover:bg-green-50 shadow-md hover:shadow-lg'
                                        }`}
                                    >
                                        Register
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/appointments" 
                                        className={`px-3 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                                            scrolled 
                                                ? 'text-gray-700 hover:text-green-600 hover:bg-green-50 hover:shadow-green-100' 
                                                : 'text-green-100 hover:text-white hover:bg-white/20 hover:shadow-white/20'
                                        }`}
                                    >
                                        Appointments
                                    </Link>
                                    <Link 
                                        to="/forum" 
                                        className={`px-3 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                                            scrolled 
                                                ? 'text-gray-700 hover:text-green-600 hover:bg-green-50 hover:shadow-green-100' 
                                                : 'text-green-100 hover:text-white hover:bg-white/20 hover:shadow-white/20'
                                        }`}
                                    >
                                        Forum
                                    </Link>
                                    <Link 
                                        to="/chat" 
                                        className={`px-3 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                                            scrolled 
                                                ? 'text-gray-700 hover:text-green-600 hover:bg-green-50 hover:shadow-green-100' 
                                                : 'text-green-100 hover:text-white hover:bg-white/20 hover:shadow-white/20'
                                        }`}
                                    >
                                        Chat
                                    </Link>

                                    {/* Notifications Dropdown */}
                                    <div className="relative notifications-dropdown">
                                        <button 
                                            onClick={handleNotificationToggle}
                                            className={`relative p-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                                                scrolled 
                                                    ? 'text-gray-700 hover:text-green-600 hover:bg-green-50 hover:shadow-green-100' 
                                                    : 'text-green-100 hover:text-white hover:bg-white/20 hover:shadow-white/20'
                                            }`}
                                            aria-label="Notifications"
                                        >
                                            <Bell className="h-5 w-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {/* Notifications Dropdown */}
                                        {showNotifications && (
                                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] max-h-96 overflow-hidden">
                                                <div className="p-4 border-b border-gray-200 bg-green-50">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                                        {unreadCount > 0 && (
                                                            <button
                                                                onClick={markAllAsRead}
                                                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                                                            >
                                                                Mark all read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="max-h-80 overflow-y-auto">
                                                    {notificationsLoading ? (
                                                        <div className="p-4 text-center text-gray-500">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                                                            <p className="mt-2">Loading notifications...</p>
                                                        </div>
                                                    ) : notifications.length === 0 ? (
                                                        <div className="p-4 text-center text-gray-500">
                                                            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                            <p>No notifications yet</p>
                                                        </div>
                                                    ) : (
                                                        notifications.map((notification) => (
                                                            <div
                                                                key={notification.id}
                                                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                                                    !notification.is_read ? 'bg-blue-50' : ''
                                                                }`}
                                                            >
                                                                <div className="flex items-start space-x-3">
                                                                    <div className={`flex-shrink-0 p-2 rounded-full ${
                                                                        notification.notification_type === 'booking_confirmation' ? 'bg-green-100 text-green-600' :
                                                                        notification.notification_type === 'status_change' ? 'bg-blue-100 text-blue-600' :
                                                                        'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                        {getNotificationIcon(notification.notification_type)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                                            {notification.message}
                                                                        </p>
                                                                        {notification.related_user_name && (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                {notification.related_user_name}
                                                                                {notification.doctor_specialization && ` - ${notification.doctor_specialization}`}
                                                                            </p>
                                                                        )}
                                                                        <p className="text-xs text-gray-400 mt-1">
                                                                            {formatNotificationTime(notification.sent_at)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1">
                                                                        {!notification.is_read && (
                                                                            <button
                                                                                onClick={() => markAsRead(notification.id)}
                                                                                className="text-green-600 hover:text-green-700 p-1 rounded"
                                                                                title="Mark as read"
                                                                            >
                                                                                <Check className="h-4 w-4" />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => deleteNotification(notification.id)}
                                                                            className="text-red-600 hover:text-red-700 p-1 rounded"
                                                                            title="Delete notification"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                   
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
                                    ? 'text-gray-700 hover:text-green-600 hover:bg-green-50 focus:ring-green-500' 
                                    : 'text-white hover:bg-green-500/50 focus:ring-white'
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
                        : 'bg-gradient-to-b from-green-700/95 to-green-800/95 shadow-xl'
                }`}>
                    <Link 
                        to="/" 
                        className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ease-in-out hover:translate-x-2 ${
                            scrolled 
                                ? 'text-gray-700 hover:text-green-600 hover:bg-green-50' 
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
                                        ? 'text-gray-700 hover:text-green-600 hover:bg-green-50' 
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
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-white text-green-600 hover:bg-green-50'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link 
                                to="/appointments" 
                                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ease-in-out hover:translate-x-2 ${
                                    scrolled 
                                        ? 'text-gray-700 hover:text-green-600 hover:bg-green-50' 
                                        : 'text-white hover:bg-white/20'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Appointments
                            </Link>
                            <Link 
                                to="/forum" 
                                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ease-in-out hover:translate-x-2 ${
                                    scrolled 
                                        ? 'text-gray-700 hover:text-green-600 hover:bg-green-50' 
                                        : 'text-white hover:bg-white/20'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Forum
                            </Link>
                            <Link 
                                to="/chat" 
                                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ease-in-out hover:translate-x-2 ${
                                    scrolled 
                                        ? 'text-gray-700 hover:text-green-600 hover:bg-green-50' 
                                        : 'text-white hover:bg-white/20'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Chat
                            </Link>

                            {/* Mobile Notifications Button */}
                            <button 
                                onClick={() => {
                                    handleNotificationToggle();
                                    setMobileMenuOpen(false);
                                }}
                                className={`flex items-center w-full px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ease-in-out hover:translate-x-2 ${
                                    scrolled 
                                        ? 'text-gray-700 hover:text-green-600 hover:bg-green-50' 
                                        : 'text-white hover:bg-white/20'
                                }`}
                            >
                                <Bell className="h-5 w-5 mr-2" />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            
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
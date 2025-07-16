import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Home,
  Users,
  MessageSquare,
  Briefcase,
  FileText,
  MessageCircle,
  Search,
  Zap,
  Target,
  LogOut,
  Settings,
  Stethoscope
} from 'lucide-react';

const Sidebar = () => {
    const role = localStorage.getItem('role');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setCollapsed(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('roleChange'));
        navigate('/');
    };

    if (!role) return null;

    // Check if a route is active
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Get initials for avatar
    const getInitials = () => {
        if (user && user.name) {
            const names = user.name.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[1][0]}`.toUpperCase();
            }
            return user.name.charAt(0).toUpperCase();
        }
        return role.charAt(0).toUpperCase();
    };

    // Navigation items configuration
    const getNavigationItems = () => {
        const items = [
            {
                path: '/dashboard',
                icon: Home,
                label: 'Dashboard',
                roles: ['admin', 'employer', 'doctor']
            }
        ];

        if (role === 'admin') {
            items.push(
                {
                    path: '/manage-users',
                    icon: Users,
                    label: 'Manage Users',
                    roles: ['admin']
                },
                {
                    path: '/adminforums',
                    icon: MessageSquare,
                    label: 'Manage Forums',
                    roles: ['admin']
                },
                {
                    path: '/chat',
                    icon: MessageCircle,
                    label: 'Chat',
                    roles: ['admin']
                },
                {
                    path: '/reports',
                    icon: FileText,
                    label: 'Reports',
                    roles: ['admin']
                }
            );
        }

        if (role === 'doctor') {
            items.push(
               {
                    path: '/chat',
                    icon: MessageCircle,
                    label: 'Chat',
                    roles: ['doctor']
                },
                {
                    path: '/forum',
                    icon: MessageSquare,
                    label: 'Forum',
                    roles: ['doctor']
                },
                {
                    path: '/doctor-dashboard',
                    icon: Stethoscope,
                    label: 'Appointments',
                    roles: ['doctor']
                }
            );
        }

        return items;
    };

    const navigationItems = getNavigationItems();

    return (
        <>
            {/* Mobile Toggle Button */}
            {isMobile && (
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="fixed z-50 top-4 left-4 p-3 rounded-xl bg-gradient-to-r from-emerald-700 to-green-700 text-white shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 lg:hidden"
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
                </button>
            )}

            {/* Main Sidebar */}
            <aside 
                className={`${
                    collapsed && isMobile ? '-translate-x-full' : 'translate-x-0'
                } fixed z-40 top-0 left-0 h-screen transition-all duration-500 ease-in-out
                ${collapsed && !isMobile ? 'w-20' : 'w-72'} 
                bg-gradient-to-b from-slate-900 via-emerald-900 to-green-900 text-white shadow-2xl border-r border-emerald-700/50 backdrop-blur-sm`}
            >
                <div className="flex flex-col h-full">
                    {/* Header with Logo */}
                    <div className={`flex items-center justify-between px-6 py-5 border-b border-emerald-700/50 ${collapsed && !isMobile ? 'justify-center px-4' : ''}`}>
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 bg-gradient-to-br from-emerald-600 to-green-700 p-2.5 rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-300 group">
                                <Shield className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                            </div>
                            {(!collapsed || isMobile) && (
                                <h2 className="text-xl font-bold text-white tracking-wider animate-fadeIn drop-shadow-md">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Medical</span>
                                    <span className="text-gray-100">Hub</span>
                                </h2>
                            )}
                        </div>
                        
                        {/* Collapse Button (desktop only) */}
                        {!isMobile && (
                            <button 
                                onClick={() => setCollapsed(!collapsed)}
                                className="text-gray-400 hover:text-white hover:bg-emerald-700/50 p-2 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50"
                                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            >
                                {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                            </button>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
                        {navigationItems.map((item, itemIndex) => {
                            const IconComponent = item.icon;
                            const active = isActive(item.path);
                            
                            return (
                                <Link 
                                    key={itemIndex}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative
                                    ${active 
                                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-900/25 transform scale-105' 
                                        : 'text-gray-300 hover:bg-emerald-700/50 hover:text-white hover:transform hover:scale-105'
                                    }`}
                                >
                                    <IconComponent className={`h-5 w-5 ${(!collapsed || isMobile) ? 'mr-3' : ''} transition-transform group-hover:scale-110 duration-300`} />
                                    {(!collapsed || isMobile) && (
                                        <span className="animate-fadeIn font-medium">{item.label}</span>
                                    )}
                                    {active && (!collapsed || isMobile) && (
                                        <ChevronRight className="ml-auto h-4 w-4 animate-pulse" />
                                    )}
                                    {/* Active indicator for collapsed state */}
                                    {active && collapsed && !isMobile && (
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 to-green-500 rounded-r-full"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer with User Info and Logout */}
                    <div className={`mt-auto p-5 border-t border-emerald-700/50 ${collapsed && !isMobile ? 'flex flex-col items-center' : ''}`}>
                        <div className={`${collapsed && !isMobile ? 'text-center' : 'flex items-center mb-4'}`}>
                            <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white font-bold text-lg
                                shadow-lg hover:shadow-emerald-500/25 transform hover:scale-110 transition-all duration-300
                                ${collapsed && !isMobile ? 'mx-auto mb-3' : 'mr-3'}`}>
                                {getInitials()}
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-slate-800 rounded-full animate-pulse"></span>
                            </div>
                            {(!collapsed || isMobile) && (
                                <div className="animate-fadeIn overflow-hidden">
                                    <h3 className="font-semibold tracking-wide text-white truncate">
                                        {user.name || role.charAt(0).toUpperCase() + role.slice(1)}
                                    </h3>
                                    <p className="text-xs text-emerald-300 tracking-wide truncate">
                                        {user.email || `${role}@medicalhub.com`}
                                    </p>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleLogout}
                            className={`w-full flex items-center justify-center px-4 py-3 rounded-xl
                                text-white bg-gradient-to-r from-rose-500 to-pink-600 
                                hover:from-rose-600 hover:to-pink-700 
                                transition-all duration-300 ease-in-out 
                                transform hover:scale-105 shadow-lg hover:shadow-rose-500/25 
                                focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-50
                                ${collapsed && !isMobile ? 'p-3' : ''}`}
                        >
                            <LogOut className={`h-5 w-5 ${collapsed && !isMobile ? '' : 'mr-2'}`} />
                            {(!collapsed || isMobile) && <span className="animate-fadeIn font-medium">Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobile && !collapsed && (
                <div 
                    className="fixed inset-0 bg-black/70 z-30 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setCollapsed(true)}
                ></div>
            )}

            {/* Custom Styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-8px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }

                /* Custom scrollbar */
                nav::-webkit-scrollbar {
                    width: 6px;
                }

                nav::-webkit-scrollbar-track {
                    background: rgba(51, 65, 85, 0.3);
                    border-radius: 10px;
                }

                nav::-webkit-scrollbar-thumb {
                    background: rgba(16, 185, 129, 0.6);
                    border-radius: 10px;
                }

                nav::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 185, 129, 0.8);
                }
            `}</style>
        </>
    );
};

export default Sidebar;
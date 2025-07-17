import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Calendar, Users, Clock, MessageCircle, Bell, User, Activity, TrendingUp, FileText, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = useMemo(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : {};
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  }, []);

  const userId = currentUser?.id;
  const userRole = currentUser?.role || 'admin';

  useEffect(() => {
    if (userId && userRole) {
      fetchDashboardData();
      fetchUserProfile();
      fetchQuickStats();
    } else {
      setError('User authentication required. Please log in again.');
      setLoading(false);
    }
  }, [userId, userRole]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard?userId=${userId}&role=${userRole}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/profile/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const data = await response.json();
      setUserProfile(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchQuickStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/stats?userId=${userId}&role=${userRole}`);
      if (!response.ok) throw new Error('Failed to fetch quick stats');
      const data = await response.json();
      setQuickStats(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = new Date(`2000-01-01 ${timeString}`);
    return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getChartData = () => {
    if (!dashboardData?.stats && !quickStats) return [];
    
    const stats = dashboardData?.stats || {};
    
    if (userRole === 'admin') {
      return [
        { name: 'Patients', value: stats.total_patients || 0, color: '#0d9488' },
        { name: 'Doctors', value: stats.total_doctors || 0, color: '#0891b2' },
        { name: 'Pending', value: stats.pending_appointments || 0, color: '#f59e0b' },
        { name: 'Today', value: stats.today_appointments || 0, color: '#8b5cf6' }
      ];
    } else {
      return [
        { name: 'Total', value: quickStats?.total_appointments || 0, color: '#0d9488' },
        { name: 'Pending', value: quickStats?.pending_appointments || 0, color: '#f59e0b' },
        { name: userRole === 'doctor' ? 'Today' : 'Confirmed', value: quickStats?.today_appointments || quickStats?.confirmed_appointments || 0, color: '#8b5cf6' },
        { name: userRole === 'doctor' ? 'Week' : 'Completed', value: quickStats?.week_appointments || quickStats?.completed_appointments || 0, color: '#0891b2' }
      ];
    }
  };

  const getPieData = () => {
    if (!dashboardData?.stats) return [];
    const { pending_appointments = 0, confirmed_appointments = 0, today_appointments = 0 } = dashboardData.stats;
    return [
      { name: 'Pending', value: pending_appointments, fill: '#f59e0b' },
      { name: 'Confirmed', value: confirmed_appointments, fill: '#10b981' },
      { name: 'Today', value: today_appointments, fill: '#8b5cf6' }
    ];
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-teal-600">{`Value: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-teal-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-green-600 rounded-2xl flex items-center justify-center">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Healthcare Dashboard
                </h1>
                <p className="text-gray-600">Welcome back, {userProfile?.name || currentUser?.name || 'User'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <MessageCircle className="w-6 h-6 text-gray-600 hover:text-teal-600 cursor-pointer transition-colors" />
                {dashboardData?.unread_messages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {dashboardData.unread_messages}
                  </span>
                )}
              </div>
              <div className="relative">
                <Bell 
                  className="w-6 h-6 text-gray-600 hover:text-teal-600 cursor-pointer transition-colors" 
                  onClick={() => window.location.href = '/chat'}
                />
                {dashboardData?.unread_notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {dashboardData.unread_notifications}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-600 to-green-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{userProfile?.name || currentUser?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userRole === 'admin' ? (
            <>
              <StatCard title="Total Patients" value={dashboardData?.stats?.total_patients || 0} icon={Users} color="bg-gradient-to-r from-teal-600 to-teal-700" trend={12} />
              <StatCard title="Total Doctors" value={dashboardData?.stats?.total_doctors || 0} icon={User} color="bg-gradient-to-r from-green-600 to-green-700" trend={8} />
              <StatCard title="Pending Appointments" value={dashboardData?.stats?.pending_appointments || 0} icon={Calendar} color="bg-gradient-to-r from-amber-600 to-amber-700" trend={-5} />
              <StatCard title="Today's Appointments" value={dashboardData?.stats?.today_appointments || 0} icon={Clock} color="bg-gradient-to-r from-purple-600 to-purple-700" trend={15} />
            </>
          ) : (
            <>
              <StatCard title="Total Appointments" value={quickStats?.total_appointments || 0} icon={Calendar} color="bg-gradient-to-r from-teal-600 to-teal-700" trend={10} />
              <StatCard title="Pending" value={quickStats?.pending_appointments || 0} icon={Clock} color="bg-gradient-to-r from-amber-600 to-amber-700" trend={-3} />
              <StatCard title={userRole === 'doctor' ? 'Today' : 'Confirmed'} value={quickStats?.today_appointments || quickStats?.confirmed_appointments || 0} icon={CheckCircle} color="bg-gradient-to-r from-green-600 to-green-700" trend={7} />
              <StatCard title={userRole === 'doctor' ? 'This Week' : 'Completed'} value={quickStats?.week_appointments || quickStats?.completed_appointments || 0} icon={TrendingUp} color="bg-gradient-to-r from-purple-600 to-purple-700" trend={20} />
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Modern Bar Chart */}
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Overview Analytics</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#0f766e" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Enhanced Pie Chart */}
          {userRole === 'admin' && (
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Appointment Distribution</h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Appointments Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Recent Appointments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                  {userRole === 'admin' && (
                    <>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
                    </>
                  )}
                  {userRole === 'doctor' && (
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                  )}
                  {userRole === 'patient' && (
                    <>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Specialization</th>
                    </>
                  )}
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {dashboardData?.recent_appointments?.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{formatDate(appointment.appointment_date)}</div>
                      <div className="text-gray-500">{formatTime(appointment.appointment_time)}</div>
                    </td>
                    {userRole === 'admin' && (
                      <>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.patient_name}</td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.doctor_name}</td>
                      </>
                    )}
                    {userRole === 'doctor' && (
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.patient_name}</td>
                    )}
                    {userRole === 'patient' && (
                      <>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.doctor_name}</td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600">{appointment.specialization}</td>
                      </>
                    )}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!dashboardData?.recent_appointments || dashboardData.recent_appointments.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent appointments found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
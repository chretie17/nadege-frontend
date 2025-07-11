import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import API_URL from '../api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState(null);
  const [skillsDistribution, setSkillsDistribution] = useState([]);
  const [jobMarketTrends, setJobMarketTrends] = useState({ categories: [], data: [] });
  const [applicationFunnel, setApplicationFunnel] = useState([]);
  
  useEffect(() => {
    // Fetch all dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [statsRes, skillsRes, jobTrendsRes, funnelRes] = await Promise.all([
          axios.get(`${API_URL}/dashboard/stats`),
          axios.get(`${API_URL}/dashboard/skills-distribution`),
          axios.get(`${API_URL}/dashboard/job-market-trends`),
          axios.get(`${API_URL}/dashboard/application-funnel`)
        ]);
        
        // Set all data to state
        setDashboardStats(statsRes.data);
        setSkillsDistribution(skillsRes.data);
        setJobMarketTrends(jobTrendsRes.data);
        setApplicationFunnel(funnelRes.data);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format numbers with commas for readability
  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
  };
  
  // Calculate growth percentage and determine if it's positive or negative
  const calculateGrowth = (current, previous) => {
    if (!previous) return { value: 0, isPositive: true };
    const growth = ((current - previous) / previous) * 100;
    return { value: Math.abs(growth).toFixed(1), isPositive: growth >= 0 };
  };

  // Colors for charts
  const CHART_COLORS = {
    primary: '#4f46e5',
    secondary: '#059669',
    accent: '#0ea5e9',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    blue: '#3b82f6',
    teal: '#14b8a6',
    emerald: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444'
  };
  
  // Generate gradient colors for charts
  const gradientOffset = () => {
    if (!applicationFunnel.length) return 0;
    const dataMax = Math.max(...applicationFunnel.map(item => item.count));
    const dataMin = Math.min(...applicationFunnel.map(item => item.count));
    return dataMax <= 0 ? 0 : dataMin / dataMax;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-lg text-indigo-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md max-w-lg">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
          <button 
            className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors duration-300"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Create comparison stats for cards
  const userGrowth = calculateGrowth(
    dashboardStats?.userStats?.totalUsers,
    dashboardStats?.userStats?.totalUsers - dashboardStats?.userStats?.newUsersLast30Days
  );
  
  const jobGrowth = calculateGrowth(
    dashboardStats?.jobStats?.activeJobs,
    dashboardStats?.jobStats?.totalJobs - dashboardStats?.jobStats?.activeJobs
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back. Here's what's happening with your platform today.</p>
            </div>
            <div className="flex space-x-3">
              
            </div>
          </div>
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Total Users Card */}
          <div className="bg-white overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {formatNumber(dashboardStats?.userStats?.totalUsers)}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        userGrowth.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {userGrowth.isPositive ? (
                          <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="self-center flex-shrink-0 h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="sr-only">{userGrowth.isPositive ? 'Increased' : 'Decreased'} by</span>
                        {userGrowth.value}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  {formatNumber(dashboardStats?.userStats?.newUsersLast30Days)} new in last 30 days
                </a>
              </div>
            </div>
          </div>
          
          {/* Active Jobs Card */}
          <div className="bg-white overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {formatNumber(dashboardStats?.jobStats?.activeJobs)}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        jobGrowth.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {jobGrowth.isPositive ? (
                          <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="self-center flex-shrink-0 h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="sr-only">{jobGrowth.isPositive ? 'Increased' : 'Decreased'} by</span>
                        {jobGrowth.value}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="#" className="font-medium text-green-600 hover:text-green-500">
                  Out of {formatNumber(dashboardStats?.jobStats?.totalJobs)} total jobs
                </a>
              </div>
            </div>
          </div>
          
          {/* Success Rate Card */}
          <div className="bg-white overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                    <dd className="mt-1 flex justify-between items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {dashboardStats?.applicationStats?.successRate || 0}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${dashboardStats?.applicationStats?.successRate || 0}%` }}></div>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  {formatNumber(dashboardStats?.applicationStats?.acceptedApplications)} accepted applications
                </a>
              </div>
            </div>
          </div>
          
          {/* Community Engagement Card */}
          <div className="bg-white overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Community Activity</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {formatNumber(
                          (dashboardStats?.communityStats?.newTopicsLast30Days || 0) + 
                          (dashboardStats?.communityStats?.newPostsLast30Days || 0)
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
              <div className="text-sm">
                <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                  New posts & topics in last 30 days
                </a>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Active
              </span>
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Skills Distribution Chart */}
          <div className="bg-white overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Most Common Skills</h2>
                <div className="flex gap-2">
                  <button className="p-1 rounded-md hover:bg-gray-100">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  </button>
                  <button className="p-1 rounded-md hover:bg-gray-100">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </button>
                  <button className="p-1 rounded-md hover:bg-gray-100">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={skillsDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis 
                      dataKey="skillName" 
                      type="category" 
                      width={150} 
                      tick={{ fill: '#4b5563' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Legend verticalAlign="top" height={36} />
                    {jobMarketTrends.categories.map((category, index) => {
                      // Generate different colors for each category
                      const colors = [
                        CHART_COLORS.indigo, 
                        CHART_COLORS.teal, 
                        CHART_COLORS.amber, 
                        CHART_COLORS.purple, 
                        CHART_COLORS.pink, 
                        CHART_COLORS.emerald
                      ];
                      return (
                        <Line 
                          key={category}
                          type="monotone" 
                          dataKey={category} 
                          name={category}
                          stroke={colors[index % colors.length]} 
                          strokeWidth={3}
                          dot={{ strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0 }} 
                        />
                      );
                    })}
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '6px',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="userCount" 
                      name="Users with skill" 
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    >
                      {skillsDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index % 2 === 0 ? CHART_COLORS.indigo : CHART_COLORS.blue} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
         {/* Job Market Trends Chart */}
<div className="bg-white overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
  <div className="p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-gray-900">Job Posting Trends</h2>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <button className="p-1 rounded-md hover:bg-gray-100">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
          </button>
          <span className="mx-2 text-sm font-medium text-gray-700">2025</span>
          <button className="p-1 rounded-md hover:bg-gray-100">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
        <select className="block w-28 py-1 px-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md">
          <option>Monthly</option>
          <option>Quarterly</option>
          <option>Yearly</option>
        </select>
      </div>
    </div>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={jobMarketTrends.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#4b5563' }}
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            tick={{ fill: '#4b5563' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '6px',
              border: 'none',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend verticalAlign="top" height={36} />
          {jobMarketTrends.categories.map((category, index) => {
            // Generate different colors for each category
            const colors = [
              CHART_COLORS.indigo, 
              CHART_COLORS.teal, 
              CHART_COLORS.amber, 
              CHART_COLORS.purple, 
              CHART_COLORS.pink, 
              CHART_COLORS.emerald
            ];
            return (
              <Line 
                key={category}
                type="monotone" 
                dataKey={category} 
                name={category}
                stroke={colors[index % colors.length]} 
                strokeWidth={3}
                dot={{ strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }} 
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
</div>

{/* Application Funnel Chart */}
<div className="mt-8 bg-white overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
  <div className="p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-gray-900">Application Pipeline</h2>
      <div className="flex gap-2">
        <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Last 7 Days
        </button>
        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Last 30 Days
        </button>
        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          All Time
        </button>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={applicationFunnel}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="stage" 
                tick={{ fill: '#4b5563' }}
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                tick={{ fill: '#4b5563' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '6px',
                  border: 'none',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="Applications" 
                stroke="#4f46e5" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUv)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <div className="text-center mb-6">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <div className="mt-1 relative">
            <div className="flex items-center justify-center">
              <span className="text-5xl font-extrabold text-indigo-600">
                {applicationFunnel.length > 0 ? 
                  ((applicationFunnel[applicationFunnel.length - 1].count / applicationFunnel[0].count) * 100).toFixed(1) : 
                  "0"}%
              </span>
            </div>
            <div className="mt-4 text-sm text-gray-900">
              {applicationFunnel.length > 0 ? 
                `${formatNumber(applicationFunnel[applicationFunnel.length - 1].count)} of ${formatNumber(applicationFunnel[0].count)} applications` : 
                "No data available"}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {applicationFunnel.map((stage, index) => (
            <div key={stage.stage} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium text-gray-700">{stage.stage}</h4>
                <span className="text-sm font-bold text-indigo-600">{formatNumber(stage.count)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full" 
                  style={{ 
                    width: `${applicationFunnel.length > 0 ? 
                      (stage.count / applicationFunnel[0].count) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
</main>

{/* Footer */}
<footer className="bg-white border-t border-gray-200 mt-8">
  <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <p className="text-sm text-gray-500">© 2025 Your Company. All rights reserved.</p>
      </div>
      <div className="flex space-x-6">
        <a href="#" className="text-gray-400 hover:text-gray-500">
          <span className="sr-only">Help Center</span>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </a>
        <a href="#" className="text-gray-400 hover:text-gray-500">
          <span className="sr-only">Settings</span>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </a>
        <a href="#" className="text-gray-400 hover:text-gray-500">
          <span className="sr-only">Documentation</span>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</footer>
</div>
);
};

export default Dashboard;
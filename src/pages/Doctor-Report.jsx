import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, TrendingUp, Users, Calendar, Clock } from 'lucide-react';

const DoctorReportsDashboard = () => {
  const [stats, setStats] = useState({});
  const [trends, setTrends] = useState([]);
  const [demographics, setDemographics] = useState({});
  const [patterns, setPatterns] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Get current user (doctor) from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const doctorId = currentUser?.id;
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    if (doctorId) {
      fetchReports();
    }
  }, [doctorId, selectedPeriod]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [statsRes, trendsRes, demoRes, patternsRes, peakRes, patientsRes] = await Promise.all([
        fetch(`${API_BASE}/doctor-reports/${doctorId}/stats?period=${selectedPeriod}`),
fetch(`${API_BASE}/doctor-reports/${doctorId}/trends${getTrendsParams()}`),
        fetch(`${API_BASE}/doctor-reports/${doctorId}/demographics`),
        fetch(`${API_BASE}/doctor-reports/${doctorId}/patterns`),
        fetch(`${API_BASE}/doctor-reports/${doctorId}/peak-hours`),
        fetch(`${API_BASE}/doctor-reports/${doctorId}/recent-patients?limit=10`)
      ]);

      setStats(await statsRes.json());
      setTrends(await trendsRes.json());
      setDemographics(await demoRes.json());
      setPatterns(await patternsRes.json());
      setPeakHours(await peakRes.json());
      setRecentPatients(await patientsRes.json());
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };
const getTrendsParams = () => {
  const today = new Date();
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  switch (selectedPeriod) {
    case 'today':
      const todayStr = formatDate(today);
      return `?start_date=${todayStr}&end_date=${todayStr}`;
    case 'week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `?start_date=${formatDate(startOfWeek)}&end_date=${formatDate(endOfWeek)}`;
    case 'month':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return `?start_date=${formatDate(startOfMonth)}&end_date=${formatDate(endOfMonth)}`;
    case 'year':
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      return `?start_date=${formatDate(startOfYear)}&end_date=${formatDate(endOfYear)}`;
    default:
      return '?months=6'; // fallback to existing behavior
  }
};
  const generatePDF = async () => {
    setDownloadingPdf(true);
    try {
      // Create actual data tables instead of chart placeholders
const trendsData = trends.trends || trends;
const trendsDataTable = trendsData.length > 0 ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Total Appointments</th>
              <th>Completed</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
${trendsData.map(trend => `
                  <tr>
                <td>${trend.month_name}</td>
                <td>${trend.total_appointments}</td>
                <td>${trend.completed_appointments}</td>
                <td>${((trend.completed_appointments / trend.total_appointments) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No trend data available</p>';

      const patternsDataTable = patterns.length > 0 ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Day of Week</th>
              <th>Total Appointments</th>
              <th>Completion Rate</th>
            </tr>
          </thead>
          <tbody>
            ${patterns.map(pattern => `
              <tr>
                <td>${pattern.day_of_week}</td>
                <td>${pattern.total_appointments}</td>
                <td>${pattern.completion_rate || 0}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No pattern data available</p>';

      const peakHoursDataTable = peakHours.length > 0 ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Hour</th>
              <th>Appointments</th>
              <th>Completion Rate</th>
            </tr>
          </thead>
          <tbody>
            ${peakHours.map(hour => `
              <tr>
                <td>${hour.hour_display}</td>
                <td>${hour.appointment_count}</td>
                <td>${hour.completion_rate || 0}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No peak hours data available</p>';

      const appointmentStatusTable = pieData.length > 0 ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${pieData.map(item => {
              const percentage = ((item.value / stats.total_appointments) * 100).toFixed(1);
              return `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.value}</td>
                  <td>${percentage}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      ` : '<p>No status data available</p>';

      const printWindow = window.open('', '_blank');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Doctor Reports - ${currentUser.name || 'Dr. Report'}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              color: #333; 
              line-height: 1.6;
              padding: 20px;
              max-width: 1200px;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #3B82F6; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              margin-bottom: 40px;
            }
            .header h1 { color: white; font-size: 32px; margin-bottom: 10px; }
            .header p { color: #E5E7EB; font-size: 16px; margin: 5px 0; }
            .stats-grid { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              gap: 20px; 
              margin-bottom: 40px;
            }
            .stat-card { 
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              border-radius: 12px; 
              padding: 25px; 
              text-align: center;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .stat-card.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .stat-card.green { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
            .stat-card.purple { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
            .stat-card.red { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
            .stat-card h3 { color: white; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; opacity: 0.9; }
            .stat-card .value { font-size: 32px; font-weight: bold; color: white; }
            .section { 
              margin-bottom: 40px; 
              page-break-inside: avoid;
              background: white;
              border-radius: 10px;
              padding: 25px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .section h2 { 
              color: #1F2937; 
              font-size: 20px; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #E5E7EB; 
              padding-bottom: 10px;
            }
            .demographics-grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 25px;
            }
            .demographics-item { 
              display: flex; 
              justify-content: space-between; 
              padding: 15px 0; 
              border-bottom: 1px solid #F3F4F6;
              font-size: 16px;
            }
            .demographics-item:last-child { border-bottom: none; }
            .demographics-item strong { color: #3B82F6; font-size: 18px; }
            .data-table, .patients-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .data-table th, .data-table td, .patients-table th, .patients-table td { 
              border: 1px solid #E5E7EB; 
              padding: 15px 12px; 
              text-align: left;
            }
            .data-table th, .patients-table th { 
              background: #3B82F6; 
              color: white;
              font-weight: 600; 
              text-transform: uppercase;
              font-size: 12px;
              letter-spacing: 1px;
            }
            .data-table tr:nth-child(even), .patients-table tr:nth-child(even) { background: #F8FAFC; }
            .data-table tr:hover, .patients-table tr:hover { background: #EBF4FF; }
            .footer { 
              margin-top: 50px; 
              padding: 30px; 
              border-top: 3px solid #E5E7EB; 
              text-align: center; 
              background: #F9FAFB;
              border-radius: 10px;
              color: #6B7280; 
              font-size: 14px;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .no-print { display: none; }
              .section { box-shadow: none; border: 1px solid #ddd; }
              .header { background: #3B82F6 !important; }
              .stat-card { background: #f0f0f0 !important; color: #333 !important; }
              .stat-card h3 { color: #666 !important; }
              .stat-card .value { color: #333 !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Doctor Reports Dashboard</h1>
            <p><strong>Generated for:</strong> ${currentUser.name || 'Doctor'}</p>
            <p><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Report Period:</strong> ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card blue">
              <h3>Total Appointments</h3>
              <div class="value">${stats.total_appointments || 0}</div>
            </div>
            <div class="stat-card green">
              <h3>Completion Rate</h3>
              <div class="value">${stats.completion_rate || 0}%</div>
            </div>
            <div class="stat-card purple">
              <h3>Unique Patients</h3>
              <div class="value">${stats.unique_patients || 0}</div>
            </div>
            <div class="stat-card red">
              <h3>Cancellation Rate</h3>
              <div class="value">${stats.cancellation_rate || 0}%</div>
            </div>
          </div>

          <div class="section">
            <h2>📈 Appointment Status Distribution</h2>
            ${appointmentStatusTable}
          </div>

          <div class="section">
            <h2>📊 6-Month Appointment Trends</h2>
            ${trendsDataTable}
          </div>

          <div class="section">
            <h2>📅 Weekly Appointment Patterns</h2>
            ${patternsDataTable}
          </div>

          <div class="section">
            <h2>🕒 Peak Hours Analysis</h2>
            ${peakHoursDataTable}
          </div>

          <div class="section">
            <h2>👥 Patient Demographics</h2>
            <div class="demographics-grid">
              <div>
                <div class="demographics-item">
                  <span>Total Unique Patients:</span>
                  <strong>${demographics.total_unique_patients || 0}</strong>
                </div>
                <div class="demographics-item">
                  <span>Average Patient Age:</span>
                  <strong>${demographics.average_age || 0} years</strong>
                </div>
                <div class="demographics-item">
                  <span>Pediatric Patients (&lt;18):</span>
                  <strong>${demographics.pediatric_patients || 0}</strong>
                </div>
              </div>
              <div>
                <div class="demographics-item">
                  <span>Adult Patients (18-65):</span>
                  <strong>${demographics.adult_patients || 0}</strong>
                </div>
                <div class="demographics-item">
                  <span>Senior Patients (&gt;65):</span>
                  <strong>${demographics.senior_patients || 0}</strong>
                </div>
                <div class="demographics-item">
                  <span>Gender Distribution:</span>
                  <strong>M:${demographics.male_patients || 0} F:${demographics.female_patients || 0}</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>👤 Recent Patients Overview</h2>
            <table class="patients-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Last Visit Date</th>
                  <th>Total Visits</th>
                  <th>Patient Age</th>
                  <th>Visit Status</th>
                </tr>
              </thead>
              <tbody>
                ${recentPatients.slice(0, 15).map(patient => `
                  <tr>
                    <td><strong>${patient.patient_name}</strong></td>
                    <td>${patient.last_visit_formatted}</td>
                    <td><span style="background:#3B82F6;color:white;padding:4px 8px;border-radius:12px;font-size:11px;">${patient.total_visits} visits</span></td>
                    <td>${patient.age || 'N/A'} years</td>
                    <td><span style="background:#10B981;color:white;padding:4px 8px;border-radius:12px;font-size:11px;">${patient.completed_visits}/${patient.total_visits} completed</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <h3 style="margin-bottom: 10px;">Report Summary</h3>
            <p><strong>This comprehensive report contains detailed analytics for the selected time period.</strong></p>
            <p>Generated automatically from the Medical Practice Management System</p>
            <p style="margin-top: 15px;">© ${new Date().getFullYear()} Medical Practice Management System | All Rights Reserved</p>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 1500);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const pieData = [
    { name: 'Completed', value: stats.completed_appointments, color: '#10B981' },
    { name: 'Pending', value: stats.pending_appointments, color: '#F59E0B' },
    { name: 'Cancelled', value: stats.cancelled_appointments, color: '#EF4444' },
    { name: 'No Show', value: stats.no_show_appointments, color: '#6B7280' }
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto" id="dashboard-content">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              Reports Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive analytics and insights</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={generatePDF}
              disabled={downloadingPdf}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {downloadingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Appointments</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.total_appointments || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
                <p className="text-2xl font-bold text-green-600">{stats.completion_rate || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Unique Patients</h3>
                <p className="text-2xl font-bold text-purple-600">{stats.unique_patients || 0}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Cancellation Rate</h3>
                <p className="text-2xl font-bold text-red-600">{stats.cancellation_rate || 0}%</p>
              </div>
              <Clock className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Appointment Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Appointment Trends (6 Months)</h3>
           <ResponsiveContainer width="100%" height={300}>
  <LineChart data={trends.trends || trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month_name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total_appointments" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Total Appointments"
                />
                <Line 
                  type="monotone" 
                  dataKey="completed_appointments" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Appointment Status Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Appointment Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Patterns & Peak Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Patterns */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Weekly Patterns</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={patterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day_of_week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="total_appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Hours */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Peak Hours</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour_display" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="appointment_count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics & Recent Patients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Demographics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Patient Demographics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Total Patients:</span>
                <span className="font-bold text-lg text-blue-600">{demographics.total_unique_patients || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Average Age:</span>
                <span className="font-bold text-lg text-green-600">{demographics.average_age || 0} years</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-bold text-lg">{demographics.pediatric_patients || 0}</div>
                  <div className="text-blue-600 text-sm">Pediatric (&lt;18)</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-bold text-lg">{demographics.adult_patients || 0}</div>
                  <div className="text-green-600 text-sm">Adults (18-65)</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-purple-600 font-bold text-lg">{demographics.senior_patients || 0}</div>
                  <div className="text-purple-600 text-sm">Seniors (&gt;65)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Patients</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Last Visit</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Visits</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentPatients.slice(0, 8).map((patient, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-medium text-gray-900">{patient.patient_name}</td>
                      <td className="py-3 text-gray-600">{patient.last_visit_formatted}</td>
                      <td className="py-3">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          {patient.total_visits}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorReportsDashboard;
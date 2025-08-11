import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Search, Filter, CheckCircle, XCircle, AlertCircle, User, Phone, Mail, Eye, BarChart3, Download } from 'lucide-react';

const AdminAppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [showDetails, setShowDetails] = useState(null);

  // Mock current user since localStorage is not available
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const API_BASE = 'http://localhost:5000/api';

  // Date helper functions - moved above where they're used
  const isToday = (dateString) => {
    const today = new Date().toDateString();
    return new Date(dateString).toDateString() === today;
  };

  const isFuture = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const isPast = (dateString) => {
    return new Date(dateString) < new Date();
  };

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/appointments/all`);
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointment statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/appointments/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, status, cancellationReason = '') => {
    try {
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          updated_by: currentUser.id,
          cancellation_reason: cancellationReason
        })
      });
      
      if (response.ok) {
        fetchAppointments();
        fetchStats();
        alert(`Appointment ${status} successfully`);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, []);

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && isToday(appointment.appointment_date)) ||
      (dateFilter === 'upcoming' && isFuture(appointment.appointment_date)) ||
      (dateFilter === 'past' && isPast(appointment.appointment_date)) ||
      (dateFilter === 'custom' && selectedDate && appointment.appointment_date === selectedDate);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      no_show: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const AppointmentDetails = ({ appointment, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Appointment Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Patient Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {appointment.patient_name}</p>
                  <p><strong>Email:</strong> {appointment.patient_email}</p>
                  <p><strong>Phone:</strong> {appointment.patient_phone}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Doctor Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {appointment.doctor_name}</p>
                  <p><strong>Email:</strong> {appointment.doctor_email}</p>
                  <p><strong>Specialization:</strong> {appointment.doctor_specialization}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Appointment Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Date:</strong> {formatDate(appointment.appointment_date)}</p>
                  <p><strong>Time:</strong> {formatTime(appointment.appointment_time)}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </p>
                  <p><strong>Created:</strong> {formatDate(appointment.created_at)}</p>
                </div>
              </div>
              
              {appointment.reason && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Reason</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded">{appointment.reason}</p>
                </div>
              )}
              
              {appointment.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded">{appointment.notes}</p>
                </div>
              )}
              
              {appointment.cancellation_reason && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cancellation Reason</h3>
                  <p className="text-sm bg-red-50 p-3 rounded">{appointment.cancellation_reason}</p>
                </div>
              )}
            </div>
          </div>
          
          {appointment.status === 'pending' && (
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  updateAppointmentStatus(appointment.id, 'confirmed');
                  onClose();
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Confirm
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Enter cancellation reason:');
                  if (reason) {
                    updateAppointmentStatus(appointment.id, 'cancelled', reason);
                    onClose();
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Appointments Management</h1>
        <p className="text-gray-600 mt-2">View and manage all appointments in the system</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total_appointments || 0, color: 'green', icon: Calendar },
          { label: 'Pending', value: stats.pending_count || 0, color: 'yellow', icon: Clock },
          { label: 'Confirmed', value: stats.confirmed_count || 0, color: 'green', icon: CheckCircle },
          { label: 'Completed', value: stats.completed_count || 0, color: 'green', icon: CheckCircle },
          { label: 'Cancelled', value: stats.cancelled_count || 0, color: 'red', icon: XCircle }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients, doctors, emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="custom">Custom Date</option>
          </select>
          
          {dateFilter === 'custom' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
            />
          )}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Appointments ({filteredAppointments.length})
            </h2>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{appointment.patient_name}</div>
                          <div className="text-sm text-gray-500">{appointment.patient_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{appointment.doctor_name}</div>
                      <div className="text-sm text-gray-500">{appointment.doctor_specialization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(appointment.appointment_date)}</div>
                      <div className="text-sm text-gray-500">{formatTime(appointment.appointment_time)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowDetails(appointment)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter cancellation reason:');
                                if (reason) updateAppointmentStatus(appointment.id, 'cancelled', reason);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {showDetails && (
        <AppointmentDetails
          appointment={showDetails}
          onClose={() => setShowDetails(null)}
        />
      )}
    </div>
  );
};

export default AdminAppointmentsManagement;
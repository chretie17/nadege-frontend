import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, AlertCircle, User, Phone, Mail, Search, Filter, Settings, Save, Plus, Trash2 } from 'lucide-react';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);

  // Get current user (doctor) from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const doctorId = currentUser?.id;

  const API_BASE = 'http://localhost:5000/api';

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  // Fetch doctor's appointments with improved date handling
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Only add date parameter if we're not showing all dates
      if (!showAllDates && selectedDate) {
        params.append('date', selectedDate);
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const url = `${API_BASE}/appointments/doctor/${doctorId}${params.toString() ? '?' + params.toString() : ''}`;
      console.log('Fetching appointments from:', url); // Debug log
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched appointments:', data); // Debug log
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctor's availability
  const fetchAvailability = async () => {
    try {
      const response = await fetch(`${API_BASE}/appointments/doctor/${doctorId}/availability`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Initialize availability with default values for all days
      const availabilityMap = {};
      daysOfWeek.forEach(day => {
        availabilityMap[day.value] = {
          day_of_week: day.value,
          start_time: '09:00',
          end_time: '17:00',
          is_available: false
        };
      });
      
      // Override with existing availability
      data.forEach(slot => {
        availabilityMap[slot.day_of_week] = {
          ...slot,
          start_time: slot.start_time ? slot.start_time.slice(0, 5) : '09:00',
          end_time: slot.end_time ? slot.end_time.slice(0, 5) : '17:00'
        };
      });
      
      setAvailability(Object.values(availabilityMap));
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  // Fetch appointment statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/appointments/stats?period=today`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({});
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updated_by: doctorId })
      });
      
      if (response.ok) {
        fetchAppointments();
        alert(`Appointment ${status} successfully!`);
      } else {
        throw new Error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment status');
    }
  };

  // Save availability schedule
  const saveAvailability = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/appointments/doctor/${doctorId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability_schedule: availability })
      });
      
      if (response.ok) {
        alert('Availability updated successfully!');
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  // Update availability slot
  const updateAvailabilitySlot = (dayOfWeek, field, value) => {
    setAvailability(prev => 
      prev.map(slot => 
        slot.day_of_week === dayOfWeek 
          ? { ...slot, [field]: value }
          : slot
      )
    );
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setShowAllDates(false); // Reset show all dates when a specific date is selected
  };

  // Handle show all dates toggle
  const handleShowAllDates = () => {
    setShowAllDates(!showAllDates);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setSelectedDate('');
    setShowAllDates(true);
  };

  useEffect(() => {
    if (doctorId) {
      fetchAppointments();
      fetchAvailability();
      fetchStats();
    }
  }, [doctorId, selectedDate, statusFilter, showAllDates]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      no_show: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      {/* Header */}
      <div className="bg-green-800 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
            <p className="text-green-200">Welcome back, Dr. {currentUser?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-700 px-4 py-2 rounded-lg">
              <span className="text-sm">
                {showAllDates ? 'All Appointments' : `Appointments: ${appointments.length}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'availability', label: 'Availability', icon: Settings },
              { id: 'overview', label: 'Overview', icon: CheckCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Enhanced Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    disabled={showAllDates}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAllDates}
                      onChange={handleShowAllDates}
                      className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Show all dates</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                {(selectedDate || showAllDates) && (
                  <button
                    onClick={clearDateFilter}
                    className="text-sm text-green-600 hover:text-green-700 underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              
              {/* Display current filter info */}
              <div className="mt-3 text-sm text-gray-600">
                {showAllDates ? (
                  <span>Showing all appointments</span>
                ) : selectedDate ? (
                  <span>Showing appointments for {formatDate(selectedDate)}</span>
                ) : (
                  <span>Select a date to view appointments</span>
                )}
              </div>
            </div>

            {/* Appointments List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {showAllDates ? 'No appointments found' : 'No appointments found for the selected date'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-full">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.patient_name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTime(appointment.appointment_time)}
                            </span>
                            <span className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {appointment.patient_phone}
                            </span>
                            <span className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {appointment.patient_email}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {appointment.reason && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                      </div>
                    )}
                    
                    {appointment.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirm
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'no_show')}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          No Show
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Manage Availability</h2>
                <button
                  onClick={saveAvailability}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
              
              <div className="space-y-4">
                {availability.map((slot) => (
                  <div key={slot.day_of_week} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900 capitalize">
                        {daysOfWeek.find(d => d.value === slot.day_of_week)?.label}
                      </h3>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={slot.is_available}
                          onChange={(e) => updateAvailabilitySlot(slot.day_of_week, 'is_available', e.target.checked)}
                          className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Available</span>
                      </label>
                    </div>
                    
                    {slot.is_available && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => updateAvailabilitySlot(slot.day_of_week, 'start_time', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) => updateAvailabilitySlot(slot.day_of_week, 'end_time', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Appointments', value: stats.total_appointments || 0, color: 'green', icon: Calendar },
              { label: 'Pending', value: stats.pending_count || 0, color: 'yellow', icon: Clock },
              { label: 'Confirmed', value: stats.confirmed_count || 0, color: 'blue', icon: CheckCircle },
              { label: 'Completed', value: stats.completed_count || 0, color: 'green', icon: CheckCircle }
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
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
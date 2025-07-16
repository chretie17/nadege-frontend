import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, AlertCircle, User, Phone, Mail, Search, Filter, Settings, Save, Plus, Trash2, MapPin, BookOpen, Heart } from 'lucide-react';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: ''
  });

  // Get current user (patient) from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const patientId = currentUser?.id;

  const API_BASE = 'http://localhost:5000/api';

  // Fetch patient's appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/appointments/patient/${patientId}`);
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE}/appointments/doctors`);
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  // Fetch available slots for selected doctor and date
  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    
    try {
      setSlotsLoading(true);
      const response = await fetch(`${API_BASE}/appointments/available-slots/${doctorId}/${date}`);
      const data = await response.json();
      setAvailableSlots(data.available_slots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Book appointment
  const bookAppointment = async (e) => {
    e.preventDefault();
    
    if (!bookingForm.doctor_id || !bookingForm.appointment_date || !bookingForm.appointment_time) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setBookingLoading(true);
      const response = await fetch(`${API_BASE}/appointments/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          ...bookingForm
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Appointment booked successfully!');
        setBookingForm({
          doctor_id: '',
          appointment_date: '',
          appointment_time: '',
          reason: ''
        });
        setAvailableSlots([]);
        fetchAppointments();
        setActiveTab('appointments');
      } else {
        alert(data.error || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'cancelled', 
          updated_by: patientId,
          cancellation_reason: 'Cancelled by patient'
        })
      });
      
      if (response.ok) {
        fetchAppointments();
        alert('Appointment cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  // Handle booking form changes
  const handleBookingFormChange = (field, value) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Fetch available slots when doctor and date are selected
    if (field === 'doctor_id' || field === 'appointment_date') {
      const doctorId = field === 'doctor_id' ? value : bookingForm.doctor_id;
      const date = field === 'appointment_date' ? value : bookingForm.appointment_date;
      
      if (doctorId && date) {
        fetchAvailableSlots(doctorId, date);
      }
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchAppointments();
      fetchDoctors();
    }
  }, [patientId]);

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

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) >= new Date() && 
    ['pending', 'confirmed'].includes(apt.status)
  ).slice(0, 3);

  const pastAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) < new Date() || 
    ['completed', 'cancelled', 'no_show'].includes(apt.status)
  );

  return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-green-800 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Patient Dashboard</h1>
            <p className="text-green-200">Welcome back, {currentUser?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-700 px-4 py-2 rounded-lg">
              <span className="text-sm">Upcoming: {upcomingAppointments.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: CheckCircle },
              { id: 'appointments', label: 'My Appointments', icon: Calendar },
              { id: 'book', label: 'Book Appointment', icon: Plus },
              { id: 'doctors', label: 'Find Doctors', icon: Users },
              { id: 'profile', label: 'Profile', icon: User }
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Upcoming</p>
                    <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {appointments.filter(apt => apt.status === 'completed').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <button
                    onClick={() => setActiveTab('book')}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Book an Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Dr. {appointment.doctor_name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">My Appointments</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments found</p>
                  <button
                    onClick={() => setActiveTab('book')}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Book Your First Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-100 p-3 rounded-full">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Dr. {appointment.doctor_name}</h3>
                            <p className="text-sm text-gray-500">{appointment.doctor_specialization}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(appointment.appointment_date)}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatTime(appointment.appointment_time)}
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
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {appointment.doctor_phone}
                          </span>
                          <span className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {appointment.doctor_email}
                          </span>
                        </div>
                        
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => cancelAppointment(appointment.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Cancel Appointment
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'book' && (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h2 className="text-lg font-semibold mb-6">Book New Appointment</h2>
    
    {/* Wrap all fields in a real <form> */}
    <form onSubmit={bookAppointment} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Doctor *
        </label>
        <select
          value={bookingForm.doctor_id}
          onChange={e => handleBookingFormChange('doctor_id', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
          required
        >
          <option value="">Choose a doctor…</option>
          {doctors.map(doc => (
            <option key={doc.id} value={doc.id}>
              Dr. {doc.name} — {doc.specialization}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Appointment Date *
        </label>
        <input
          type="date"
          value={bookingForm.appointment_date}
          onChange={e => handleBookingFormChange('appointment_date', e.target.value)}
          min={getMinDate()}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      {bookingForm.doctor_id && bookingForm.appointment_date && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Time Slots *
          </label>
          {slotsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto" />
              <p className="text-gray-500 mt-2 text-sm">Loading slots…</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <p className="text-gray-500">No slots available</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map(slot => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => handleBookingFormChange('appointment_time', slot.time)}
                  className={`px-2 py-1 text-sm rounded-lg border transition ${
                    bookingForm.appointment_time === slot.time
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {slot.display_time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Visit
        </label>
        <textarea
          value={bookingForm.reason}
          onChange={e => handleBookingFormChange('reason', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
          placeholder="Describe your symptoms…"
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={
            bookingLoading ||
            !bookingForm.doctor_id ||
            !bookingForm.appointment_date ||
            !bookingForm.appointment_time
          }
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
        >
          {bookingLoading
            ? (<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />)
            : (<Calendar className="w-4 h-4 mr-2" />)}
          {bookingLoading ? 'Booking…' : 'Book Appointment'}
        </button>
        <button
          type="button"
          onClick={() => {
            setBookingForm({
              doctor_id: '',
              appointment_date: '',
              appointment_time: '',
              reason: ''
            });
            setAvailableSlots([]);
          }}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          Clear Form
        </button>
      </div>
    </form>
  </div>
)}


        {activeTab === 'doctors' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Find Doctors</h2>
            
            {doctors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No doctors available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Dr. {doctor.name}</h3>
                        <p className="text-sm text-gray-500">{doctor.specialization}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span>{doctor.education}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Heart className="w-4 h-4 mr-2" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{doctor.phone}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setBookingForm(prev => ({
                          ...prev,
                          doctor_id: doctor.id
                        }));
                        setActiveTab('book');
                      }}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-6">My Profile</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{currentUser?.name}</h3>
                  <p className="text-gray-500">{currentUser?.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{currentUser?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <p className="text-gray-900">{currentUser?.date_of_birth || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">{currentUser?.address || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <p className="text-gray-900">{currentUser?.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
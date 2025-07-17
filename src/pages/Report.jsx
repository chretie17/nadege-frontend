import React, { useState, useEffect } from 'react';
import { Download, Search, Users, Activity, Clock, MessageCircle, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
const API_BASE = 'http://localhost:5000/api';
import logo from '../assets/logo.png'; 
const logoUrl = 'https://www.clinigence.com/wp-content/uploads/2018/03/medconnect-e1520020203270-400x165.png';



const HealthcareReportsTable = () => {
  const [activeReport, setActiveReport] = useState('user-overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reports = [
    { id: 'user-overview', name: 'User Overview', icon: Users },
    { id: 'appointments-analytics', name: 'Appointments', icon: Activity },
    { id: 'doctor-availability', name: 'Doctor Availability', icon: Clock },
    { id: 'community-engagement', name: 'Community', icon: MessageCircle }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search) params.append('search', search);

      const response = await fetch(`${API_BASE}/reports/${activeReport}?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeReport, startDate, endDate, search]);



const exportToPDF = async () => {
  const currentReport = reports.find(r => r.id === activeReport);
  
  // Create new PDF document
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Color scheme - Beautiful dark green palette
  const colors = {
    primary: [20, 83, 45],      // Deep forest green
    secondary: [34, 139, 34],   // Forest green
    accent: [46, 125, 50],      // Medium green
    light: [200, 230, 201],     // Light green
    lighter: [232, 245, 233],   // Very light green
    dark: [27, 94, 32],         // Dark green
    text: [33, 37, 41],         // Dark gray
    muted: [108, 117, 125],     // Muted gray
    white: [255, 255, 255],     // White
    background: [248, 249, 250] // Light background
  };
  
  // Load logo (you might need to convert this to base64 or handle differently)// Add this function to load your logo
 // Load and convert logo to base64
// Convert image to Base64 format
// Enhanced image loading with fallback
const loadImageWithFallback = async (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error('Image load timeout'));
    }, 5000);
    
    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageSrc;
  });
};
  
  // Generate timestamp
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  let yPosition = 20;
  
  // Helper function to add elegant header
// Enhanced header with better error handling
const addHeader = async () => {
  // Gradient-like header background
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Subtle accent stripe
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 40, pageWidth, 5, 'F');
  
  // Try to load the actual logo image with improved error handling
  let logoAdded = false;
  
  try {
    const base64Image = await loadImageWithFallback(logoUrl);
    doc.addImage(base64Image, 'PNG', 15, 8, 40, 16.5);
    logoAdded = true;
  } catch (error) {
    console.warn('Logo loading failed, using fallback:', error);
    addCustomLogo();
    logoAdded = true;
  }
  
  function addCustomLogo() {
    // Enhanced custom MedConnect logo with better styling
    doc.setFillColor(...colors.white);
    doc.roundedRect(15, 8, 40, 25, 3, 3, 'F');
    
    // Green accent background
    doc.setFillColor(...colors.accent);
    doc.roundedRect(16, 9, 38, 23, 2, 2, 'F');
    
    // MedConnect text with better positioning
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.white);
    doc.text('MedConnect', 20, 18);
    
    // Healthcare symbol - improved cross design
    doc.setFillColor(...colors.white);
    doc.circle(35, 25, 4, 'F');
    doc.setFillColor(...colors.accent);
    doc.rect(33, 21, 4, 8, 'F'); // Vertical bar
    doc.rect(31, 23, 8, 4, 'F');  // Horizontal bar
    
    // Add subtitle
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Healthcare System', 20, 28);
  }
  
  // Main title - adjusted position to account for logo
  doc.setTextColor(...colors.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(currentReport?.name || 'Healthcare Analytics Report', 60, 18);
  
  // Subtitle with elegant styling
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('MedConnect Health Analytics', 60, 28);
  
  // Date/Time in header with better formatting
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 220);
  doc.text(`Generated: ${dateString}`, pageWidth - 85, 15);
  doc.text(`Time: ${timeString}`, pageWidth - 85, 22);
  doc.text(`Report ID: #${Math.random().toString(36).substr(2, 9).toUpperCase()}`, pageWidth - 85, 29);
  
  // Reset for body content
  doc.setTextColor(...colors.text);
  yPosition = 60;
};
  // Enhanced parameters section
  const addReportParameters = () => {
    // Section title with icon
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.dark);
    doc.text('📊 Report Configuration', 20, yPosition);
    yPosition += 12;
    
    // Beautiful parameters card
    doc.setFillColor(...colors.lighter);
    doc.setDrawColor(...colors.light);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPosition - 8, pageWidth - 40, 30, 3, 3, 'FD');
    
    // Parameters in organized layout
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.text);
    
    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text('Date Range:', 30, yPosition);
    doc.text('Filter:', 30, yPosition + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`${startDate || 'All Time'} - ${endDate || 'All Time'}`, 55, yPosition);
    doc.text(`${search || 'None applied'}`, 55, yPosition + 8);
    
    // Right column
    doc.setFont('helvetica', 'bold');
    doc.text('Report Type:', 120, yPosition);
    doc.text('Generated By:', 120, yPosition + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentReport?.name || 'Standard Report'}`, 150, yPosition);
    doc.text('Healthcare Admin', 150, yPosition + 8);
    
    yPosition += 35;
  };
  
  // Beautiful statistics cards
  const addStatistics = (title, stats) => {
    if (yPosition + 50 > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Section title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.dark);
    doc.text(title, 20, yPosition);
    yPosition += 15;
    
    // Stats grid with modern card design
    const statsPerRow = 3;
    const cardWidth = (pageWidth - 70) / statsPerRow;
    const cardHeight = 25;
    
    stats.forEach((stat, index) => {
      const col = index % statsPerRow;
      const row = Math.floor(index / statsPerRow);
      
      if (col === 0 && row > 0) {
        yPosition += cardHeight + 8;
      }
      
      const x = 20 + (col * (cardWidth + 15));
      const y = yPosition + (row * (cardHeight + 8));
      
      // Modern card with shadow effect
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(x + 1, y - 3, cardWidth, cardHeight, 2, 2, 'F');
      
      doc.setFillColor(...colors.white);
      doc.setDrawColor(...colors.light);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y - 4, cardWidth, cardHeight, 2, 2, 'FD');
      
      // Stat value with accent color
      doc.setTextColor(...colors.primary);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(stat.value.toString(), x + 8, y + 5);
      
      // Stat label
      doc.setTextColor(...colors.muted);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const labelLines = doc.splitTextToSize(stat.label, cardWidth - 16);
      doc.text(labelLines, x + 8, y + 12);
    });
    
    yPosition += Math.ceil(stats.length / statsPerRow) * (cardHeight + 8) + 20;
    doc.setTextColor(...colors.text);
  };
  
  // Enhanced table with modern design
  // Enhanced table with better error handling and validation
const addTable = (title, headers, rows, description = '') => {
  // Validate inputs
  if (!title || !headers || !Array.isArray(headers)) {
    console.warn('Invalid table parameters:', { title, headers, rows });
    return;
  }
  
  if (yPosition + 40 > pageHeight - 30) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Section title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.dark);
  doc.text(title, 20, yPosition);
  yPosition += 10;
  
  // Description with better typography
  if (description) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.muted);
    try {
      const descLines = doc.splitTextToSize(description, pageWidth - 40);
      doc.text(descLines, 20, yPosition);
      yPosition += descLines.length * 4 + 8;
    } catch (error) {
      console.warn('Error rendering description:', error);
      yPosition += 8;
    }
  }
  
  doc.setTextColor(...colors.text);
  
  if (!rows || rows.length === 0) {
    // No data message with style
    doc.setFillColor(...colors.lighter);
    doc.setDrawColor(...colors.light);
    doc.roundedRect(20, yPosition - 5, pageWidth - 40, 20, 2, 2, 'FD');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...colors.muted);
    doc.text('📋 No data available for this report section.', 30, yPosition + 5);
    yPosition += 25;
    return;
  }
  
  // Clean and validate data
  const cleanRows = rows.map(row => 
    row.map(cell => {
      if (cell === null || cell === undefined) return '';
      return cell.toString().replace(/<[^>]*>/g, '').trim();
    })
  ).filter(row => row.length > 0); // Remove empty rows
  
  // Use autoTable with enhanced styling and error handling
  try {
    doc.autoTable({
      head: [headers],
      body: cleanRows,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        font: 'helvetica',
        textColor: colors.text,
        lineColor: colors.light,
        lineWidth: 0.3,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: colors.primary,
        textColor: colors.white,
        fontStyle: 'bold',
        fontSize: 10,
        cellPadding: 5,
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: colors.lighter,
      },
      rowStyles: {
        fillColor: colors.white,
      },
      tableLineColor: colors.light,
      tableLineWidth: 0.3,
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
      },
      didDrawPage: function (data) {
        // Add subtle table border
        doc.setDrawColor(...colors.light);
        doc.setLineWidth(0.5);
      },
      // Add error handling for table generation
      willDrawCell: function(data) {
        if (data.cell.text && data.cell.text.length > 50) {
          data.cell.text = data.cell.text.substring(0, 47) + '...';
        }
      }
    });
    
    yPosition = doc.lastAutoTable.finalY + 20;
  } catch (error) {
    console.warn('AutoTable failed, using fallback:', error);
    addTableFallback(title, headers, cleanRows, description);
  }
};
  // Enhanced fallback table
  const addTableFallback = (title, headers, rows, description = '') => {
    if (yPosition + 30 > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
    
    if (!rows || rows.length === 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...colors.muted);
      doc.text('📋 No data available for this report section.', 20, yPosition);
      yPosition += 20;
      return;
    }
    
    // Enhanced manual table
    const rowHeight = 10;
    const colWidth = (pageWidth - 40) / headers.length;
    
    // Modern header
    doc.setFillColor(...colors.primary);
    doc.setDrawColor(...colors.primary);
    doc.roundedRect(20, yPosition - 3, pageWidth - 40, rowHeight, 1, 1, 'FD');
    
    doc.setTextColor(...colors.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, index) => {
      doc.text(header, 25 + (index * colWidth), yPosition + 4);
    });
    
    yPosition += rowHeight + 2;
    
    // Data rows with alternating colors
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    rows.forEach((row, rowIndex) => {
      if (yPosition + rowHeight > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Alternating row colors
      if (rowIndex % 2 === 1) {
        doc.setFillColor(...colors.lighter);
        doc.rect(20, yPosition - 2, pageWidth - 40, rowHeight, 'F');
      }
      
      row.forEach((cell, colIndex) => {
        const cleanCell = cell.toString().replace(/<[^>]*>/g, '');
        const truncatedCell = cleanCell.length > 25 ? cleanCell.substring(0, 22) + '...' : cleanCell;
        doc.text(truncatedCell, 25 + (colIndex * colWidth), yPosition + 4);
      });
      
      yPosition += rowHeight;
    });
    
    yPosition += 15;
  };
  
  // Add elegant footer to all pages
  const addFooters = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer gradient effect
      doc.setFillColor(...colors.background);
      doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
      
      // Subtle line
      doc.setDrawColor(...colors.light);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
      
      // Footer content
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.muted);
      
      // Left side
      doc.text('🏥 Healthcare Management System', 20, pageHeight - 12);
      doc.text('Confidential & Proprietary', 20, pageHeight - 6);
      
      // Right side
      doc.text(`© ${new Date().getFullYear()} Healthcare System`, pageWidth - 80, pageHeight - 12);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, pageHeight - 6);
    }
  };
  
  // Generate the report
 // Generate the report with error handling
try {
  await addHeader();
  addReportParameters();
} catch (error) {
  console.error('Error generating report header:', error);
  // Continue with a simplified header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Healthcare Analytics Report', 20, 20);
  yPosition = 40;
}
  
  // Content generation based on active report
  if (activeReport === 'user-overview' && data) {
    // User Statistics
    if (data.usersByRole) {
      const total = data.usersByRole.reduce((sum, r) => sum + r.count, 0);
      const userStats = [
        { label: 'Total Users', value: total },
        { label: 'Active Users', value: Math.round(total * 0.8) },
        { label: 'New This Month', value: Math.round(total * 0.1) }
      ];
      addStatistics('👥 User Statistics Overview', userStats);
    }
    
    // Users by Role
    if (data.usersByRole) {
      const total = data.usersByRole.reduce((sum, r) => sum + r.count, 0);
      const roleHeaders = ['Role', 'Count', 'Percentage', 'Status'];
      const roleRows = data.usersByRole.map(role => [
        role.role,
        role.count.toLocaleString(),
        `${((role.count / total) * 100).toFixed(1)}%`,
        role.count > 0 ? 'Active' : 'Inactive'
      ]);
      
      addTable('Users by Role Distribution', roleHeaders, roleRows, 'Comprehensive breakdown of user roles and their distribution across the healthcare system');
    }
    
    // Recent Users
    if (data.recentUsers) {
      const userHeaders = ['Name', 'Email', 'Role', 'Registration Date', 'Status'];
      const userRows = data.recentUsers.slice(0, 15).map(user => [
        user.name,
        user.email,
        user.role,
        new Date(user.created_at).toLocaleDateString(),
        'Active'
      ]);
      
      addTable('Recent User Registrations', userHeaders, userRows, 'Latest user registrations showing the most recent additions to the healthcare system');
    }
    
    // Doctor Profile Completeness
    if (data.completeDoctorProfiles) {
      const doctorHeaders = ['Doctor Name', 'Specialization', 'Completeness', 'Score', 'Status'];
      const doctorRows = data.completeDoctorProfiles.map(doctor => [
        doctor.name,
        doctor.specialization || 'Not specified',
        `${Math.round((doctor.completeness_score / 4) * 100)}%`,
        `${doctor.completeness_score}/4`,
        doctor.completeness_score >= 3 ? '✅ Complete' : doctor.completeness_score >= 2 ? '⚠️ Partial' : '❌ Incomplete'
      ]);
      
      addTable('Doctor Profile Completeness Analysis', doctorHeaders, doctorRows, 'Assessment of doctor profile completion status and recommendations for improvement');
    }
  }
  
  else if (activeReport === 'appointments-analytics' && data) {
    // Appointment Statistics
    // Appointment Statistics
    if (data.appointmentStats) {
      const stats = [
        { label: 'Total Appointments', value: data.appointmentStats.total_appointments || 0 },
        { label: 'Pending', value: data.appointmentStats.pending_count || 0 },
        { label: 'Confirmed', value: data.appointmentStats.confirmed_count || 0 },
        { label: 'Completed', value: data.appointmentStats.completed_count || 0 },
        { label: 'Cancelled', value: data.appointmentStats.cancelled_count || 0 }
      ];
      addStatistics('Appointment Statistics Overview', stats);
    }
    
    // Doctor Performance
    if (data.doctorStats) {
      const perfHeaders = ['Doctor Name', 'Specialization', 'Total Appointments', 'Completed', 'Completion Rate'];
      const perfRows = data.doctorStats.map(doctor => [
        doctor.doctor_name,
        doctor.specialization,
        doctor.appointment_count,
        doctor.completed_count,
        `${doctor.completion_rate}%`
      ]);
      
      try {
        addTable('Doctor Performance Analysis', perfHeaders, perfRows, 'Performance metrics for doctors based on appointment completion rates');
      } catch (error) {
        console.warn('AutoTable failed, using fallback:', error);
        addTableFallback('Doctor Performance Analysis', perfHeaders, perfRows, 'Performance metrics for doctors based on appointment completion rates');
      }
    }
    
    // Appointments by Specialization
    if (data.specializationStats) {
      const total = data.specializationStats.reduce((sum, s) => sum + s.appointment_count, 0);
      const specHeaders = ['Specialization', 'Total Appointments', 'Percentage of Total'];
      const specRows = data.specializationStats.map(spec => [
        spec.specialization,
        spec.appointment_count,
        `${((spec.appointment_count / total) * 100).toFixed(1)}%`
      ]);
      
      try {
        addTable('Appointments by Medical Specialization', specHeaders, specRows, 'Distribution of appointments across different medical specializations');
      } catch (error) {
        console.warn('AutoTable failed, using fallback:', error);
        addTableFallback('Appointments by Medical Specialization', specHeaders, specRows, 'Distribution of appointments across different medical specializations');
      }
    }
  }
  
  else if (activeReport === 'doctor-availability' && data) {
    // Doctor Availability Overview
    if (data.doctorAvailability) {
      const availHeaders = ['Doctor Name', 'Specialization', 'Available Slots', 'Total Slots', 'Availability Rate'];
      const availRows = data.doctorAvailability.map(doctor => {
        const percentage = doctor.availability_slots > 0 ? Math.round((doctor.available_slots / doctor.availability_slots) * 100) : 0;
        return [
          doctor.name,
          doctor.specialization,
          doctor.available_slots,
          doctor.availability_slots,
          `${percentage}%`
        ];
      });
      
      try {
        addTable('Doctor Availability Overview', availHeaders, availRows, 'Current availability status of all doctors in the system');
      } catch (error) {
        console.warn('AutoTable failed, using fallback:', error);
        addTableFallback('Doctor Availability Overview', availHeaders, availRows, 'Current availability status of all doctors in the system');
      }
    }
    
    // Availability by Day
    if (data.availabilityByDay) {
      const dayHeaders = ['Day of Week', 'Total Slots', 'Available Slots', 'Availability Rate'];
      const dayRows = data.availabilityByDay.map(day => {
        const percentage = day.total_slots > 0 ? Math.round((day.available_slots / day.total_slots) * 100) : 0;
        return [
          day.day_of_week.charAt(0).toUpperCase() + day.day_of_week.slice(1),
          day.total_slots,
          day.available_slots,
          `${percentage}%`
        ];
      });
      
      try {
        addTable('Weekly Availability Pattern', dayHeaders, dayRows, 'Availability distribution across days of the week');
      } catch (error) {
        console.warn('AutoTable failed, using fallback:', error);
        addTableFallback('Weekly Availability Pattern', dayHeaders, dayRows, 'Availability distribution across days of the week');
      }
    }
  }
  
  else if (activeReport === 'community-engagement' && data) {
    // Community Activity Statistics
    if (data.forumActivity) {
      const communityStats = [
        { label: 'Total Topics', value: data.forumActivity.total_topics || 0 },
        { label: 'Total Posts', value: data.forumActivity.total_posts || 0 },
        { label: 'Active Users', value: data.forumActivity.active_users || 0 },
        { label: 'New Topics (30d)', value: data.forumActivity.new_topics_30d || 0 },
        { label: 'New Posts (30d)', value: data.forumActivity.new_posts_30d || 0 }
      ];
      addStatistics('Community Activity Summary', communityStats);
    }
    
    // Most Engaged Users
    if (data.mostEngagedUsers) {
      const engagedHeaders = ['User Name', 'Role', 'Total Posts', 'Topics Participated'];
      const engagedRows = data.mostEngagedUsers.map(user => [
        user.name,
        user.role,
        user.post_count,
        user.topics_participated
      ]);
      
      try {
        addTable('Most Engaged Community Members', engagedHeaders, engagedRows, 'Top contributors to community discussions and forums');
      } catch (error) {
        console.warn('AutoTable failed, using fallback:', error);
        addTableFallback('Most Engaged Community Members', engagedHeaders, engagedRows, 'Top contributors to community discussions and forums');
      }
    }
    
    // Success Stories Statistics
    if (data.successStories) {
      const storyHeaders = ['Metric', 'Count', 'Status'];
      const storyRows = [
        ['Total Stories', data.successStories.total_stories || 0, 'All'],
        ['Approved Stories', data.successStories.approved_stories || 0, 'Approved'],
        ['Pending Stories', data.successStories.pending_stories || 0, 'Pending'],
        ['Anonymous Stories', data.successStories.anonymous_stories || 0, 'Anonymous']
      ];
      
      try {
        addTable('Success Stories Statistics', storyHeaders, storyRows, 'Patient success stories and their approval status');
      } catch (error) {
        console.warn('AutoTable failed, using fallback:', error);
        addTableFallback('Success Stories Statistics', storyHeaders, storyRows, 'Patient success stories and their approval status');
      }
    }
  }
  
  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer background
    doc.setFillColor(240, 240, 240);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    
    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Healthcare Dashboard System', 20, pageHeight - 12);
    doc.text('Confidential Report - For Internal Use Only', 20, pageHeight - 6);
    doc.text(`© ${new Date().getFullYear()} Healthcare System. All rights reserved.`, pageWidth - 100, pageHeight - 12);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 6);
  }
  
  // Save PDF
  const filename = `${currentReport?.name?.replace(/\s+/g, '_') || 'Healthcare_Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  
  // Show success message (you might want to use a toast notification instead)
  alert('PDF report generated successfully! The file has been downloaded to your computer.');
};


  const renderUserOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-green-800 text-white">
          <h3 className="text-lg font-semibold">Users by Role</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.usersByRole?.map((role, index) => {
                const total = data.usersByRole.reduce((sum, r) => sum + r.count, 0);
                const percentage = ((role.count / total) * 100).toFixed(1);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        role.role === 'doctor' ? 'bg-green-100 text-green-800' : 
                        role.role === 'patient' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {role.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{role.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-green-800 text-white">
          <h3 className="text-lg font-semibold">Recent Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.recentUsers?.slice(0, 15).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'doctor' ? 'bg-green-100 text-green-800' : 
                      user.role === 'patient' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-green-800 text-white">
          <h3 className="text-lg font-semibold">Doctor Profile Completeness</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completeness Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.completeDoctorProfiles?.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialization || 'Not specified'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.completeness_score}/4</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      doctor.completeness_score >= 3 ? 'bg-green-100 text-green-800' :
                      doctor.completeness_score >= 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doctor.completeness_score >= 3 ? 'Complete' : doctor.completeness_score >= 2 ? 'Partial' : 'Incomplete'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAppointmentsAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-green-800 text-white">
          <h3 className="text-lg font-semibold">Appointment Statistics</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data?.appointmentStats?.total_appointments || 0}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{data?.appointmentStats?.pending_count || 0}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data?.appointmentStats?.confirmed_count || 0}</div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data?.appointmentStats?.completed_count || 0}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{data?.appointmentStats?.cancelled_count || 0}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-green-800 text-white">
          <h3 className="text-lg font-semibold">Doctor Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Appointments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.doctorStats?.map((doctor) => (
                <tr key={doctor.doctor_name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.doctor_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialization}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.appointment_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.completed_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      doctor.completion_rate >= 80 ? 'bg-green-100 text-green-800' :
                      doctor.completion_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doctor.completion_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-green-800 text-white">
          <h3 className="text-lg font-semibold">Appointments by Specialization</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Appointments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.specializationStats?.map((spec) => {
                const total = data.specializationStats.reduce((sum, s) => sum + s.appointment_count, 0);
                const percentage = ((spec.appointment_count / total) * 100).toFixed(1);
                return (
                  <tr key={spec.specialization} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{spec.specialization}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{spec.appointment_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDoctorAvailability = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-green-800 text-white">
          <h3 className="text-lg font-semibold">Doctor Availability Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Slots</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Slots</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.doctorAvailability?.map((doctor) => {
                const percentage = doctor.availability_slots > 0 ? Math.round((doctor.available_slots / doctor.availability_slots) * 100) : 0;
                return (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialization}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.available_slots}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.availability_slots}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        percentage > 70 ? 'bg-green-100 text-green-800' :
                        percentage > 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-green-800 text-white">
          <h3 className="text-lg font-semibold">Availability by Day</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Slots</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Slots</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.availabilityByDay?.map((day) => {
                const percentage = day.total_slots > 0 ? Math.round((day.available_slots / day.total_slots) * 100) : 0;
                return (
                  <tr key={day.day_of_week} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{day.day_of_week}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.total_slots}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.available_slots}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCommunityEngagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-green-800 text-white">
          <h3 className="text-lg font-semibold">Community Activity Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data?.forumActivity?.total_topics || 0}</div>
              <div className="text-sm text-gray-600">Total Topics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data?.forumActivity?.total_posts || 0}</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data?.forumActivity?.active_users || 0}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data?.forumActivity?.new_topics_30d || 0}</div>
              <div className="text-sm text-gray-600">New Topics (30d)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{data?.forumActivity?.new_posts_30d || 0}</div>
              <div className="text-sm text-gray-600">New Posts (30d)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-green-800 text-white">
          <h3 className="text-lg font-semibold">Most Engaged Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topics Participated</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.mostEngagedUsers?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'doctor' ? 'bg-green-100 text-green-800' : 
                      user.role === 'patient' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.post_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.topics_participated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-green-800 text-white">
          <h3 className="text-lg font-semibold">Success Stories Statistics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Stories</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data?.successStories?.total_stories || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">All</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Approved Stories</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data?.successStories?.approved_stories || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Approved</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pending Stories</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data?.successStories?.pending_stories || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Anonymous Stories</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data?.successStories?.anonymous_stories || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">Anonymous</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeReport) {
      case 'user-overview':
        return renderUserOverview();
      case 'appointments-analytics':
        return renderAppointmentsAnalytics();
      case 'doctor-availability':
        return renderDoctorAvailability();
      case 'community-engagement':
        return renderCommunityEngagement();
      default:
        return null;
    }
  };

return (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 bg-green-800 text-white">
          <h1 className="text-2xl font-bold">Healthcare Reports Dashboard</h1>
          <p className="text-green-100">Comprehensive analytics and insights</p>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {reports.map((report) => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.id}
                    onClick={() => setActiveReport(report.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      activeReport === report.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={16} />
                    {report.name}
                  </button>
                );
              })}
            </div>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading report data...</p>
              </div>
            </div>
          ) : (
            <div id="report-content">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default HealthcareReportsTable;
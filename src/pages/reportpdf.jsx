// PDFReportGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoImage from '../assets/logo.png';

class PDFReportGenerator {
  constructor() {
    this.doc = null;
    this.pageWidth = 0;
    this.pageHeight = 0;
    this.yPosition = 20;
    this.colors = {
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
  }

  // Initialize PDF document
  initializePDF() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.yPosition = 20;
  }

  // Convert image to Base64 format
  async loadImageAsBase64(imageSrc) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
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
          resolve(canvas.toDataURL('image/jpeg'));
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
  }

  // Add clean header with logo
  async addHeader(reportName) {
    // Try to load the main logo (only one logo)
    try {
      const base64Logo = await this.loadImageAsBase64(logoImage);
      this.doc.addImage(base64Logo, 'JPEG', 15, 15, 30, 30);
    } catch (error) {
      console.warn('Logo loading failed, using fallback:', error);
      this.addFallbackLogo(15, 15, 30, 30);
    }
    
    // Main title - centered
    this.doc.setTextColor(...this.colors.text);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    const titleWidth = this.doc.getTextWidth(reportName.toUpperCase());
    this.doc.text(reportName.toUpperCase(), (this.pageWidth - titleWidth) / 2, 25);
    
    // Subtitle - centered
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    const subtitleWidth = this.doc.getTextWidth('MedConnect Report');
    this.doc.text('MedConnect Report', (this.pageWidth - subtitleWidth) / 2, 35);
    
    // Reset for body content
    this.yPosition = 60;
  }

  // Fallback logo if image fails to load
  addFallbackLogo(x, y, width, height) {
    // Circle background
    this.doc.setFillColor(...this.colors.primary);
    this.doc.circle(x + width/2, y + height/2, width/2, 'F');
    
    // White inner circle
    this.doc.setFillColor(...this.colors.white);
    this.doc.circle(x + width/2, y + height/2, width/3, 'F');
    
    // Text
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    const text = 'LOGO';
    const textWidth = this.doc.getTextWidth(text);
    this.doc.text(text, x + (width - textWidth)/2, y + height/2 + 2);
  }

  // Add clean table section
  addTable(title, headers, rows, description = '') {
    if (!title || !headers || !Array.isArray(headers)) {
      console.warn('Invalid table parameters:', { title, headers, rows });
      return;
    }
    
    if (this.yPosition + 40 > this.pageHeight - 30) {
      this.doc.addPage();
      this.yPosition = 20;
    }
    
    this.doc.setTextColor(...this.colors.text);
    
    if (!rows || rows.length === 0) {
      // No data message
      this.doc.setFillColor(...this.colors.lighter);
      this.doc.setDrawColor(...this.colors.light);
      this.doc.roundedRect(20, this.yPosition - 5, this.pageWidth - 40, 20, 2, 2, 'FD');
      
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(...this.colors.muted);
      this.doc.text('No data available for this report section.', 30, this.yPosition + 5);
      this.yPosition += 25;
      return;
    }
    
    // Clean and validate data
    const cleanRows = rows.map(row => 
      row.map(cell => {
        if (cell === null || cell === undefined) return '';
        return cell.toString().replace(/<[^>]*>/g, '').trim();
      })
    ).filter(row => row.length > 0);
    
    // Use autoTable with clean styling
    try {
      this.doc.autoTable({
        head: [headers],
        body: cleanRows,
        startY: this.yPosition,
        margin: { left: 20, right: 20 },
        styles: {
          fontSize: 10,
          cellPadding: 6,
          font: 'helvetica',
          textColor: this.colors.text,
          lineColor: [128, 128, 128],
          lineWidth: 0.5,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: this.colors.text,
          fontStyle: 'bold',
          fontSize: 11,
          cellPadding: 8,
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        rowStyles: {
          fillColor: this.colors.white,
        },
        tableLineColor: [128, 128, 128],
        tableLineWidth: 0.5,
        columnStyles: {
          0: { halign: 'center' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' }
        }
      });
      
      this.yPosition = this.doc.lastAutoTable.finalY + 30;
    } catch (error) {
      console.warn('AutoTable failed, using fallback:', error);
      this.addTableFallback(title, headers, cleanRows);
    }
  }

  // Fallback table method
  addTableFallback(title, headers, rows) {
    if (this.yPosition + 30 > this.pageHeight - 30) {
      this.doc.addPage();
      this.yPosition = 20;
    }
    
    if (!rows || rows.length === 0) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(...this.colors.muted);
      this.doc.text('No data available for this report section.', 20, this.yPosition);
      this.yPosition += 20;
      return;
    }
    
    const rowHeight = 12;
    const colWidth = (this.pageWidth - 40) / headers.length;
    
    // Header
    this.doc.setFillColor(240, 240, 240);
    this.doc.setDrawColor(128, 128, 128);
    this.doc.setLineWidth(0.5);
    this.doc.rect(20, this.yPosition - 4, this.pageWidth - 40, rowHeight, 'FD');
    
    this.doc.setTextColor(...this.colors.text);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, index) => {
      const headerText = header.length > 15 ? header.substring(0, 12) + '...' : header;
      const textWidth = this.doc.getTextWidth(headerText);
      this.doc.text(headerText, 25 + (index * colWidth) + (colWidth - textWidth) / 2, this.yPosition + 4);
    });
    
    this.yPosition += rowHeight + 2;
    
    // Data rows
    this.doc.setTextColor(...this.colors.text);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    rows.forEach((row, rowIndex) => {
      if (this.yPosition + rowHeight > this.pageHeight - 30) {
        this.doc.addPage();
        this.yPosition = 20;
      }
      
      // Alternating row colors
      if (rowIndex % 2 === 1) {
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(20, this.yPosition - 2, this.pageWidth - 40, rowHeight, 'F');
      }
      
      // Row border
      this.doc.setDrawColor(128, 128, 128);
      this.doc.setLineWidth(0.3);
      this.doc.rect(20, this.yPosition - 2, this.pageWidth - 40, rowHeight, 'D');
      
      row.forEach((cell, colIndex) => {
        const cleanCell = cell.toString().replace(/<[^>]*>/g, '');
        const truncatedCell = cleanCell.length > 20 ? cleanCell.substring(0, 17) + '...' : cleanCell;
        const textWidth = this.doc.getTextWidth(truncatedCell);
        this.doc.text(truncatedCell, 25 + (colIndex * colWidth) + (colWidth - textWidth) / 2, this.yPosition + 6);
      });
      
      this.yPosition += rowHeight;
    });
    
    this.yPosition += 20;
  }

  // Add report configuration section at bottom
  addReportConfiguration(startDate, endDate, search, reportType) {
    if (this.yPosition + 40 > this.pageHeight - 30) {
      this.doc.addPage();
      this.yPosition = 20;
    }
    
    // Add some space before configuration
    this.yPosition += 20;
    
    // Configuration content
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.text);
    
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    // Left aligned configuration info
    this.doc.text(`Downloaded by: Admin`, 20, this.yPosition);
    this.doc.text(`On: ${dateString}`, 20, this.yPosition + 6);
    
    this.yPosition += 20;
  }

  // Add footer to all pages
  addFooters() {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Simple footer line
      this.doc.setDrawColor(...this.colors.light);
      this.doc.setLineWidth(0.3);
      this.doc.line(20, this.pageHeight - 20, this.pageWidth - 20, this.pageHeight - 20);
      
      // Page number - centered
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.colors.muted);
      const pageText = `${i} of ${pageCount}`;
      const pageTextWidth = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, (this.pageWidth - pageTextWidth) / 2, this.pageHeight - 10);
    }
  }

  // Generate User Overview Report
  generateUserOverviewReport(data, startDate, endDate, search) {
    // Users by Role
    if (data.usersByRole) {
      const roleHeaders = ['Role', 'Count', 'Percentage', 'Status'];
      const total = data.usersByRole.reduce((sum, r) => sum + r.count, 0);
      const roleRows = data.usersByRole.map(role => [
        role.role,
        role.count.toLocaleString(),
        `${((role.count / total) * 100).toFixed(1)}%`,
        role.count > 0 ? 'Active' : 'Inactive'
      ]);
      
      this.addTable('Users by Role Distribution', roleHeaders, roleRows);
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
      
      this.addTable('Recent User Registrations', userHeaders, userRows);
    }
    
    // Doctor Profile Completeness
    if (data.completeDoctorProfiles) {
      const doctorHeaders = ['Doctor Name', 'Specialization', 'Completeness', 'Score', 'Status'];
      const doctorRows = data.completeDoctorProfiles.map(doctor => [
        doctor.name,
        doctor.specialization || 'Not specified',
        `${Math.round((doctor.completeness_score / 4) * 100)}%`,
        `${doctor.completeness_score}/4`,
        doctor.completeness_score >= 3 ? 'Complete' : doctor.completeness_score >= 2 ? 'Partial' : 'Incomplete'
      ]);
      
      this.addTable('Doctor Profile Completeness Analysis', doctorHeaders, doctorRows);
    }
  }

  // Generate Appointments Analytics Report
  generateAppointmentsReport(data) {
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
      
      this.addTable('Doctor Performance Analysis', perfHeaders, perfRows);
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
      
      this.addTable('Appointments by Medical Specialization', specHeaders, specRows);
    }
  }

  // Generate Doctor Availability Report
  generateDoctorAvailabilityReport(data) {
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
      
      this.addTable('Doctor Availability Overview', availHeaders, availRows);
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
      
      this.addTable('Weekly Availability Pattern', dayHeaders, dayRows);
    }
  }

  // Generate Community Engagement Report
  generateCommunityReport(data) {
    // Most Engaged Users
    if (data.mostEngagedUsers) {
      const engagedHeaders = ['User Name', 'Role', 'Total Posts', 'Topics Participated'];
      const engagedRows = data.mostEngagedUsers.map(user => [
        user.name,
        user.role,
        user.post_count,
        user.topics_participated
      ]);
      
      this.addTable('Most Engaged Community Members', engagedHeaders, engagedRows);
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
      
      this.addTable('Success Stories Statistics', storyHeaders, storyRows);
    }
  }

  // Main method to generate PDF report
  async generatePDFReport(reportType, reportData, startDate, endDate, search) {
    try {
      this.initializePDF();
      
      // Get report name
      const reportNames = {
        'user-overview': 'HEALTHCARE MANAGEMENT SYSTEM',
        'appointments-analytics': 'APPOINTMENT MANAGEMENT SYSTEM',
        'doctor-availability': 'DOCTOR AVAILABILITY SYSTEM',
        'community-engagement': 'COMMUNITY MANAGEMENT SYSTEM'
      };
      
      const reportName = reportNames[reportType] || 'HEALTHCARE SYSTEM';
      
      // Add header
      await this.addHeader(reportName);
      
      // Generate content based on report type
              if (!reportData) {
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.muted);
        this.doc.text('No data available for this report.', 20, this.yPosition);
      } else {
        switch (reportType) {
          case 'user-overview':
            this.generateUserOverviewReport(reportData, startDate, endDate, search);
            break;
          case 'appointments-analytics':
            this.generateAppointmentsReport(reportData);
            break;
          case 'doctor-availability':
            this.generateDoctorAvailabilityReport(reportData);
            break;
          case 'community-engagement':
            this.generateCommunityReport(reportData);
            break;
          default:
            this.doc.text('Invalid report type specified.', 20, this.yPosition);
        }
      }
      
      // Add configuration section at bottom
      this.addReportConfiguration(startDate, endDate, search, reportName);
      
      // Add footers to all pages
      this.addFooters();
      
      // Save the PDF
      const filename = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(filename);
      
      return { success: true, message: 'PDF report generated successfully!' };
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      return { success: false, message: 'Failed to generate PDF report. Please try again.' };
    }
  }
}

export default PDFReportGenerator;
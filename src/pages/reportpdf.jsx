// PDFReportGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoImage from '../assets/logo.png';
import logoImage2 from '../assets/logo2.png'; // Second logo

class PDFReportGenerator {
  constructor() {
    this.doc = null;
    this.pageWidth = 0;
    this.pageHeight = 0;
    this.yPosition = 20;
    this.colors = {
      primary: [0, 77, 64],        // Dark teal green
      secondary: [26, 121, 99],    // Medium dark green
      accent: [46, 125, 50],       // Medium green
      light: [165, 214, 167],      // Light green
      lighter: [200, 230, 201],    // Very light green
      dark: [0, 60, 48],           // Very dark green
      text: [33, 37, 41],          // Dark gray
      muted: [108, 117, 125],      // Muted gray
      white: [255, 255, 255],      // White
      background: [248, 249, 250], // Light background
      tableHeader: [0, 77, 64],    // Dark green header
      tableBorder: [165, 214, 167], // Light green border
      tableAltRow: [232, 245, 233]  // Very light green alternate row
    };
  }

  // Initialize PDF document in landscape mode
  initializePDF() {
    this.doc = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape
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

  // Add clean header with two logos and big title
  async addHeader(reportName) {
    // Try to load the first logo (left side)
    try {
      const base64Logo1 = await this.loadImageAsBase64(logoImage);
      this.doc.addImage(base64Logo1, 'JPEG', 20, 15, 35, 35);
    } catch (error) {
      console.warn('Logo 1 loading failed, using fallback:', error);
      this.addFallbackLogo(20, 15, 35, 35);
    }

    // Try to load the second logo (right side)
    try {
      const base64Logo2 = await this.loadImageAsBase64(logoImage2);
      this.doc.addImage(base64Logo2, 'JPEG', this.pageWidth - 55, 15, 35, 35);
    } catch (error) {
      console.warn('Logo 2 loading failed, using fallback:', error);
      this.addFallbackLogo(this.pageWidth - 55, 15, 35, 35);
    }
    
    // Main title - large and centered
    this.doc.setTextColor(...this.colors.text);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    const titleWidth = this.doc.getTextWidth(reportName.toUpperCase());
    this.doc.text(reportName.toUpperCase(), (this.pageWidth - titleWidth) / 2, 30);
    
    // Subtitle - centered
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'normal');
    const subtitleWidth = this.doc.getTextWidth('MedConnect Report');
    this.doc.text('MedConnect Report', (this.pageWidth - subtitleWidth) / 2, 45);
    
    // Reset for body content
    this.yPosition = 70;
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

  // Add section title before tables
  addSectionTitle(title) {
    if (this.yPosition + 20 > this.pageHeight - 30) {
      this.doc.addPage();
      this.yPosition = 20;
    }

    // Add some space before section
    this.yPosition += 10;
    
    // Section title with underline
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text(title, 20, this.yPosition);
    
    // Add subtle underline
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.setDrawColor(...this.colors.primary);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, this.yPosition + 2, 20 + titleWidth, this.yPosition + 2);
    
    this.yPosition += 15;
  }

  // Enhanced table with clean styling (no background colors)
  addTable(title, headers, rows, description = '') {
    if (!title || !headers || !Array.isArray(headers)) {
      console.warn('Invalid table parameters:', { title, headers, rows });
      return;
    }
    
    // Add section title
    this.addSectionTitle(title);
    
    if (this.yPosition + 40 > this.pageHeight - 30) {
      this.doc.addPage();
      this.yPosition = 20;
    }
    
    // Handle empty data
    if (!rows || rows.length === 0) {
      this.addEmptyDataMessage();
      return;
    }
    
    // Clean and validate data
    const cleanRows = rows.map(row => 
      row.map(cell => {
        if (cell === null || cell === undefined) return '';
        return cell.toString().replace(/<[^>]*>/g, '').trim();
      })
    ).filter(row => row.length > 0);
    
    // Calculate optimal column widths
    const columnWidths = this.calculateColumnWidths(headers, cleanRows);
    
    try {
      this.doc.autoTable({
        head: [headers],
        body: cleanRows,
        startY: this.yPosition,
        margin: { left: 20, right: 20 },
        tableWidth: 'auto',
        columnStyles: this.generateColumnStyles(headers.length, columnWidths),
        
        // Clean styling - no background colors, just borders
        styles: {
          fontSize: 11,
          cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },
          font: 'helvetica',
          textColor: this.colors.text,
          lineColor: this.colors.text,
          lineWidth: 0.5,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          valign: 'middle',
          minCellHeight: 12,
          fillColor: this.colors.white
        },
        
        // Clean header styling - white background with borders only
        headStyles: {
          fillColor: this.colors.white,
          textColor: this.colors.text,
          fontStyle: 'bold',
          fontSize: 12,
          cellPadding: { top: 10, right: 6, bottom: 10, left: 6 },
          halign: 'center',
          valign: 'middle',
          minCellHeight: 15,
          lineColor: this.colors.text,
          lineWidth: 0.5
        },
        
        // No alternating row colors - all white
        alternateRowStyles: {
          fillColor: this.colors.white,
          lineColor: this.colors.text,
          lineWidth: 0.5
        },
        
        // Default row styling - white background
        rowStyles: {
          fillColor: this.colors.white,
          lineColor: this.colors.text,
          lineWidth: 0.5
        },
        
        // Clean table borders
        tableLineColor: this.colors.text,
        tableLineWidth: 0.5,
        
        // Clean table appearance
        theme: 'grid',
        
        // Better page break handling
        showHead: 'everyPage',
        pageBreak: 'auto',
        rowPageBreak: 'avoid'
      });
      
      this.yPosition = this.doc.lastAutoTable.finalY + 25;
      
      // Add description if provided
      if (description) {
        this.addTableDescription(description);
      }
      
    } catch (error) {
      console.warn('AutoTable failed, using enhanced fallback:', error);
      this.addEnhancedTableFallback(title, headers, cleanRows);
    }
  }

  // Calculate optimal column widths based on content
  calculateColumnWidths(headers, rows) {
    const columnWidths = {};
    const totalWidth = this.pageWidth - 40; // Account for margins
    
    headers.forEach((header, index) => {
      let maxWidth = this.doc.getTextWidth(header) + 10; // Header width + padding
      
      // Check content width
      rows.forEach(row => {
        if (row[index]) {
          const cellWidth = this.doc.getTextWidth(row[index].toString()) + 10;
          maxWidth = Math.max(maxWidth, cellWidth);
        }
      });
      
      // Set reasonable limits
      maxWidth = Math.min(maxWidth, totalWidth / headers.length * 1.5);
      maxWidth = Math.max(maxWidth, totalWidth / headers.length * 0.7);
      
      columnWidths[index] = maxWidth;
    });
    
    return columnWidths;
  }

  // Generate column styles based on content type
  generateColumnStyles(columnCount, columnWidths) {
    const styles = {};
    
    for (let i = 0; i < columnCount; i++) {
      styles[i] = {
        cellWidth: columnWidths[i] || 'auto',
        halign: this.getColumnAlignment(i, columnCount)
      };
    }
    
    return styles;
  }

  // Smart column alignment based on position and content
  getColumnAlignment(columnIndex, totalColumns) {
    // First column (usually names/identifiers) - left align
    if (columnIndex === 0) return 'left';
    
    // Last column (usually status/actions) - center align
    if (columnIndex === totalColumns - 1) return 'center';
    
    // Middle columns (usually numbers/data) - center align
    return 'center';
  }

  // Enhanced empty data message
  addEmptyDataMessage() {
    this.doc.setFillColor(...this.colors.lighter);
    this.doc.setDrawColor(...this.colors.light);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(20, this.yPosition - 5, this.pageWidth - 40, 25, 3, 3, 'FD');
    
    // Icon-like indicator
    this.doc.setFillColor(...this.colors.muted);
    this.doc.circle(35, this.yPosition + 7, 3, 'F');
    this.doc.setTextColor(...this.colors.white);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('!', 34, this.yPosition + 9);
    
    // Message text
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.muted);
    this.doc.text('No data available for this report section', 45, this.yPosition + 9);
    
    this.yPosition += 35;
  }

  // Add description text below table
  addTableDescription(description) {
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(...this.colors.muted);
    
    const lines = this.doc.splitTextToSize(description, this.pageWidth - 50);
    lines.forEach((line, index) => {
      this.doc.text(line, 25, this.yPosition + (index * 5));
    });
    
    this.yPosition += lines.length * 5 + 10;
  }

  // Enhanced fallback table method
  addEnhancedTableFallback(title, headers, rows) {
    if (this.yPosition + 30 > this.pageHeight - 30) {
      this.doc.addPage();
      this.yPosition = 20;
    }
    
    if (!rows || rows.length === 0) {
      this.addEmptyDataMessage();
      return;
    }
    
    const rowHeight = 14;
    const colWidth = (this.pageWidth - 40) / headers.length;
    
    // Clean header - white background with borders only
    this.doc.setFillColor(...this.colors.white);
    this.doc.setDrawColor(...this.colors.text);
    this.doc.setLineWidth(0.5);
    this.doc.rect(20, this.yPosition, this.pageWidth - 40, rowHeight, 'FD');
    
    this.doc.setTextColor(...this.colors.text);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, index) => {
      const headerText = header.length > 18 ? header.substring(0, 15) + '...' : header;
      const textWidth = this.doc.getTextWidth(headerText);
      this.doc.text(headerText, 25 + (index * colWidth) + (colWidth - textWidth) / 2, this.yPosition + 9);
    });
    
    this.yPosition += rowHeight;
    
    // Clean data rows - white background only
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    rows.forEach((row, rowIndex) => {
      if (this.yPosition + rowHeight > this.pageHeight - 30) {
        this.doc.addPage();
        this.yPosition = 20;
      }
      
      // White background for all rows
      this.doc.setFillColor(...this.colors.white);
      this.doc.rect(20, this.yPosition, this.pageWidth - 40, rowHeight, 'F');
      
      // Row border
      this.doc.setDrawColor(...this.colors.text);
      this.doc.setLineWidth(0.5);
      this.doc.rect(20, this.yPosition, this.pageWidth - 40, rowHeight, 'D');
      
      row.forEach((cell, colIndex) => {
        const cleanCell = cell.toString().replace(/<[^>]*>/g, '');
        const truncatedCell = cleanCell.length > 22 ? cleanCell.substring(0, 19) + '...' : cleanCell;
        const textWidth = this.doc.getTextWidth(truncatedCell);
        const xPos = 25 + (colIndex * colWidth) + (colWidth - textWidth) / 2;
        
        this.doc.text(truncatedCell, xPos, this.yPosition + 9);
      });
      
      this.yPosition += rowHeight;
    });
    
    this.yPosition += 20;
  }

  // Add simple metadata text under table (no background)
  addSimpleMetadata(downloadedBy, downloadedOn) {
    // Add some space
    this.yPosition += 10;
    
    // Simple text - no background or colors
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.text);
    
    this.doc.text(`Downloaded by: ${downloadedBy} | On: ${downloadedOn}`, 20, this.yPosition);
    
    this.yPosition += 20;
  }

  // Add report configuration section at bottom
  addReportConfiguration(startDate, endDate, search, reportType) {
    if (this.yPosition + 40 > this.pageHeight - 30) {
      this.doc.addPage();
      this.yPosition = 20;
    }
    
    // Add separator line
    this.doc.setDrawColor(...this.colors.light);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, this.yPosition + 10, this.pageWidth - 20, this.yPosition + 10);
    
    this.yPosition += 25;
    
    // Configuration box with subtle background
    this.doc.setFillColor(...this.colors.background);
    this.doc.setDrawColor(...this.colors.tableBorder);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(20, this.yPosition - 5, this.pageWidth - 40, 25, 3, 3, 'FD');
    
    // Configuration content
    this.doc.setFontSize(9);
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
    
    this.doc.text(`Generated by: Admin User`, 30, this.yPosition + 5);
    this.doc.text(`Generated on: ${dateString}`, 30, this.yPosition + 12);
    
    this.yPosition += 30;
  }

  // Add enhanced footer to all pages
  addFooters() {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Professional footer line with gradient effect
      this.doc.setDrawColor(...this.colors.tableBorder);
      this.doc.setLineWidth(0.5);
      this.doc.line(20, this.pageHeight - 20, this.pageWidth - 20, this.pageHeight - 20);
      
      // Lighter secondary line
      this.doc.setDrawColor(...this.colors.light);
      this.doc.setLineWidth(0.2);
      this.doc.line(20, this.pageHeight - 19, this.pageWidth - 20, this.pageHeight - 19);
      
      // Page number with better typography
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.colors.muted);
      const pageText = `Page ${i} of ${pageCount}`;
      const pageTextWidth = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, (this.pageWidth - pageTextWidth) / 2, this.pageHeight - 12);
      
      // Company/brand text on left
      this.doc.setFontSize(7);
      this.doc.text('MedConnect Healthcare System', 20, this.pageHeight - 12);
      
      // Generated timestamp on right
      const timestamp = new Date().toLocaleDateString();
      const timestampWidth = this.doc.getTextWidth(timestamp);
      this.doc.text(timestamp, this.pageWidth - 20 - timestampWidth, this.pageHeight - 12);
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
      
      this.addTable('User Role Distribution', roleHeaders, roleRows, 
        'Overview of user distribution across different system roles and their current status.');
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
      
      this.addTable('Recent User Registrations', userHeaders, userRows,
        'Latest user registrations in the system, showing the most recent 15 entries.');
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
      
      this.addTable('Doctor Profile Completeness Analysis', doctorHeaders, doctorRows,
        'Analysis of doctor profile completeness based on required information fields.');
    }

    // Add simple metadata at the end
    this.addSimpleMetadata('Admin User', new Date().toLocaleString());
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
      
      this.addTable('Doctor Performance Metrics', perfHeaders, perfRows,
        'Performance analysis showing appointment volumes and completion rates by doctor.');
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
      
      this.addTable('Appointments by Medical Specialization', specHeaders, specRows,
        'Distribution of appointments across different medical specializations.');
    }

    // Add simple metadata at the end
    this.addSimpleMetadata('Admin User', new Date().toLocaleString());
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
      
      this.addTable('Doctor Availability Overview', availHeaders, availRows,
        'Current availability status for all doctors showing open and total appointment slots.');
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
      
      this.addTable('Weekly Availability Pattern', dayHeaders, dayRows,
        'Weekly availability patterns showing slot distribution across different days.');
    }

    // Add simple metadata at the end
    this.addSimpleMetadata('Admin User', new Date().toLocaleString());
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
      
      this.addTable('Most Engaged Community Members', engagedHeaders, engagedRows,
        'Top community contributors based on post count and topic participation.');
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
      
      this.addTable('Success Stories Statistics', storyHeaders, storyRows,
        'Overview of success stories in the community platform by approval status.');
    }

    // Add simple metadata at the end
    this.addSimpleMetadata('Admin User', new Date().toLocaleString());
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
      
      // Add header with two logos
      await this.addHeader(reportName);
      
      // Generate content based on report type
      if (!reportData) {
        this.addEmptyDataMessage();
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
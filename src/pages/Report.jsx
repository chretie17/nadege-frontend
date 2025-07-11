import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import API_URL from '../api';
import html2canvas from 'jspdf-html2canvas';
import jsPDF from 'jspdf';

const Reports = () => {
  // Main state
  const [activeTab, setActiveTab] = useState('user-overview');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({});
  const [isPdfExporting, setIsPdfExporting] = useState(false);

  
  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ref for PDF printing
  const reportRef = React.useRef();
  
  // Load data on tab change or filter apply
  useEffect(() => {
    fetchReportData();
  }, [activeTab]);
  
  // Handle printing to PDF
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `EmpowerLink_${activeTab}_Report`,
  });
  
  // Fetch report data with optional filters
 const exportToPDF = async () => {
  // Show loading indicator
  setIsPdfExporting(true);
  
  try {
    // Create a new PDF document (A4 size)
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 50;
    
    // Create report title based on active tab
    const reportTitles = {
      'user-overview': 'User Overview Report',
      'job-market': 'Job Market Report',
      'skills-assessment': 'Skills Assessment Report',
      'community-engagement': 'Community Engagement Report'
    };
    const title = reportTitles[activeTab] || 'EmpowerLink Report';

    // ---- Document Header ----
    // Add logo (simulated with text for simplicity)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(30, 64, 175); // Dark blue
    pdf.text('EmpowerLink', margin, 60);
    
    // Add horizontal line
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(1);
    pdf.line(margin, 70, pageWidth - margin, 70);
    
    // Add report title
    pdf.setFontSize(18);
    pdf.setTextColor(60, 60, 60);
    pdf.text(title, margin, 100);
    
    // Add date and time
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 120);
    
    // Add filter information if any
    let yPos = 140;
    if (startDate || endDate || searchTerm) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      
      if (startDate || endDate) {
        let dateText = 'Date Range: ';
        if (startDate && endDate) {
          dateText += `${startDate} to ${endDate}`;
        } else if (startDate) {
          dateText += `From ${startDate}`;
        } else if (endDate) {
          dateText += `Until ${endDate}`;
        }
        pdf.text(dateText, margin, yPos);
        yPos += 15;
      }
      
      if (searchTerm) {
        pdf.text(`Search Filter: "${searchTerm}"`, margin, yPos);
        yPos += 15;
      }
      
      // Add space after filters
      yPos += 10;
    }
    
    // Add divider
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 20;
    
    // Add report content based on active tab
    switch (activeTab) {
      case 'user-overview':
        yPos = addUserOverviewContent(pdf, reportData, margin, yPos, pageWidth);
        break;
      case 'job-market':
        yPos = addJobMarketContent(pdf, reportData, margin, yPos, pageWidth);
        break;
      case 'skills-assessment':
        yPos = addSkillsAssessmentContent(pdf, reportData, margin, yPos, pageWidth);
        break;
      case 'community-engagement':
        yPos = addCommunityEngagementContent(pdf, reportData, margin, yPos, pageWidth);
        break;
      default:
        pdf.setTextColor(60, 60, 60);
        pdf.setFontSize(12);
        pdf.text('No data available for this report type.', margin, yPos);
    }
    
    // Add footer
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.line(margin, pageHeight - 50, pageWidth - margin, pageHeight - 50);
    
    pdf.setTextColor(120, 120, 120);
    pdf.setFontSize(8);
    pdf.text('EmpowerLink © ' + new Date().getFullYear(), margin, pageHeight - 30);
    pdf.text('Page 1', pageWidth - margin - 30, pageHeight - 30);
    
    // Save the PDF file
    pdf.save(`EmpowerLink_${activeTab}_${new Date().toISOString().slice(0,10)}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('There was an error generating the PDF. Please try again later.');
  } finally {
    setIsPdfExporting(false);
  }
};

// Function to add a section title consistently
const addSectionTitle = (pdf, title, margin, yPos) => {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(30, 64, 175); // Dark blue
  pdf.text(title, margin, yPos);
  return yPos + 20;
};

// Function to create a clean table
const createTable = (pdf, headers, data, margin, startY, pageWidth, options = {}) => {
  const defaultOptions = {
    fontSize: 9,
    headerFontSize: 10,
    rowHeight: 25,
    textColor: [60, 60, 60],
    headerBgColor: [240, 240, 240],
    alternateRowColor: [248, 248, 248]
  };
  
  const opts = { ...defaultOptions, ...options };
  let yPos = startY;
  
  // Calculate column widths
  const tableWidth = pageWidth - (2 * margin);
  const colWidths = [];
  
  if (headers.length > 0) {
    // Equal width if not specified
    const equalWidth = tableWidth / headers.length;
    headers.forEach(header => {
      colWidths.push(header.width || equalWidth);
    });
  }
  
  // Draw table header
  pdf.setFillColor(...opts.headerBgColor);
  pdf.rect(margin, yPos, tableWidth, opts.rowHeight, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...opts.textColor);
  pdf.setFontSize(opts.headerFontSize);
  
  let xOffset = margin + 5;
  headers.forEach((header, index) => {
    pdf.text(header.name, xOffset, yPos + opts.rowHeight/2 + opts.headerFontSize/3);
    xOffset += colWidths[index];
  });
  
  yPos += opts.rowHeight;
  
  // Draw rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(opts.fontSize);
  
  data.forEach((row, rowIndex) => {
    // Alternate row background for better readability
    if (rowIndex % 2 === 0) {
      pdf.setFillColor(...opts.alternateRowColor);
      pdf.rect(margin, yPos, tableWidth, opts.rowHeight, 'F');
    }
    
    // Add cell data
    let xOffset = margin + 5;
    headers.forEach((header, colIndex) => {
      const value = row[header.key];
      let displayValue = value;
      
      // Handle special formatting
      if (header.format === 'date' && value) {
        displayValue = new Date(value).toLocaleDateString();
      } else if (header.format === 'capitalize' && value) {
        displayValue = value.charAt(0).toUpperCase() + value.slice(1);
      } else if (typeof value === 'undefined' || value === null) {
        displayValue = '-';
      }
      
      // Apply custom text color if specified
      if (header.getTextColor) {
        const customColor = header.getTextColor(value);
        if (customColor) {
          pdf.setTextColor(...customColor);
        } else {
          pdf.setTextColor(...opts.textColor);
        }
      }
      
      pdf.text(String(displayValue), xOffset, yPos + opts.rowHeight/2 + opts.fontSize/3);
      
      // Reset text color after custom coloring
      if (header.getTextColor) {
        pdf.setTextColor(...opts.textColor);
      }
      
      xOffset += colWidths[colIndex];
    });
    
    yPos += opts.rowHeight;
  });
  
  // Add border around the table
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, startY, tableWidth, (data.length + 1) * opts.rowHeight);
  
  // Return the Y position after the table
  return yPos + 10;
};

// Function to add User Overview Content
const addUserOverviewContent = (pdf, reportData, margin, startY, pageWidth) => {
  let yPos = startY;
  const { usersByRole, recentUsers, usersBySkillCategory } = reportData;
  
  if (!usersByRole) {
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(12);
    pdf.text('No data available for User Overview.', margin, yPos);
    return yPos + 20;
  }
  
  // Users by Role Section
  yPos = addSectionTitle(pdf, 'Users by Role', margin, yPos);
  
  // Create a table for user roles
  const roleHeaders = [
    { name: 'Role', key: 'role', format: 'capitalize', width: 200 },
    { name: 'Count', key: 'count', width: 200 }
  ];
  
  yPos = createTable(pdf, roleHeaders, usersByRole, margin, yPos, pageWidth);
  yPos += 20;
  
  // Recent Users Section
  if (recentUsers && recentUsers.length > 0) {
    yPos = addSectionTitle(pdf, 'Recent Registrations', margin, yPos);
    
    const userHeaders = [
      { name: 'Name', key: 'name', width: 150 },
      { name: 'Email', key: 'email', width: 200 },
      { name: 'Role', key: 'role', format: 'capitalize', width: 100 },
      { name: 'Registered', key: 'created_at', format: 'date', width: 100 }
    ];
    
    yPos = createTable(pdf, userHeaders, recentUsers.slice(0, 5), margin, yPos, pageWidth);
    yPos += 20;
  }
  
  // Skills Distribution Section
  if (usersBySkillCategory && usersBySkillCategory.length > 0) {
    yPos = addSectionTitle(pdf, 'Skills Distribution', margin, yPos);
    
    const skillHeaders = [
      { name: 'Skill Category', key: 'category_name', width: 300 },
      { name: 'Number of Users', key: 'user_count', width: 200 }
    ];
    
    yPos = createTable(pdf, skillHeaders, usersBySkillCategory, margin, yPos, pageWidth);
  }
  
  return yPos;
};

// Function to add Job Market Content
const addJobMarketContent = (pdf, reportData, margin, startY, pageWidth) => {
  let yPos = startY;
  const { totalJobs, jobsByLocation, applicationStats } = reportData;
  
  if (!totalJobs) {
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(12);
    pdf.text('No data available for Job Market.', margin, yPos);
    return yPos + 20;
  }
  
  // Job Market Overview Section
  yPos = addSectionTitle(pdf, 'Job Market Overview', margin, yPos);
  
  // Create a table for job stats
  const jobHeaders = [
    { name: 'Metric', key: 'metric', width: 300 },
    { name: 'Value', key: 'value', width: 200 }
  ];
  
  const jobData = [
    { metric: 'Total Jobs', value: totalJobs.total_jobs },
    { metric: 'Active Jobs', value: totalJobs.active_jobs }
  ];
  
  yPos = createTable(pdf, jobHeaders, jobData, margin, yPos, pageWidth);
  yPos += 20;
  
  // Top Locations Section
  if (jobsByLocation && jobsByLocation.length > 0) {
    yPos = addSectionTitle(pdf, 'Top Locations', margin, yPos);
    
    const locationHeaders = [
      { name: 'Location', key: 'location', width: 300 },
      { name: 'Number of Jobs', key: 'job_count', width: 200 }
    ];
    
    yPos = createTable(pdf, locationHeaders, jobsByLocation.slice(0, 5), margin, yPos, pageWidth);
    yPos += 20;
  }
  
  // Application Stats Section
  if (applicationStats) {
    yPos = addSectionTitle(pdf, 'Application Statistics', margin, yPos);
    
    const appHeaders = [
      { name: 'Metric', key: 'metric', width: 300 },
      { name: 'Value', key: 'value', width: 200 }
    ];
    
    const appData = [
      { metric: 'Total Applications', value: applicationStats.total_applications },
      { metric: 'Accepted Applications', value: applicationStats.accepted_applications },
      { metric: 'Pending Applications', value: applicationStats.pending_applications }
    ];
    
    yPos = createTable(pdf, appHeaders, appData, margin, yPos, pageWidth);
  }
  
  return yPos;
};

// Function to add Skills Assessment Content
const addSkillsAssessmentContent = (pdf, reportData, margin, startY, pageWidth) => {
  let yPos = startY;
  const { commonSkills, skillGap, topSkilledUsers } = reportData;
  
  if (!commonSkills) {
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(12);
    pdf.text('No data available for Skills Assessment.', margin, yPos);
    return yPos + 20;
  }
  
  // Most Common Skills Section
  if (commonSkills.length > 0) {
    yPos = addSectionTitle(pdf, 'Most Common Skills', margin, yPos);
    
    const skillHeaders = [
      { name: 'Skill', key: 'skill_name', width: 300 },
      { name: 'User Count', key: 'user_count', width: 200 }
    ];
    
    yPos = createTable(pdf, skillHeaders, commonSkills.slice(0, 5), margin, yPos, pageWidth);
    yPos += 20;
  }
  
  // Skills Gap Section
  if (skillGap && skillGap.length > 0) {
    yPos = addSectionTitle(pdf, 'Skills Demand-Supply Gap', margin, yPos);
    
    const gapHeaders = [
      { name: 'Skill', key: 'skill_name', width: 200 },
      { name: 'Demand', key: 'demand_count', width: 100 },
      { name: 'Supply', key: 'supply_count', width: 100 },
      { 
        name: 'Gap', 
        key: 'gap', 
        width: 100,
        // Add color coding for gap
        getTextColor: (value) => {
          if (value > 0) return [220, 53, 69]; // Red for shortage
          if (value < 0) return [40, 167, 69]; // Green for surplus
          return [60, 60, 60]; // Default text color
        }
      }
    ];
    
    // Process data to display gap as text
    const gapData = skillGap.slice(0, 5).map(skill => ({
      ...skill,
      gap: skill.gap > 0 ? `${skill.gap} shortage` : skill.gap < 0 ? `${Math.abs(skill.gap)} surplus` : 'Balanced'
    }));
    
    yPos = createTable(pdf, gapHeaders, gapData, margin, yPos, pageWidth);
    yPos += 20;
  }
  
  // Top Skilled Users Section
  if (topSkilledUsers && topSkilledUsers.length > 0) {
    yPos = addSectionTitle(pdf, 'Top Skilled Users', margin, yPos);
    
    const userHeaders = [
      { name: 'Name', key: 'name', width: 200 },
      { name: 'Average Rating', key: 'avg_proficiency', width: 150 },
      { name: 'Skills Count', key: 'skills_count', width: 150 }
    ];
    
    // Format the data to display rating as X/5
    const userData = topSkilledUsers.slice(0, 5).map(user => ({
      ...user,
      avg_proficiency: `${user.avg_proficiency}/5`
    }));
    
    yPos = createTable(pdf, userHeaders, userData, margin, yPos, pageWidth);
  }
  
  return yPos;
};

// Function to add Community Engagement Content
const addCommunityEngagementContent = (pdf, reportData, margin, startY, pageWidth) => {
  let yPos = startY;
  const { forumActivity, successStories, popularTopics } = reportData;
  
  if (!forumActivity) {
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(12);
    pdf.text('No data available for Community Engagement.', margin, yPos);
    return yPos + 20;
  }
  
  // Forum Activity Section
  yPos = addSectionTitle(pdf, 'Forum Activity', margin, yPos);
  
  const activityHeaders = [
    { name: 'Metric', key: 'metric', width: 300 },
    { name: 'Value', key: 'value', width: 200 }
  ];
  
  const activityData = [
    { metric: 'Total Topics', value: forumActivity.total_topics },
    { metric: 'Total Posts', value: forumActivity.total_posts },
    { metric: 'Active Users', value: forumActivity.active_users }
  ];
  
  yPos = createTable(pdf, activityHeaders, activityData, margin, yPos, pageWidth);
  yPos += 20;
  
  // Success Stories Section
  if (successStories) {
    yPos = addSectionTitle(pdf, 'Success Stories', margin, yPos);
    
    const storyHeaders = [
      { name: 'Metric', key: 'metric', width: 300 },
      { name: 'Value', key: 'value', width: 200 }
    ];
    
    const storyData = [
      { metric: 'Total Stories', value: successStories.total_stories },
      { metric: 'Approved Stories', value: successStories.approved_stories }
    ];
    
    yPos = createTable(pdf, storyHeaders, storyData, margin, yPos, pageWidth);
    yPos += 20;
  }
  
  // Popular Topics Section
  if (popularTopics && popularTopics.length > 0) {
    yPos = addSectionTitle(pdf, 'Popular Discussion Topics', margin, yPos);
    
    const topicHeaders = [
      { name: 'Topic', key: 'title', width: 250 },
      { name: 'Posts', key: 'post_count', width: 100 },
      { name: 'Last Activity', key: 'last_activity', format: 'date', width: 150 }
    ];
    
    yPos = createTable(pdf, topicHeaders, popularTopics.slice(0, 5), margin, yPos, pageWidth);
  }
  
  return yPos;
};
 
  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (searchTerm) params.append('search', searchTerm);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axios.get(`${API_URL}/reports/${activeTab}${queryString}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Apply search and date filters
  const handleApplyFilters = () => {
    fetchReportData();
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setTimeout(fetchReportData, 10);
  };
  
  // Render different report tabs
  const renderReport = () => {
    switch (activeTab) {
      case 'user-overview':
        return renderUserOverview();
      case 'job-market':
        return renderJobMarket();
      case 'skills-assessment':
        return renderSkillsAssessment();
      case 'community-engagement':
        return renderCommunityEngagement();
      default:
        return <div>Select a report type</div>;
    }
  };
  
  // Render user overview report
  const renderUserOverview = () => {
    const { usersByRole, recentUsers, completeProfiles, usersBySkillCategory } = reportData;
    
    if (!usersByRole) return <div className="text-center">No data available</div>;
    
    return (
      <div className="space-y-6">
        {/* Users by Role */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Users by Role</h3>
          <div className="grid grid-cols-3 gap-4">
            {usersByRole.map(role => (
              <div key={role.role} className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{role.count}</div>
                <div className="text-gray-600 capitalize">{role.role}s</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Registrations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsers.slice(0, 5).map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Skills Categories */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Skills Distribution</h3>
          <div className="grid grid-cols-2 gap-4">
            {usersBySkillCategory && usersBySkillCategory.map(category => (
              <div key={category.category_name} className="flex justify-between items-center p-3 border rounded-lg">
                <span>{category.category_name}</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{category.user_count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render job market report
  const renderJobMarket = () => {
    const { totalJobs, jobsByLocation, applicationStats } = reportData;
    
    if (!totalJobs) return <div className="text-center">No data available</div>;
    
    return (
      <div className="space-y-6">
        {/* Job Overview */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Job Market Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-indigo-600">{totalJobs.total_jobs}</div>
              <div className="text-gray-600">Total Jobs</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{totalJobs.active_jobs}</div>
              <div className="text-gray-600">Active Jobs</div>
            </div>
          </div>
        </div>
        
        {/* Locations */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Locations</h3>
          <div className="space-y-3">
            {jobsByLocation && jobsByLocation.map(location => (
              <div key={location.location} className="flex items-center">
                <div className="w-32">{location.location}</div>
                <div className="flex-1 mx-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${(location.job_count / jobsByLocation[0].job_count) * 100}%` }}>
                    </div>
                  </div>
                </div>
                <div className="w-10 text-right">{location.job_count}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Application Stats */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application Statistics</h3>
          {applicationStats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg text-center bg-gray-50">
                <div className="text-2xl font-bold text-gray-700">{applicationStats.total_applications}</div>
                <div className="text-gray-600">Total</div>
              </div>
              <div className="p-4 rounded-lg text-center bg-green-50">
                <div className="text-2xl font-bold text-green-600">{applicationStats.accepted_applications}</div>
                <div className="text-gray-600">Accepted</div>
              </div>
              <div className="p-4 rounded-lg text-center bg-yellow-50">
                <div className="text-2xl font-bold text-yellow-600">{applicationStats.pending_applications}</div>
                <div className="text-gray-600">Pending</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render skills assessment report
  const renderSkillsAssessment = () => {
    const { commonSkills, skillGap, topSkilledUsers } = reportData;
    
    if (!commonSkills) return <div className="text-center">No data available</div>;
    
    return (
      <div className="space-y-6">
        {/* Common Skills */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Common Skills</h3>
          <div className="space-y-3">
            {commonSkills.slice(0, 5).map(skill => (
              <div key={skill.skill_name} className="flex items-center">
                <div className="w-32">{skill.skill_name}</div>
                <div className="flex-1 mx-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-cyan-600 h-2.5 rounded-full" 
                          style={{ width: `${(skill.user_count / commonSkills[0].user_count) * 100}%` }}>
                    </div>
                  </div>
                </div>
                <div className="w-10 text-right">{skill.user_count}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Skill Gap */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Skills Demand-Supply Gap</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supply</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gap</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skillGap && skillGap.slice(0, 5).map(skill => (
                  <tr key={skill.skill_name}>
                    <td className="px-6 py-4 whitespace-nowrap">{skill.skill_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{skill.demand_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{skill.supply_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${skill.gap > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {skill.gap > 0 ? `${skill.gap} shortage` : `${Math.abs(skill.gap)} surplus`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Top Users */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Skilled Users</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topSkilledUsers && topSkilledUsers.slice(0, 5).map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.avg_proficiency}/5</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.skills_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  // Render community engagement report
  const renderCommunityEngagement = () => {
    const { forumActivity, successStories, popularTopics } = reportData;
    
    if (!forumActivity) return <div className="text-center">No data available</div>;
    
    return (
      <div className="space-y-6">
        {/* Forum Activity */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Forum Activity</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg text-center bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">{forumActivity.total_topics}</div>
              <div className="text-gray-600">Topics</div>
            </div>
            <div className="p-4 rounded-lg text-center bg-indigo-50">
              <div className="text-2xl font-bold text-indigo-600">{forumActivity.total_posts}</div>
              <div className="text-gray-600">Posts</div>
            </div>
            <div className="p-4 rounded-lg text-center bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">{forumActivity.active_users}</div>
              <div className="text-gray-600">Active Users</div>
            </div>
          </div>
        </div>
        
        {/* Success Stories */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Success Stories</h3>
          {successStories && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg text-center bg-yellow-50">
                <div className="text-2xl font-bold text-yellow-600">{successStories.total_stories}</div>
                <div className="text-gray-600">Total Stories</div>
              </div>
              <div className="p-4 rounded-lg text-center bg-green-50">
                <div className="text-2xl font-bold text-green-600">{successStories.approved_stories}</div>
                <div className="text-gray-600">Approved</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Popular Topics */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Discussion Topics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {popularTopics && popularTopics.slice(0, 5).map(topic => (
                  <tr key={topic.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{topic.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{topic.post_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(topic.last_activity).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Page Header */}
          <div className="bg-blue-900 px-6 py-4 text-white">
          <h1 className="text-2xl font-bold">EmpowerLink Reports</h1>
            <p className="text-blue-100">System analytics and performance metrics</p>
          </div>
          
          {/* Filters */}
          <div className="border-b border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md shadow-sm p-2"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md shadow-sm p-2"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md shadow-sm p-2 w-full"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={handleApplyFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Apply
                </button>
                
                <button 
                  onClick={handleClearFilters}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Clear
                </button>
                
                <button 
                  onClick={exportToPDF}
                  disabled={isPdfExporting || loading}
                  className={`${
                    isPdfExporting || loading 
                      ? 'bg-green-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white px-4 py-2 rounded-md flex items-center`}
                >
                  {isPdfExporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Report Tabs */}
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('user-overview')}
                className={`px-4 py-2 rounded-md ${activeTab === 'user-overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                User Overview
              </button>
              
              <button
                onClick={() => setActiveTab('job-market')}
                className={`px-4 py-2 rounded-md ${activeTab === 'job-market' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Job Market
              </button>
              
              <button
                onClick={() => setActiveTab('skills-assessment')}
                className={`px-4 py-2 rounded-md ${activeTab === 'skills-assessment' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Skills Assessment
              </button>
              
              <button
                onClick={() => setActiveTab('community-engagement')}
                className={`px-4 py-2 rounded-md ${activeTab === 'community-engagement' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Community Engagement
              </button>
            </div>
          </div>
          
          {/* Report Content */}
          <div className="p-6" ref={reportRef}>
            {/* Report Title for PDF */}
            <div className="mb-6 print-only">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'user-overview' && 'User Overview Report'}
                {activeTab === 'job-market' && 'Job Market Report'}
                {activeTab === 'skills-assessment' && 'Skills Assessment Report'}
                {activeTab === 'community-engagement' && 'Community Engagement Report'}
              </h2>
              <p className="text-sm text-gray-500">
                {startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : 
                 startDate ? `From ${startDate}` : 
                 endDate ? `Until ${endDate}` : 
                 'All Time Data'}
              </p>
              {searchTerm && <p className="text-sm text-gray-500">Search: "{searchTerm}"</p>}
              <hr className="my-4" />
            </div>
            
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              renderReport()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, Tabs, Tab, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, Badge, Chip, Typography, 
  Box, Snackbar, Alert, Menu, MenuItem, CircularProgress,
  TablePagination, Switch, FormControlLabel, Divider
} from '@mui/material';
import { 
  Edit, Delete, Check, Close, Flag, Star, StarBorder, 
  Search, Visibility, VisibilityOff, FilterList, MoreVert,
  Refresh, ArrowUpward, ArrowDownward, PushPin, Announcement,
} from '@mui/icons-material';
import ForumIcon from '@mui/icons-material/Forum';
import moment from 'moment';

// Custom tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminContentManagement = () => {
  // State for tab management
  const [tabValue, setTabValue] = useState(0);
  const [subTabValue, setSubTabValue] = useState(0);
  
  // Data states
  const [successStories, setSuccessStories] = useState([]);
  const [pendingStories, setPendingStories] = useState([]);
  const [forumTopics, setForumTopics] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilters, setTopicFilters] = useState({ pinned: false, flagged: false });
  const [storyFilters, setStoryFilters] = useState({ featured: false });
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Form edit states
  const [editedStory, setEditedStory] = useState({ title: '', content: '', is_featured: false });
  const [editedPost, setEditedPost] = useState({ content: '' });
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Filter data based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') return;
    
    const timer = setTimeout(() => {
      if (tabValue === 0) {
        // Filter success stories
      } else if (tabValue === 1) {
        // Filter forum content
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, tabValue]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch success stories
      const storiesResponse = await axios.get(`${API_URL}/admin/success-stories`);
      
      // Separate approved and pending stories
      const approved = storiesResponse.data.filter(story => story.is_approved);
      const pending = storiesResponse.data.filter(story => !story.is_approved);
      
      setSuccessStories(approved);
      setPendingStories(pending);
      
      // Fetch forum topics and posts
      const topicsResponse = await axios.get(`${API_URL}/admin/forum/topics`);
      setForumTopics(topicsResponse.data);
      
      // Fetch flagged content
      const flaggedResponse = await axios.get(`${API_URL}/admin/flagged-content`);
      setFlaggedContent(flaggedResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setSnackbarMessage('Failed to load data. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchTerm('');
    setPage(0);
  };
  
  const handleSubTabChange = (event, newValue) => {
    setSubTabValue(newValue);
    setPage(0);
  };
  
  // Success Stories Management Functions
  
  const handleApproveStory = async (storyId) => {
    try {
      await axios.put(`${API_URL}/success-stories/${storyId}/approve`);
      setSnackbarMessage('Success story approved and published');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Update local state
      const approvedStory = pendingStories.find(story => story.id === storyId);
      if (approvedStory) {
        setPendingStories(pendingStories.filter(story => story.id !== storyId));
        setSuccessStories([...successStories, {...approvedStory, is_approved: true}]);
      }
    } catch (error) {
      console.error('Error approving story:', error);
      setSnackbarMessage('Failed to approve story. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleRejectStory = async (storyId) => {
    try {
      await axios.delete(`${API_URL}/admin/success-stories/${storyId}`);
      setSnackbarMessage('Success story rejected');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      
      // Update local state
      setPendingStories(pendingStories.filter(story => story.id !== storyId));
    } catch (error) {
      console.error('Error rejecting story:', error);
      setSnackbarMessage('Failed to reject story. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleToggleFeatureStory = async (story) => {
    try {
      const updatedIsFeatured = !story.is_featured;
      await axios.put(`${API_URL}/admin/success-stories/${story.id}`, {
        is_featured: updatedIsFeatured
      });
      
      // Update local state
      setSuccessStories(successStories.map(s => 
        s.id === story.id ? {...s, is_featured: updatedIsFeatured} : s
      ));
      
      setSnackbarMessage(`Story ${updatedIsFeatured ? 'featured' : 'unfeatured'} successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating story featured status:', error);
      setSnackbarMessage('Failed to update story. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleOpenStoryEditor = (story) => {
    setSelectedStory(story);
    setEditedStory({
      title: story.title,
      content: story.content,
      is_featured: story.is_featured || false
    });
    setStoryDialogOpen(true);
  };
  
  const handleSaveStoryEdit = async () => {
    try {
      await axios.put(`${API_URL}/admin/success-stories/${selectedStory.id}`, editedStory);
      
      // Update local state
      const updatedStory = { ...selectedStory, ...editedStory };
      
      if (selectedStory.is_approved) {
        setSuccessStories(successStories.map(story => 
          story.id === selectedStory.id ? updatedStory : story
        ));
      } else {
        setPendingStories(pendingStories.map(story => 
          story.id === selectedStory.id ? updatedStory : story
        ));
      }
      
      setStoryDialogOpen(false);
      setSnackbarMessage('Story updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating story:', error);
      setSnackbarMessage('Failed to update story. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Forum Management Functions
  
  const handleTogglePinTopic = async (topic) => {
    try {
      const updatedIsPinned = !topic.is_pinned;
      await axios.put(`${API_URL}/admin/forum/topics/${topic.id}`, {
        is_pinned: updatedIsPinned
      });
      
      // Update local state
      setForumTopics(forumTopics.map(t => 
        t.id === topic.id ? {...t, is_pinned: updatedIsPinned} : t
      ));
      
      setSnackbarMessage(`Topic ${updatedIsPinned ? 'pinned' : 'unpinned'} successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating topic pin status:', error);
      setSnackbarMessage('Failed to update topic. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleDeleteTopic = async (topicId) => {
    try {
      await axios.delete(`${API_URL}/admin/forum/topics/${topicId}`);
      
      // Update local state
      setForumTopics(forumTopics.filter(topic => topic.id !== topicId));
      
      setSnackbarMessage('Topic deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting topic:', error);
      setSnackbarMessage('Failed to delete topic. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleOpenPostEditor = (post) => {
    setSelectedPost(post);
    setEditedPost({
      content: post.content
    });
    setPostDialogOpen(true);
  };
  
  const handleSavePostEdit = async () => {
    try {
      await axios.put(`${API_URL}/admin/forum/posts/${selectedPost.id}`, editedPost);
      
      // Update local state
      const updatedPost = { ...selectedPost, ...editedPost };
      setForumPosts(forumPosts.map(post => 
        post.id === selectedPost.id ? updatedPost : post
      ));
      
      setPostDialogOpen(false);
      setSnackbarMessage('Post updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating post:', error);
      setSnackbarMessage('Failed to update post. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleOpenConfirmation = (action, itemId) => {
    setConfirmationAction({ type: action, id: itemId });
    setConfirmationDialogOpen(true);
  };
  
  const handleConfirmAction = () => {
    const { type, id } = confirmationAction;
    
    switch (type) {
      case 'deleteTopic':
        handleDeleteTopic(id);
        break;
      case 'rejectStory':
        handleRejectStory(id);
        break;
      default:
        console.error('Unknown action type:', type);
    }
    
    setConfirmationDialogOpen(false);
    setConfirmationAction(null);
  };
  
  const handleLoadTopicPosts = async (topicId) => {
    setSelectedTopic(topicId);
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/admin/forum/topics/${topicId}/posts`);
      setForumPosts(response.data);
      setSubTabValue(1); // Switch to posts tab
      setLoading(false);
    } catch (error) {
      console.error('Error loading topic posts:', error);
      setSnackbarMessage('Failed to load posts. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleActionsMenuOpen = (event) => {
    setActionsMenuAnchor(event.currentTarget);
  };
  
  const handleActionsMenuClose = () => {
    setActionsMenuAnchor(null);
  };
  
  // Filtering handlers
  const handleToggleTopicFilter = (filter) => {
    setTopicFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  const handleToggleStoryFilter = (filter) => {
    setStoryFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const getFilteredSuccessStories = () => {
    let filtered = [...successStories];
    
    if (storyFilters.featured) {
      filtered = filtered.filter(story => story.is_featured);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(story => 
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.author_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const getFilteredTopics = () => {
    let filtered = [...forumTopics];
    
    if (topicFilters.pinned) {
      filtered = filtered.filter(topic => topic.is_pinned);
    }
    
    if (topicFilters.flagged) {
      filtered = filtered.filter(topic => topic.is_flagged);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(topic => 
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        topic.creator_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                <span className="border-b-4 border-green-500 pb-1">Manage Forum</span>
              </h1>
              <p className="text-gray-600 mt-2">Manage community content and user interactions</p>
            </div>
            
            <div className="flex items-center space-x-3">
              
            </div>
          </div>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="admin tabs"
              sx={{ '& .MuiTab-root': { fontWeight: 500, py: 2 } }}
            >
              <Tab 
                label={
                  <div className="flex items-center">
                    <Star className="mr-2 text-yellow-500" fontSize="small" />
                    <span>Success Stories</span>
                    {pendingStories.length > 0 && (
                      <Badge 
                        badgeContent={pendingStories.length} 
                        color="error" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </div>
                } 
              />
              <Tab 
                label={
                  <div className="flex items-center">
                    <ForumIcon className="mr-2 text-green-500" fontSize="small" />
                    <span>Forum Management</span>
                    {flaggedContent.length > 0 && (
                      <Badge 
                        badgeContent={flaggedContent.length} 
                        color="error" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </div>
                }
              />
            </Tabs>
          </Box>
          
          {/* Success Stories Management Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={subTabValue} 
                onChange={handleSubTabChange} 
                aria-label="success stories tabs"
                sx={{ '& .MuiTab-root': { fontSize: '0.9rem' } }}
              >
                <Tab label="Published Stories" />
                <Tab 
                  label={
                    <div className="flex items-center">
                      <span>Pending Approval</span>
                      {pendingStories.length > 0 && (
                        <Badge 
                          badgeContent={pendingStories.length} 
                          color="error" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </div>
                  } 
                />
              </Tabs>
            </Box>
            
            {/* Search and filter bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-3 md:space-y-0">
              <div className="relative w-full md:w-64">
                <TextField
                  placeholder="Search stories..."
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                    style: { borderRadius: '0.5rem' }
                  }}
                />
              </div>
              
              <div className="flex items-center space-x-2">
          
                
                
              </div>
            </div>
            
            {/* Published Stories Tab Content */}
            <TabPanel value={subTabValue} index={0}>
              {loading ? (
                <div className="flex justify-center my-12">
                  <CircularProgress />
                </div>
              ) : getFilteredSuccessStories().length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No published stories found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {searchTerm || storyFilters.featured ? 
                      'Try adjusting your search or filters' : 
                      'Approve pending stories to publish them'}
                  </Typography>
                </div>
              ) : (
                <>
                  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                        <TableRow>
                          <TableCell width="40%">Story Details</TableCell>
                          <TableCell width="20%">Author</TableCell>
                          <TableCell width="15%">Date</TableCell>
                          <TableCell width="10%">Status</TableCell>
                          <TableCell width="15%" align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getFilteredSuccessStories()
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((story) => (
                            <TableRow 
                              key={story.id}
                              sx={{ 
                                '&:hover': { backgroundColor: '#f9fafb' },
                                backgroundColor: story.is_featured ? 'rgba(255, 244, 229, 0.3)' : 'inherit'
                              }}
                            >
                              <TableCell>
                                <Typography variant="subtitle2" className="font-semibold text-gray-800">
                                  {story.title}
                                  {story.is_featured && (
                                    <Star fontSize="small" className="ml-1 text-yellow-500" />
                                  )}
                                </Typography>
                                <Typography variant="body2" className="text-gray-600 line-clamp-2 mt-1">
                                  {story.content.substring(0, 120)}...
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-medium mr-2">
                                    {story.author_name.charAt(0).toUpperCase()}
                                  </div>
                                  <Typography variant="body2">
                                    {story.author_name}
                                  </Typography>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {moment(story.created_at).format('MMM D, YYYY')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={story.is_featured ? "Featured" : "Published"} 
                                  size="small"
                                  color={story.is_featured ? "primary" : "default"}
                                  sx={{ fontWeight: 500 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleToggleFeatureStory(story)}
                                  title={story.is_featured ? "Unfeature story" : "Feature story"}
                                >
                                  {story.is_featured ? <StarBorder /> : <Star className="text-gray-400" />}
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleOpenStoryEditor(story)}
                                  title="Edit story"
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleOpenConfirmation('rejectStory', story.id)}
                                  title="Delete story"
                                >
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <TablePagination
                    component="div"
                    count={getFilteredSuccessStories().length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </>
              )}
            </TabPanel>
            
            {/* Pending Stories Tab Content */}
            <TabPanel value={subTabValue} index={1}>
              {loading ? (
                <div className="flex justify-center my-12">
                  <CircularProgress />
                </div>
              ) : pendingStories.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No stories pending approval
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    All submitted stories have been reviewed
                  </Typography>
                </div>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                      <TableRow>
                        <TableCell width="40%">Story Details</TableCell>
                        <TableCell width="20%">Author</TableCell>
                        <TableCell width="15%">Submitted</TableCell>
                        <TableCell width="25%" align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingStories.map((story) => (
                        <TableRow 
                          key={story.id}
                          sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}
                        >
                          <TableCell>
                            <Typography variant="subtitle2" className="font-semibold text-gray-800">
                              {story.title}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 line-clamp-2 mt-1">
                              {story.content.substring(0, 120)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-medium mr-2">
                                {story.author_name.charAt(0).toUpperCase()}
                              </div>
                              <Typography variant="body2">
                                {story.author_name}
                                {story.is_anonymous && (
                                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    Anonymous
                                  </span>
                                )}
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {moment(story.created_at).format('MMM D, YYYY')}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              {moment(story.created_at).fromNow()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Close />}
                              onClick={() => handleOpenConfirmation('rejectStory', story.id)}
                              sx={{ mr: 1, borderRadius: '1rem' }}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<Check />}
                              onClick={() => handleApproveStory(story.id)}
                              sx={{ borderRadius: '1rem' }}
                            >
                              Approve
                            </Button>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenStoryEditor(story)}
                              title="Edit before approval"
                              sx={{ ml: 1 }}
                            >
                              <Edit />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          </TabPanel>
          
          {/* Forum Management Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={subTabValue} 
                onChange={handleSubTabChange} 
                aria-label="forum management tabs"
                sx={{ '& .MuiTab-root': { fontSize: '0.9rem' } }}
              >
                <Tab label="Topics" />
                {selectedTopic && <Tab label="Posts" />}
                <Tab 
                  label={
                    <div className="flex items-center">
                     
                    </div>
                  }
                />
              </Tabs>
            </Box>
            
            {/* Search and filter bar for forum */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-3 md:space-y-0">
              <div className="relative w-full md:w-64">
                <TextField
                  placeholder="Search forum content..."
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                    style: { borderRadius: '0.5rem' }
                  }}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                
                
                
              </div>
            </div>
            
            {/* Topics Tab Content */}
            <TabPanel value={subTabValue} index={0}>
              {loading ? (
                <div className="flex justify-center my-12">
                  <CircularProgress />
                </div>
              ) : getFilteredTopics().length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No topics found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {searchTerm || topicFilters.pinned || topicFilters.flagged ? 
                      'Try adjusting your search or filters' : 
                      'There are no forum topics yet'}
                  </Typography>
                </div>
              ) : (
                <>
                  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                        <TableRow>
                          <TableCell width="40%">Topic</TableCell>
                          <TableCell width="15%">Creator</TableCell>
                          <TableCell width="10%">Posts</TableCell>
                          <TableCell width="15%">Last Activity</TableCell>
                          <TableCell width="20%" align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getFilteredTopics()
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((topic) => (
                            <TableRow 
                              key={topic.id}
                              sx={{ 
                                '&:hover': { backgroundColor: '#f9fafb' },
                                backgroundColor: topic.is_pinned ? 'rgba(236, 253, 245, 0.3)' : (
                                  topic.is_flagged ? 'rgba(254, 242, 242, 0.3)' : 'inherit'
                                )
                              }}
                            >
                              <TableCell>
                                <Typography 
                                  variant="subtitle2" 
                                  className="font-semibold text-gray-800 cursor-pointer hover:text-green-600"
                                  onClick={() => handleLoadTopicPosts(topic.id)}
                                >
                                  {topic.is_pinned && (
                                    <PushPin fontSize="small" className="mr-1 text-green-600" />
                                  )}
                                  {topic.title}
                                  {topic.is_flagged && (
                                    <Flag fontSize="small" className="ml-1 text-red-500" />
                                  )}
                                </Typography>
                                {topic.description && (
                                  <Typography variant="body2" className="text-gray-600 line-clamp-1 mt-1">
                                    {topic.description}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-medium mr-2">
                                    {topic.creator_name.charAt(0).toUpperCase()}
                                  </div>
                                  <Typography variant="body2">
                                    {topic.creator_name}
                                  </Typography>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" className="font-medium">
                                  {topic.post_count || 0}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {topic.last_post_date ? moment(topic.last_post_date).format('MMM D, YYYY') : 'No posts'}
                                </Typography>
                                {topic.last_post_date && (
                                  <Typography variant="caption" className="text-gray-500">
                                    {moment(topic.last_post_date).fromNow()}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleTogglePinTopic(topic)}
                                  title={topic.is_pinned ? "Unpin topic" : "Pin topic"}
                                >
                                  <PushPin className={topic.is_pinned ? "text-green-600" : "text-gray-400"} />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleLoadTopicPosts(topic.id)}
                                  title="View posts"
                                >
                                  <Visibility />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleOpenConfirmation('deleteTopic', topic.id)}
                                  title="Delete topic"
                                >
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <TablePagination
                    component="div"
                    count={getFilteredTopics().length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </>
              )}
            </TabPanel>
            
            {/* Posts Tab Content */}
            <TabPanel value={subTabValue} index={1}>
              {!selectedTopic ? (
                <Typography variant="subtitle1" className="text-center py-8">
                  Select a topic to view posts
                </Typography>
              ) : loading ? (
                <div className="flex justify-center my-12">
                  <CircularProgress />
                </div>
              ) : forumPosts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No posts in this topic
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    This topic has no replies yet
                  </Typography>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-100">
                    <Typography variant="subtitle1" className="flex items-center text-green-800 font-semibold">
                      <ArrowUpward fontSize="small" className="mr-2" />
                      Viewing posts for topic: {forumTopics.find(t => t.id === selectedTopic)?.title}
                    </Typography>
                    <Button 
                      size="small" 
                      variant="text" 
                      onClick={() => setSubTabValue(0)}
                      className="mt-2"
                    >
                      Back to topics
                    </Button>
                  </div>
                
                  {forumPosts.map((post, index) => (
                    <Paper 
                      key={post.id} 
                      elevation={0} 
                      className="mb-4 border border-gray-200 rounded-xl overflow-hidden"
                      sx={{ 
                        backgroundColor: post.is_hidden ? 'rgba(243, 244, 246, 0.7)' : 'white',
                      }}
                    >
                      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-gray-200 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center font-medium mr-2">
                            {post.user_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Typography variant="subtitle2" className="font-medium">
                              {post.user_name}
                              {index === 0 && (
                                <Chip 
                                  label="Topic Starter" 
                                  size="small" 
                                  className="ml-2" 
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              )}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {moment(post.created_at).format('MMM D, YYYY [at] h:mm A')}
                            </Typography>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {post.is_flagged && (
                            <Chip 
                              icon={<Flag fontSize="small" />} 
                              label="Flagged" 
                              color="error" 
                              size="small"
                              sx={{ mr: 2 }}
                            />
                          )}
                          {post.is_hidden && (
                            <Chip 
                              icon={<VisibilityOff fontSize="small" />} 
                              label="Hidden" 
                              color="default" 
                              size="small"
                              sx={{ mr: 2 }}
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        {post.is_hidden ? (
                          <div className="text-gray-500 italic">
                            <VisibilityOff fontSize="small" className="mr-2" />
                            This post has been hidden by a moderator
                          </div>
                        ) : (
                          <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                            {post.content}
                          </Typography>
                        )}
                        
                        <div className="flex justify-end mt-4 space-x-2">
                          {!post.is_hidden && (
                            <Button
                              variant="outlined"
                              size="small"
                              color="primary"
                              startIcon={<Edit />}
                              onClick={() => handleOpenPostEditor(post)}
                              sx={{ borderRadius: '1rem' }}
                            >
                              Edit
                            </Button>
                          )}
                          
                          
                        </div>
                      </div>
                    </Paper>
                  ))}
                </>
              )}
            </TabPanel>
            
            {/* Flagged Content Tab */}
            <TabPanel value={subTabValue} index={selectedTopic ? 2 : 1}>
              {loading ? (
                <div className="flex justify-center my-12">
                  <CircularProgress />
                </div>
              ) : flaggedContent.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No flagged content
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    There are no posts or topics that have been flagged for review
                  </Typography>
                </div>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                      <TableRow>
                        <TableCell width="15%">Type</TableCell>
                        <TableCell width="40%">Content</TableCell>
                        <TableCell width="15%">Author</TableCell>
                        <TableCell width="15%">Flagged On</TableCell>
                        <TableCell width="15%" align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {flaggedContent.map((item) => (
                        <TableRow 
                          key={`${item.type}-${item.id}`}
                          sx={{ 
                            '&:hover': { backgroundColor: '#f9fafb' },
                            backgroundColor: 'rgba(254, 242, 242, 0.2)'
                          }}
                        >
                          <TableCell>
                            <Chip 
                              label={item.type === 'topic' ? 'Topic' : 'Post'} 
                              color="error" 
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" className="font-semibold text-gray-800">
                              {item.type === 'topic' ? item.title : `Re: ${item.topic_title}`}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 line-clamp-2 mt-1">
                              {item.content ? item.content.substring(0, 120) + '...' : item.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="bg-red-100 text-red-800 rounded-full w-8 h-8 flex items-center justify-center font-medium mr-2">
                                {item.author_name.charAt(0).toUpperCase()}
                              </div>
                              <Typography variant="body2">
                                {item.author_name}
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {moment(item.flagged_at).format('MMM D, YYYY')}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              {moment(item.flagged_at).fromNow()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="outlined"
                              size="small"
                              color="success"
                              startIcon={<Check />}
                              sx={{ mr: 1, borderRadius: '1rem' }}
                            >
                              Approve
                            </Button>
                            <IconButton 
                              size="small" 
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          </TabPanel>
          
        </div>
      </div>
      
      {/* Edit Success Story Dialog */}
      <Dialog 
        open={storyDialogOpen} 
        onClose={() => setStoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { borderRadius: '0.75rem' }
        }}
      >
        <DialogTitle>
          <div className="flex items-center text-green-800">
            <Edit className="mr-2" />
            Edit Success Story
          </div>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Story Title"
            type="text"
            fullWidth
            value={editedStory.title}
            onChange={(e) => setEditedStory({...editedStory, title: e.target.value})}
            required
            variant="outlined"
            className="mb-4"
            sx={{ mt: 2 }}
            InputProps={{
              style: { borderRadius: '0.5rem' }
            }}
          />
          <TextField
            margin="dense"
            label="Story Content"
            type="text"
            fullWidth
            multiline
            rows={8}
            value={editedStory.content}
            onChange={(e) => setEditedStory({...editedStory, content: e.target.value})}
            required
            variant="outlined"
            className="mb-4"
            InputProps={{
              style: { borderRadius: '0.5rem' }
            }}
          />
          <FormControlLabel
            control={
              <Switch 
                checked={editedStory.is_featured}
                onChange={(e) => setEditedStory({...editedStory, is_featured: e.target.checked})}
                color="primary"
              />
            }
            label="Feature this story"
          />
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          <Button 
            onClick={() => setStoryDialogOpen(false)}
            style={{ 
              textTransform: 'none',
              borderRadius: '0.5rem',
              padding: '8px 16px'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveStoryEdit}
            variant="contained" 
            color="primary"
            className="bg-green-600 hover:bg-green-700"
            style={{ 
              textTransform: 'none',
              borderRadius: '0.5rem',
              padding: '8px 16px'
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Post Dialog */}
      <Dialog 
        open={postDialogOpen} 
        onClose={() => setPostDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { borderRadius: '0.75rem' }
        }}
      >
        <DialogTitle>
          <div className="flex items-center text-green-800">
            <Edit className="mr-2" />
            Edit Post
          </div>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Post Content"
            type="text"
            fullWidth
            multiline
            rows={8}
            value={editedPost.content}
            onChange={(e) => setEditedPost({...editedPost, content: e.target.value})}
            required
            variant="outlined"
            sx={{ mt: 2 }}
            InputProps={{
              style: { borderRadius: '0.5rem' }
            }}
          />
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          <Button 
            onClick={() => setPostDialogOpen(false)}
            style={{ 
              textTransform: 'none',
              borderRadius: '0.5rem',
              padding: '8px 16px'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSavePostEdit}
            variant="contained" 
            color="primary"
            className="bg-green-600 hover:bg-green-700"
            style={{ 
              textTransform: 'none',
              borderRadius: '0.5rem',
              padding: '8px 16px'
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialogOpen}
        onClose={() => setConfirmationDialogOpen(false)}
        PaperProps={{
          style: { borderRadius: '0.75rem' }
        }}
      >
        <DialogTitle>
          {confirmationAction?.type === 'deleteTopic' 
            ? "Delete Topic" 
            : confirmationAction?.type === 'rejectStory'
              ? "Reject Story"
              : "Confirm Action"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {confirmationAction?.type === 'deleteTopic'
              ? "Are you sure you want to delete this topic? This will remove all posts in this topic and cannot be undone."
              : confirmationAction?.type === 'rejectStory'
                ? "Are you sure you want to reject this story? This action cannot be undone."
                : "Are you sure you want to continue with this action?"}
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          <Button 
            onClick={() => setConfirmationDialogOpen(false)}
            style={{ 
              textTransform: 'none',
              borderRadius: '0.5rem',
              padding: '8px 16px'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction}
            variant="contained" 
            color="error"
            style={{ 
              textTransform: 'none',
              borderRadius: '0.5rem',
              padding: '8px 16px'
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminContentManagement;
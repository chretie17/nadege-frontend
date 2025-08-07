import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { 
    Snackbar, 
    Alert, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Avatar,
    Tooltip
} from '@mui/material';
import moment from 'moment';

const Groups = () => {
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [activeTab, setActiveTab] = useState('all-groups');
    
    // Dialog states
    const [openNewGroupDialog, setOpenNewGroupDialog] = useState(false);
    const [openNewPostDialog, setOpenNewPostDialog] = useState(false);
    const [openMembersDialog, setOpenMembersDialog] = useState(false);
    
    // Form states
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [newGroupPrivacy, setNewGroupPrivacy] = useState('public');
    const [newGroupCategory, setNewGroupCategory] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [userLikes, setUserLikes] = useState({});

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const user_id = user?.id;

    const categories = [
        'Healthcare', 'Support', 'Wellness', 'Education', 'Research', 
        'Specialties', 'Students', 'General', 'Emergency', 'Technology'
    ];

    useEffect(() => {
        if (user_id) {
            fetchData();
        } else {
            setLoading(false);
            showMessage('You must be logged in to access groups', 'warning');
        }
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all public groups
            const groupsResponse = await axios.get(`${API_URL}/groups`);
            setGroups(groupsResponse.data);
            
            // Fetch user's groups
            const userGroupsResponse = await axios.get(`${API_URL}/groups/user/${user_id}`);
            setUserGroups(userGroupsResponse.data);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching groups:', error);
            showMessage('Failed to load groups. Please try again later.', 'error');
            setLoading(false);
        }
    };

    const showMessage = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            showMessage('Group name is required', 'error');
            return;
        }
        
        try {
            await axios.post(`${API_URL}/groups`, {
                name: newGroupName,
                description: newGroupDescription,
                privacy: newGroupPrivacy,
                category: newGroupCategory,
                created_by: user_id
            });
            
            setOpenNewGroupDialog(false);
            resetGroupForm();
            showMessage('Group created successfully');
            fetchData();
        } catch (error) {
            console.error('Error creating group:', error);
            showMessage('Failed to create group. Please try again.', 'error');
        }
    };

    const handleJoinGroup = async (groupId) => {
        try {
            await axios.post(`${API_URL}/groups/join`, {
                groupId: groupId,
                userId: user_id
            });
            
            showMessage('Successfully joined group');
            fetchData();
        } catch (error) {
            console.error('Error joining group:', error);
            showMessage(error.response?.data?.error || 'Failed to join group', 'error');
        }
    };

    const handleLeaveGroup = async (groupId) => {
        if (window.confirm('Are you sure you want to leave this group?')) {
            try {
                await axios.post(`${API_URL}/groups/leave`, {
                    groupId: groupId,
                    userId: user_id
                });
                
                showMessage('Successfully left group');
                fetchData();
                if (currentGroup && currentGroup.id === groupId) {
                    setCurrentGroup(null);
                }
            } catch (error) {
                console.error('Error leaving group:', error);
                showMessage(error.response?.data?.error || 'Failed to leave group', 'error');
            }
        }
    };

    const handleViewGroup = async (group) => {
        try {
            const response = await axios.get(`${API_URL}/groups/${group.id}?userId=${user_id}`);
            setCurrentGroup(response.data);
        } catch (error) {
            console.error('Error fetching group details:', error);
            showMessage('Failed to load group details', 'error');
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) {
            showMessage('Post content is required', 'error');
            return;
        }
        
        try {
            await axios.post(`${API_URL}/groups/posts`, {
                group_id: currentGroup.id,
                user_id: user_id,
                content: newPostContent
            });
            
            setOpenNewPostDialog(false);
            setNewPostContent('');
            showMessage('Post created successfully');
            
            // Refresh group data
            handleViewGroup(currentGroup);
        } catch (error) {
            console.error('Error creating post:', error);
            showMessage(error.response?.data?.error || 'Failed to create post', 'error');
        }
    };

    const handleLikePost = async (postId, likeType) => {
        try {
            await axios.post(`${API_URL}/groups/posts/like`, {
                post_id: postId,
                user_id: user_id,
                like_type: likeType
            });
            
            // Update local state
            setUserLikes(prev => ({
                ...prev,
                [postId]: likeType
            }));
            
            showMessage(`Post ${likeType}d successfully`);
            handleViewGroup(currentGroup); // Refresh to get updated counts
        } catch (error) {
            console.error('Error liking post:', error);
            showMessage(error.response?.data?.error || 'Failed to update post rating', 'error');
        }
    };

    const fetchGroupMembers = async (groupId) => {
        try {
            const response = await axios.get(`${API_URL}/groups/${groupId}/members`);
            setGroupMembers(response.data);
            setOpenMembersDialog(true);
        } catch (error) {
            console.error('Error fetching group members:', error);
            showMessage('Failed to load group members', 'error');
        }
    };

    const resetGroupForm = () => {
        setNewGroupName('');
        setNewGroupDescription('');
        setNewGroupPrivacy('public');
        setNewGroupCategory('');
    };

    const isUserMember = (groupId) => {
        return userGroups.some(group => group.id === groupId);
    };

    const getUserRole = (groupId) => {
        const userGroup = userGroups.find(group => group.id === groupId);
        return userGroup?.user_role || null;
    };

    const filteredGroups = groups.filter(group => {
        const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = !selectedCategory || group.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                        <p className="text-green-600 mt-4 font-medium">Loading groups...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-100">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-green-800">
                            <span className="border-b-4 border-green-500 pb-1">Doctor Groups</span>
                        </h1>
                        <div className="hidden md:flex space-x-2">
                            <div className="flex items-center text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                </svg>
                                <span className="font-medium">{groups.length} Groups</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">{userGroups.length} Joined</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => {
                                setActiveTab('all-groups');
                                setCurrentGroup(null);
                            }}
                            className={`py-3 px-6 font-medium text-sm mr-4 transition-colors duration-200 ${
                                activeTab === 'all-groups' 
                                    ? 'text-green-600 border-b-2 border-green-600' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                </svg>
                                All Groups
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('my-groups');
                                setCurrentGroup(null);
                            }}
                            className={`py-3 px-6 font-medium text-sm transition-colors duration-200 ${
                                activeTab === 'my-groups' 
                                    ? 'text-green-600 border-b-2 border-green-600' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                My Groups ({userGroups.length})
                            </div>
                        </button>
                    </div>

                    {/* Content */}
                    {!currentGroup ? (
                        <div>
                            {/* Controls */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
                                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search groups..."
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full sm:w-64"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    {activeTab === 'all-groups' && (
                                        <FormControl size="small" className="w-full sm:w-48">
                                            <InputLabel>Category</InputLabel>
                                            <Select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                label="Category"
                                            >
                                                <MenuItem value="">All Categories</MenuItem>
                                                {categories.map(category => (
                                                    <MenuItem key={category} value={category}>{category}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                </div>
                                <Button 
                                    variant="contained" 
                                    onClick={() => setOpenNewGroupDialog(true)}
                                    className="bg-green-600 hover:bg-green-700 shadow-md"
                                    style={{ textTransform: 'none', padding: '8px 16px' }}
                                >
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Create Group
                                    </div>
                                </Button>
                            </div>

                            {/* Groups Grid */}
                            {activeTab === 'all-groups' ? (
                                <div>
                                    <h2 className="text-xl font-semibold text-green-800 mb-4">Discover Groups</h2>
                                    {filteredGroups.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <h3 className="text-xl font-bold mb-2 text-gray-800">No groups found</h3>
                                            <p className="text-gray-600 mb-6">Try adjusting your search or create a new group!</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredGroups.map(group => (
                                                <div key={group.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                                    <div className="p-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center">
                                                                <div className="bg-green-100 text-green-800 rounded-full w-10 h-10 flex items-center justify-center font-medium mr-3">
                                                                    {group.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-semibold text-green-800 line-clamp-1">{group.name}</h3>
                                                                    {group.category && (
                                                                        <Chip 
                                                                            label={group.category} 
                                                                            size="small" 
                                                                            className="mt-1"
                                                                            style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center text-gray-500">
                                                                {group.privacy === 'private' && (
                                                                    <Tooltip title="Private Group">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </Tooltip>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="text-gray-600 mb-4 line-clamp-2">{group.description || 'No description available'}</p>
                                                        
                                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                            <div className="flex items-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                                                </svg>
                                                                {group.member_count || 0} members
                                                            </div>
                                                            <div className="flex items-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                                                </svg>
                                                                {group.post_count || 0} posts
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <button
                                                                onClick={() => handleViewGroup(group)}
                                                                className="text-green-600 hover:text-green-800 font-medium flex items-center"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                                </svg>
                                                                View
                                                            </button>
                                                            
                                                            {isUserMember(group.id) ? (
                                                                <button
                                                                    onClick={() => handleLeaveGroup(group.id)}
                                                                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                                                >
                                                                    Leave
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleJoinGroup(group.id)}
                                                                    className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                                                >
                                                                    Join
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-xl font-semibold text-green-800 mb-4">Your Groups</h2>
                                    {userGroups.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <h3 className="text-xl font-bold mb-2 text-gray-800">You haven't joined any groups yet</h3>
                                            <p className="text-gray-600 mb-6">Discover groups that match your interests!</p>
                                            <Button 
                                                variant="contained" 
                                                onClick={() => setActiveTab('all-groups')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Explore Groups
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {userGroups.map(group => (
                                                <div key={group.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                                    <div className="p-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center">
                                                                <div className="bg-green-100 text-green-800 rounded-full w-10 h-10 flex items-center justify-center font-medium mr-3">
                                                                    {group.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-semibold text-green-800 line-clamp-1">{group.name}</h3>
                                                                    <div className="flex items-center space-x-2 mt-1">
                                                                        {group.category && (
                                                                            <Chip 
                                                                                label={group.category} 
                                                                                size="small"
                                                                                style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                                                                            />
                                                                        )}
                                                                        {group.user_role === 'admin' && (
                                                                            <Chip 
                                                                                label="Admin" 
                                                                                size="small"
                                                                                style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="text-gray-600 mb-4 line-clamp-2">{group.description || 'No description available'}</p>
                                                        
                                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                            <div className="flex items-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                                                </svg>
                                                                {group.member_count || 0} members
                                                            </div>
                                                            <div className="flex items-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                                                </svg>
                                                                {group.post_count || 0} posts
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <button
                                                                onClick={() => handleViewGroup(group)}
                                                                className="text-green-600 hover:text-green-800 font-medium flex items-center"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                </svg>
                                                                Enter Group
                                                            </button>
                                                            
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => fetchGroupMembers(group.id)}
                                                                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                                                >
                                                                    Members
                                                                </button>
                                                                {group.user_role !== 'admin' && (
                                                                    <button
                                                                        onClick={() => handleLeaveGroup(group.id)}
                                                                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                                                    >
                                                                        Leave
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Group Detail View
                        <div>
                            <div className="bg-gradient-to-r from-green-50 to-indigo-50 p-6 rounded-xl mb-6 shadow-sm border border-green-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-4">
                                            {currentGroup.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-green-800 mb-1">{currentGroup.name}</h2>
                                            <div className="flex items-center space-x-4 text-gray-600">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                                    </svg>
                                                    {currentGroup.member_count} members
                                                </div>
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                                                    </svg>
                                                    Created by {currentGroup.creator_name}
                                                </div>
                                                {currentGroup.category && (
                                                    <Chip 
                                                        label={currentGroup.category} 
                                                        size="small"
                                                        style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                                                    />
                                                )}
                                                {currentGroup.privacy === 'private' && (
                                                    <Chip 
                                                        label="Private" 
                                                        size="small"
                                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                                                        style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => fetchGroupMembers(currentGroup.id)}
                                            className="bg-white text-green-600 border border-green-300 hover:bg-green-50 px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            View Members
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setCurrentGroup(null); 
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="text-green-600 hover:text-green-800 flex items-center transition-colors bg-white px-4 py-2 rounded-lg border border-green-300 hover:bg-green-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                            </svg>
                                            Back to Groups
                                        </button>
                                    </div>
                                </div>
                                {currentGroup.description && (
                                    <p className="text-green-700 mt-2">{currentGroup.description}</p>
                                )}
                            </div>

                            {currentGroup.can_view_posts ? (
                                <div>
                                    {currentGroup.user_membership && currentGroup.user_membership.status === 'active' && (
                                        <div className="mb-6 flex justify-center">
                                            <Button 
                                                variant="contained" 
                                                onClick={() => setOpenNewPostDialog(true)}
                                                className="bg-green-600 hover:bg-green-700 shadow-md"
                                                style={{ textTransform: 'none', padding: '10px 20px' }}
                                            >
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                                    </svg>
                                                    Create Post
                                                </div>
                                            </Button>
                                        </div>
                                    )}

                                    {currentGroup.posts && currentGroup.posts.length > 0 ? (
                                        <div className="space-y-6">
                                            {currentGroup.posts.map((post, index) => (
                                                <div key={post.id} className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
                                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-medium mr-3">
                                                                {post.user_name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-800">{post.user_name}</span>
                                                                <div className="text-gray-500 text-sm mt-0.5">
                                                                    {moment(post.created_at).format('MMM D, YYYY [at] h:mm A')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-gray-400 text-sm">
                                                            #{index + 1}
                                                        </div>
                                                    </div>
                                                    <div className="px-6 py-5">
                                                        <div className="prose max-w-none mb-4 text-gray-800">
                                                            {post.content}
                                                        </div>
                                                        {currentGroup.user_membership && currentGroup.user_membership.status === 'active' && (
                                                            <div className="flex items-center space-x-6 border-t pt-4 mt-4">
                                                                <button 
                                                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${userLikes[post.id] === 'like'
                                                                        ? 'bg-green-100 text-green-700' 
                                                                        : 'text-gray-600 hover:bg-gray-100'}`}
                                                                    onClick={() => handleLikePost(post.id, 'like')}
                                                                    disabled={userLikes[post.id]}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                                    </svg>
                                                                    <span className="font-medium">{post.likes || 0}</span>
                                                                </button>
                                                                <button 
                                                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${userLikes[post.id] === 'dislike'
                                                                        ? 'bg-red-100 text-red-700' 
                                                                        : 'text-gray-600 hover:bg-gray-100'}`}
                                                                    onClick={() => handleLikePost(post.id, 'dislike')}
                                                                    disabled={userLikes[post.id]}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                                                                    </svg>
                                                                    <span className="font-medium">{post.dislikes || 0}</span>
                                                                </button>
                                                                <div className="ml-auto">
                                                                    {userLikes[post.id] === 'like' && 
                                                                        <span className="text-green-600 text-sm italic">You liked this post</span>
                                                                    }
                                                                    {userLikes[post.id] === 'dislike' && 
                                                                        <span className="text-red-600 text-sm italic">You disliked this post</span>
                                                                    }
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                            <h3 className="font-medium text-gray-700 mb-2 text-xl">No posts yet</h3>
                                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                {currentGroup.user_membership && currentGroup.user_membership.status === 'active' 
                                                    ? "Be the first to share something with this group!"
                                                    : "Join this group to see posts and participate in discussions."}
                                            </p>
                                            {currentGroup.user_membership && currentGroup.user_membership.status === 'active' && (
                                                <Button 
                                                    variant="contained" 
                                                    onClick={() => setOpenNewPostDialog(true)}
                                                    className="bg-green-600 hover:bg-green-700 shadow-md"
                                                >
                                                    Create First Post
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <h3 className="font-medium text-gray-700 mb-2 text-xl">Private Group</h3>
                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                        You need to be a member of this group to view its content.
                                    </p>
                                    {!currentGroup.user_membership && (
                                        <Button 
                                            variant="contained" 
                                            onClick={() => handleJoinGroup(currentGroup.id)}
                                            className="bg-green-600 hover:bg-green-700 shadow-md"
                                        >
                                            Request to Join
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Group Dialog */}
            <Dialog 
                open={openNewGroupDialog} 
                onClose={() => setOpenNewGroupDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ style: { borderRadius: '0.75rem' } }}
            >
                <DialogTitle>
                    <div className="flex items-center text-green-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Create New Group
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className="bg-green-50 p-4 rounded-lg mb-4 text-green-700 text-sm">
                        <p>Create a space for like-minded individuals to connect, share knowledge, and support each other.</p>
                    </div>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Group Name"
                        type="text"
                        fullWidth
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        required
                        variant="outlined"
                        className="mb-4"
                        InputProps={{ style: { borderRadius: '0.5rem' } }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                        variant="outlined"
                        className="mb-4"
                        placeholder="Describe the purpose and goals of your group"
                        InputProps={{ style: { borderRadius: '0.5rem' } }}
                    />
                    <div className="flex space-x-4 mb-4">
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={newGroupCategory}
                                onChange={(e) => setNewGroupCategory(e.target.value)}
                                label="Category"
                            >
                                <MenuItem value="">Select Category</MenuItem>
                                {categories.map(category => (
                                    <MenuItem key={category} value={category}>{category}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Privacy</InputLabel>
                            <Select
                                value={newGroupPrivacy}
                                onChange={(e) => setNewGroupPrivacy(e.target.value)}
                                label="Privacy"
                            >
                                <MenuItem value="public">Public - Anyone can join</MenuItem>
                                <MenuItem value="private">Private - Approval required</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setOpenNewGroupDialog(false)}
                        style={{ textTransform: 'none', borderRadius: '0.5rem', padding: '8px 16px' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateGroup} 
                        variant="contained" 
                        className="bg-green-600 hover:bg-green-700"
                        style={{ textTransform: 'none', borderRadius: '0.5rem', padding: '8px 16px' }}
                    >
                        Create Group
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Post Dialog */}
            <Dialog 
                open={openNewPostDialog} 
                onClose={() => setOpenNewPostDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ style: { borderRadius: '0.75rem' } }}
            >
                <DialogTitle>
                    <div className="flex items-center text-green-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Create Post in: {currentGroup?.name}
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
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        required
                        variant="outlined"
                        placeholder="Share your thoughts, questions, or insights with the group..."
                        InputProps={{ style: { borderRadius: '0.5rem' } }}
                    />
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setOpenNewPostDialog(false)}
                        style={{ textTransform: 'none', borderRadius: '0.5rem', padding: '8px 16px' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreatePost}
                        variant="contained" 
                        className="bg-green-600 hover:bg-green-700"
                        style={{ textTransform: 'none', borderRadius: '0.5rem', padding: '8px 16px' }}
                    >
                        Create Post
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Group Members Dialog */}
            <Dialog 
                open={openMembersDialog} 
                onClose={() => setOpenMembersDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ style: { borderRadius: '0.75rem' } }}
            >
                <DialogTitle>
                    <div className="flex items-center text-green-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Group Members ({groupMembers.length})
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className="space-y-3">
                        {groupMembers.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <Avatar 
                                        className="mr-3"
                                        style={{ backgroundColor: '#2563eb', width: 40, height: 40 }}
                                    >
                                        {member.user_name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-gray-800">{member.user_name}</div>
                                        <div className="text-sm text-gray-500">
                                            Joined {moment(member.joined_at).fromNow()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    {member.role === 'admin' && (
                                        <Chip 
                                            label="Admin" 
                                            size="small"
                                            style={{ backgroundColor: '#fef3c7', color: '#d97706' }}
                                        />
                                    )}
                                    {member.role === 'moderator' && (
                                        <Chip 
                                            label="Moderator" 
                                            size="small"
                                            style={{ backgroundColor: '#e0e7ff', color: '#5b21b6' }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setOpenMembersDialog(false)}
                        style={{ textTransform: 'none', borderRadius: '0.5rem', padding: '8px 16px' }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={5000} 
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setOpenSnackbar(false)} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Groups;
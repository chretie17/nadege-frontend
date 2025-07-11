import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';

const CommunityPost = () => {
    const [loading, setLoading] = useState(true);
    const [topics, setTopics] = useState([]);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [openNewTopicDialog, setOpenNewTopicDialog] = useState(false);
    const [openNewPostDialog, setOpenNewPostDialog] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicDescription, setNewTopicDescription] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [successStories, setSuccessStories] = useState([]);
    const [openNewStoryDialog, setOpenNewStoryDialog] = useState(false);
    const [newStoryTitle, setNewStoryTitle] = useState('');
    const [newStoryContent, setNewStoryContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [activeTab, setActiveTab] = useState('forums');
    const [userLikes, setUserLikes] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [topicsToShow, setTopicsToShow] = useState([]);

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const user_id = user?.id;
    
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    // Effect to filter topics based on search term
    useEffect(() => {
        if (topics.length > 0) {
            if (searchTerm.trim() === '') {
                setTopicsToShow(topics);
            } else {
                const filtered = topics.filter(topic => 
                    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    topic.creator_name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setTopicsToShow(filtered);
            }
        }
    }, [searchTerm, topics]);

    const fetchData = async () => {
        if (!user_id) {
            setLoading(false);
            setSnackbarMessage('You must be logged in to access this feature');
            setSnackbarSeverity('warning');
            setOpenSnackbar(true);
            return;
        }
        
        setLoading(true);
        try {
            // Fetch forum topics
            const topicsResponse = await axios.get(`${API_URL}/forum/topics`);
            const topicsWithFixedCounts = topicsResponse.data.map(topic => ({
                ...topic,
                post_count: topic.post_count || 0 // Ensure post_count is never null
            }));
            setTopics(topicsWithFixedCounts);
            setTopicsToShow(topicsWithFixedCounts);
            
            // Fetch success stories
            const storiesResponse = await axios.get(`${API_URL}/success-stories`);
            setSuccessStories(storiesResponse.data);
            
            // Fetch user likes
            if (user_id) {
                try {
                    const likesResponse = await axios.get(`${API_URL}/post-likes/user/${user_id}`);
                    const likesMap = {};
                    likesResponse.data.forEach(like => {
                        likesMap[like.post_id] = like.like_type;
                    });
                    setUserLikes(likesMap);
                } catch (error) {
                    console.error('Error fetching user likes:', error);
                }
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setSnackbarMessage('Failed to load data. Please try again later.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            setLoading(false);
        }
    };

    const handleCreateTopic = async () => {
        if (!newTopicTitle.trim()) {
            setSnackbarMessage('Topic title is required');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            await axios.post(`${API_URL}/forum/topics`, {
                title: newTopicTitle,
                description: newTopicDescription,
                created_by: user_id
            });
            
            setOpenNewTopicDialog(false);
            setNewTopicTitle('');
            setNewTopicDescription('');
            setSnackbarMessage('Topic created successfully');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            
            // Refresh the topics list
            fetchData();
        } catch (error) {
            console.error('Error creating topic:', error);
            setSnackbarMessage('Failed to create topic. Please try again.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) {
            setSnackbarMessage('Post content is required');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            await axios.post(`${API_URL}/forum/posts`, {
                topic_id: currentTopic.id,
                user_id: user_id,
                content: newPostContent
            });
            
            setOpenNewPostDialog(false);
            setNewPostContent('');
            setSnackbarMessage('Post added successfully');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            
            // Refresh the current topic to include the new post
            const topicResponse = await axios.get(`${API_URL}/forum/topics/${currentTopic.id}`);
            
            // Process posts with user likes data
            if (topicResponse.data && topicResponse.data.posts) {
                topicResponse.data.posts = topicResponse.data.posts.map(post => ({
                    ...post,
                    userLiked: userLikes[post.id] === 'like',
                    userDisliked: userLikes[post.id] === 'dislike'
                }));
            }
            
            setCurrentTopic(topicResponse.data);
            
            // Also update the post count in the topics list
            setTopics(prevTopics => {
                return prevTopics.map(topic => {
                    if (topic.id === currentTopic.id) {
                        return {
                            ...topic,
                            post_count: (topic.post_count || 0) + 1,
                            last_post_date: new Date()
                        };
                    }
                    return topic;
                });
            });
            
            // Update filtered topics as well
            setTopicsToShow(prevTopics => {
                return prevTopics.map(topic => {
                    if (topic.id === currentTopic.id) {
                        return {
                            ...topic,
                            post_count: (topic.post_count || 0) + 1,
                            last_post_date: new Date()
                        };
                    }
                    return topic;
                });
            });
        } catch (error) {
            console.error('Error creating post:', error);
            setSnackbarMessage('Failed to add post. Please try again.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    // Handle post like/dislike
    const handleLikePost = async (postId, likeType) => {
        if (!user_id) {
            setSnackbarMessage('You must be logged in to like or dislike posts');
            setSnackbarSeverity('warning');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            // Check if user has already liked/disliked this post
            if (userLikes[postId]) {
                setSnackbarMessage('You have already rated this post');
                setSnackbarSeverity('info');
                setOpenSnackbar(true);
                return;
            }
            
            // Make API call to record the like/dislike
            await axios.post(`${API_URL}/post-likes`, {
                post_id: postId,
                user_id: user_id,
                like_type: likeType
            });
            
            // Update local state
            setUserLikes(prev => ({
                ...prev,
                [postId]: likeType
            }));
            
            // Update the post like/dislike count in the currentTopic posts array
            if (currentTopic) {
                const updatedPosts = currentTopic.posts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            likes: likeType === 'like' ? (post.likes || 0) + 1 : post.likes,
                            dislikes: likeType === 'dislike' ? (post.dislikes || 0) + 1 : post.dislikes,
                            userLiked: likeType === 'like',
                            userDisliked: likeType === 'dislike'
                        };
                    }
                    return post;
                });
                
                setCurrentTopic({
                    ...currentTopic,
                    posts: updatedPosts
                });
            }
            
            setSnackbarMessage(`Post ${likeType === 'like' ? 'liked' : 'disliked'} successfully`);
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
        } catch (error) {
            console.error(`Error ${likeType}ing post:`, error);
            setSnackbarMessage(`Failed to ${likeType} post. Please try again.`);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleSubmitStory = async () => {
        if (!newStoryTitle.trim() || !newStoryContent.trim()) {
            setSnackbarMessage('Title and content are required');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            await axios.post(`${API_URL}/success-stories`, {
                user_id: user_id,
                title: newStoryTitle,
                content: newStoryContent,
                is_anonymous: isAnonymous
            });
            
            setOpenNewStoryDialog(false);
            setNewStoryTitle('');
            setNewStoryContent('');
            setIsAnonymous(false);
            setSnackbarMessage('Success story submitted for approval');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            
            // Refresh success stories
            const storiesResponse = await axios.get(`${API_URL}/success-stories`);
            setSuccessStories(storiesResponse.data);
        } catch (error) {
            console.error('Error submitting story:', error);
            setSnackbarMessage('Failed to submit story. Please try again.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-green-800">
                            <span className="border-b-4 border-green-500 pb-1">Community Hub</span>
                        </h1>
                        <div className="hidden md:flex space-x-2">
                            <div className="flex items-center text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                                <span className="font-medium">{topics.length} Topics</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                </svg>
                                <span className="font-medium">{successStories.length} Success Stories</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => {
                                setActiveTab('forums');
                                setCurrentTopic(null);
                            }}
                            className={`py-3 px-6 font-medium text-sm mr-4 transition-colors duration-200 ${activeTab === 'forums' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                </svg>
                                Discussion Forums
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('success-stories');
                                setCurrentTopic(null);
                            }}
                            className={`py-3 px-6 font-medium text-sm transition-colors duration-200 ${activeTab === 'success-stories' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Success Stories
                            </div>
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                            <p className="text-green-600 mt-4 font-medium">Loading community content...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'forums' && (
                                <div>
                                    {/* Top section with topics and new topic button */}
                                    <div className="mb-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
                                            <div>
                                                <h2 className="text-xl font-semibold text-green-800 mb-2">Community Discussion Forums</h2>
                                                <p className="text-gray-600">Connect with others, share insights, and learn from community experiences</p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search topics..."
                                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full sm:w-64"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <Button 
                                                    variant="contained" 
                                                    color="primary"
                                                    onClick={() => setOpenNewTopicDialog(true)}
                                                    className="bg-green-600 hover:bg-green-700 shadow-md"
                                                    style={{ textTransform: 'none', padding: '8px 16px' }}
                                                >
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                        </svg>
                                                        New Topic
                                                    </div>
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        {topicsToShow.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <h3 className="text-xl font-bold mb-2 text-gray-800">{searchTerm ? 'No matching topics found' : 'No topics yet'}</h3>
                                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                                    {searchTerm ? 'Try adjusting your search terms or browse all available topics.' : 'Be the first to start a discussion in our community! Share your thoughts, questions, or insights.'}
                                                </p>
                                                {searchTerm ? (
                                                    <button 
                                                        onClick={() => setSearchTerm('')}
                                                        className="bg-white text-green-600 border border-green-300 hover:bg-green-50 font-medium py-2 px-4 rounded-lg transition-colors mr-3"
                                                    >
                                                        Clear Search
                                                    </button>
                                                ) : (
                                                    <Button 
                                                        variant="contained" 
                                                        color="primary"
                                                        onClick={() => setOpenNewTopicDialog(true)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        Create New Topic
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                                Topic
                                                            </th>
                                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                                Creator
                                                            </th>
                                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                                Posts
                                                            </th>
                                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                                Last Activity
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {topicsToShow.map(topic => (
                                                            <tr 
                                                                key={topic.id} 
                                                                className="hover:bg-green-50 cursor-pointer transition-colors"
                                                                onClick={() => {
                                                                    setCurrentTopic(null); // Clear first to avoid showing old topic data
                                                                    axios.get(`${API_URL}/forum/topics/${topic.id}`)
                                                                        .then(response => {
                                                                            // Process posts with user likes data
                                                                            if (response.data && response.data.posts) {
                                                                                response.data.posts = response.data.posts.map(post => ({
                                                                                    ...post,
                                                                                    userLiked: userLikes[post.id] === 'like',
                                                                                    userDisliked: userLikes[post.id] === 'dislike'
                                                                                }));
                                                                            }
                                                                            setCurrentTopic(response.data);
                                                                        })
                                                                        .catch(error => {
                                                                            console.error('Error fetching topic:', error);
                                                                            setSnackbarMessage('Failed to load topic. Please try again.');
                                                                            setSnackbarSeverity('error');
                                                                            setOpenSnackbar(true);
                                                                        });
                                                                }}
                                                            >
                                                                <td className="px-6 py-4">
                                                                    <div className="text-green-600 font-medium text-base">{topic.title}</div>
                                                                    {topic.description && <div className="text-gray-500 mt-1 text-sm line-clamp-1">{topic.description}</div>}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center">
                                                                        <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-medium mr-2">
                                                                            {topic.creator_name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <div className="text-gray-700">{topic.creator_name}</div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center text-gray-700">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                                                        </svg>
                                                                        {topic.post_count}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-gray-700 flex items-center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                        </svg>
                                                                        {topic.last_post_date ? moment(topic.last_post_date).fromNow() : 'No posts yet'}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Selected Topic with Posts */}
                                    {currentTopic && (
                                        <div className="mt-10 border-t pt-8">
                                            <div className="bg-gradient-to-r from-green-50 to-indigo-50 p-6 rounded-xl mb-6 shadow-sm border border-green-100">
                                                <h2 className="text-2xl font-bold text-green-800 mb-2">{currentTopic.title}</h2>
                                                {currentTopic.description && <p className="text-green-700 mb-4">{currentTopic.description}</p>}
                                                <div className="flex items-center text-gray-600">
                                                    <div className="flex items-center">
                                                        <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-medium mr-2">{currentTopic.creator_name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="mr-2">Started by <span className="font-medium">{currentTopic.creator_name}</span></span>
                                                    </div>
                                                    <span className="mx-2">•</span>
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>{moment(currentTopic.created_at).format('MMM D, YYYY')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-6 flex justify-between items-center">
                                                <Button 
                                                    variant="contained" 
                                                    color="primary"
                                                    onClick={() => setOpenNewPostDialog(true)}
                                                    className="bg-green-600 hover:bg-green-700 shadow-md"
                                                    style={{ textTransform: 'none', padding: '10px 20px' }}
                                                >
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                                        </svg>
                                                        Reply to Topic
                                                    </div>
                                                </Button>
                                                
                                                <div className="text-gray-600 flex items-center">
                                                    <span className="mr-3">{currentTopic.posts?.length || 0} Replies</span>
                                                    <button 
                                                        onClick={() => {
                                                            setCurrentTopic(null); 
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="text-green-600 hover:text-green-800 flex items-center transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                                        </svg>
                                                        Back to Topics
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {currentTopic.posts && currentTopic.posts.length > 0 ? (
                                                <div className="space-y-6">
                                                    {currentTopic.posts.map((post, index) => (
                                                        <div key={post.id} className={`rounded-xl overflow-hidden shadow-sm ${index === 0 ? 'border-2 border-green-300 bg-green-50' : 'border border-gray-200 bg-white'}`}>
                                                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                                                <div className="flex items-center">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium mr-3 ${index === 0 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                                        {post.user_name?.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-medium text-gray-800">{post.user_name}</span>
                                                                        {index === 0 && (
                                                                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                                                Topic Starter
                                                                            </span>
                                                                        )}
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
                                                                <div className="flex items-center space-x-6 border-t pt-4 mt-4">
                                                                    <button 
                                                                        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${post.userLiked 
                                                                            ? 'bg-green-100 text-green-700' 
                                                                            : 'text-gray-600 hover:bg-gray-100'}`}
                                                                        onClick={() => handleLikePost(post.id, 'like')}
                                                                        disabled={post.userLiked || post.userDisliked}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                                        </svg>
                                                                        <span className="font-medium">{post.likes || 0}</span>
                                                                    </button>
                                                                    <button 
                                                                        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${post.userDisliked 
                                                                            ? 'bg-red-100 text-red-700' 
                                                                            : 'text-gray-600 hover:bg-gray-100'}`}
                                                                        onClick={() => handleLikePost(post.id, 'dislike')}
                                                                        disabled={post.userLiked || post.userDisliked}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                                                                        </svg>
                                                                        <span className="font-medium">{post.dislikes || 0}</span>
                                                                    </button>
                                                                    <div className="ml-auto">
                                                                        {post.userLiked && 
                                                                            <span className="text-green-600 text-sm italic">You liked this post</span>
                                                                        }
                                                                        {post.userDisliked && 
                                                                            <span className="text-red-600 text-sm italic">You disliked this post</span>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                    </svg>
                                                    <h3 className="font-medium text-gray-700 mb-2 text-xl">No replies yet & Replies Hidden</h3>
                                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Be the first to reply to this topic and start the conversation!</p>
                                                    <Button 
                                                        variant="contained" 
                                                        color="primary"
                                                        onClick={() => setOpenNewPostDialog(true)}
                                                        className="bg-green-600 hover:bg-green-700 shadow-md"
                                                    >
                                                        Post Reply
                                                    </Button>
                                                </div>
                                            )}
                                            
                                            {/* Reply button at bottom */}
                                            {currentTopic.posts && currentTopic.posts.length > 0 && (
                                                <div className="mt-6 flex justify-center">
                                                    <Button 
                                                        variant="contained" 
                                                        color="primary"
                                                        onClick={() => setOpenNewPostDialog(true)}
                                                        className="bg-green-600 hover:bg-green-700 shadow-md"
                                                        style={{ textTransform: 'none', padding: '10px 24px' }}
                                                    >
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            Reply to This Topic
                                                        </div>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {activeTab === 'success-stories' && (
                                <div>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8">
                                        <div>
                                            <h2 className="text-xl font-semibold text-green-800 mb-2">Success Stories</h2>
                                            <p className="text-gray-600">Read inspiring stories from community members who have achieved their goals</p>
                                        </div>
                                        <Button 
                                            variant="contained" 
                                            color="primary"
                                            onClick={() => setOpenNewStoryDialog(true)}
                                            className="bg-green-600 hover:bg-green-700 shadow-md"
                                            style={{ textTransform: 'none', padding: '8px 16px' }}
                                        >
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                                </svg>
                                                Share Your Story
                                            </div>
                                        </Button>
                                    </div>
                                    
                                    {successStories.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                            <h3 className="text-xl font-bold mb-2 text-gray-800">No success stories yet</h3>
                                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                                Be the first to share your success story and inspire others in our community!
                                            </p>
                                            <Button 
                                                variant="contained" 
                                                color="primary"
                                                onClick={() => setOpenNewStoryDialog(true)}
                                                className="bg-green-600 hover:bg-green-700 shadow-md"
                                            >
                                                Share Your Story
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {successStories.map(story => (
                                                <div key={story.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                                    <div className="p-6">
                                                        <div className="flex items-center mb-4">
                                                            <div className="bg-green-100 text-green-800 rounded-full w-10 h-10 flex items-center justify-center font-medium mr-3">
                                                                {story.author_name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-green-800">{story.title}</h3>
                                                                <div className="flex items-center text-gray-600 text-sm mt-1">
                                                                    <span>{story.author_name}</span>
                                                                    <span className="mx-2">•</span>
                                                                    <span>{moment(story.created_at).format('MMM D, YYYY')}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="prose max-w-none mb-5 text-gray-700">
                                                            {story.content.length > 300 
                                                                ? `${story.content.substring(0, 300)}...` 
                                                                : story.content
                                                            }
                                                        </div>
                                                        <div className="flex items-center justify-between border-t pt-4">
                                                            <div className="flex items-center text-green-600">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                                <span className="font-medium">Success Story</span>
                                                            </div>
                                                            {story.content.length > 300 && (
                                                                <button className="text-green-600 hover:text-green-800 font-medium text-sm">
                                                                    Read More
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            {/* New Topic Dialog */}
            <Dialog 
                open={openNewTopicDialog} 
                onClose={() => setOpenNewTopicDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '0.75rem' }
                }}
            >
                <DialogTitle>
                    <div className="flex items-center text-green-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Create New Topic
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className="bg-green-50 p-4 rounded-lg mb-4 text-green-700 text-sm">
                        <p>Start a conversation by creating a new topic. Clear and descriptive titles help others find and join your discussion.</p>
                    </div>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Topic Title"
                        type="text"
                        fullWidth
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        required
                        variant="outlined"
                        className="mb-4"
                        InputProps={{
                            style: { borderRadius: '0.5rem' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Description (Optional)"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={newTopicDescription}
                        onChange={(e) => setNewTopicDescription(e.target.value)}
                        variant="outlined"
                        placeholder="Add a brief description to give context about your topic"
                        InputProps={{
                            style: { borderRadius: '0.5rem' }
                        }}
                    />
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setOpenNewTopicDialog(false)} 
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            padding: '8px 16px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateTopic} 
                        variant="contained" 
                        color="primary"
                        className="bg-green-600 hover:bg-green-700"
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            padding: '8px 16px'
                        }}
                    >
                        Create Topic
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* New Post Dialog */}
            <Dialog 
                open={openNewPostDialog} 
                onClose={() => setOpenNewPostDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '0.75rem' }
                }}
            >
                <DialogTitle>
                    <div className="flex items-center text-green-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Reply to: {currentTopic?.title}
                    </div>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your Reply"
                        type="text"
                        fullWidth
                        multiline
                        rows={8}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        required
                        variant="outlined"
                        placeholder="Share your thoughts, experiences, or questions..."
                        InputProps={{
                            style: { borderRadius: '0.5rem' }
                        }}
                    />
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setOpenNewPostDialog(false)}
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            padding: '8px 16px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreatePost}
                        variant="contained" 
                        color="primary"
                        className="bg-green-600 hover:bg-green-700"
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            padding: '8px 16px'
                        }}
                    >
                        Post Reply
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* New Success Story Dialog */}
            <Dialog 
                open={openNewStoryDialog} 
                onClose={() => setOpenNewStoryDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '0.75rem' }
                }}
            >
                <DialogTitle>
                    <div className="flex items-center text-green-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Share Your Success Story
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-green-700 text-sm">
                                Your story will be reviewed by our team before being published. Share your experience to inspire others in the community!
                            </p>
                        </div></div>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Story Title"
                        type="text"
                        fullWidth
                        value={newStoryTitle}
                        onChange={(e) => setNewStoryTitle(e.target.value)}
                        required
                        variant="outlined"
                        className="mb-4"
                        placeholder="Give your success story a compelling title"
                        InputProps={{
                            style: { borderRadius: '0.5rem' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Your Success Story"
                        type="text"
                        fullWidth
                        multiline
                        rows={8}
                        value={newStoryContent}
                        onChange={(e) => setNewStoryContent(e.target.value)}
                        required
                        variant="outlined"
                        className="mb-4"
                        placeholder="Share your journey, challenges, and how you overcame them"
                        InputProps={{
                            style: { borderRadius: '0.5rem' }
                        }}
                    />
                    <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                        <input
                            type="checkbox"
                            id="anonymous"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                        />
                        <label htmlFor="anonymous" className="ml-2 text-gray-700">
                            Post anonymously
                        </label>
                    </div>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setOpenNewStoryDialog(false)}
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            padding: '8px 16px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmitStory}
                        variant="contained" 
                        color="primary"
                        className="bg-green-600 hover:bg-green-700"
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            padding: '8px 16px'
                        }}
                    >
                        Submit Story
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

export default CommunityPost;
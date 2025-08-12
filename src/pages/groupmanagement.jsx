import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
    Avatar,
    Snackbar,
    Alert,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    Box
} from '@mui/material';
import moment from 'moment';

// 1. GROUP REQUESTS MANAGEMENT COMPONENT
export const GroupRequestsManager = ({ 
    open, 
    onClose, 
    groupId, 
    groupName, 
    onRequestHandled 
}) => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const user_id = user?.id;

    useEffect(() => {
        if (open && groupId) {
            fetchRequests();
        }
    }, [open, groupId]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/groups/${groupId}/requests?creatorId=${user_id}`);
            setPendingRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
            showSnackbar('Failed to load requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (userId, action) => {
        try {
            await axios.post(`${API_URL}/groups/handle-request`, {
                groupId,
                userId,
                action,
                adminId: user_id
            });
            
            showSnackbar(`Request ${action}d successfully`, 'success');
            fetchRequests();
            onRequestHandled?.();
        } catch (error) {
            console.error('Error handling request:', error);
            showSnackbar(error.response?.data?.error || `Failed to ${action} request`, 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{ style: { borderRadius: '0.75rem' } }}
            >
                <DialogTitle>
                    <div className="flex items-center text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Join Requests for "{groupName}" ({pendingRequests.length})
                    </div>
                </DialogTitle>
                <DialogContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : pendingRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500 text-lg">No pending requests</p>
                            <p className="text-gray-400 text-sm mt-2">When users request to join your private group, they'll appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingRequests.map(request => (
                                <div key={request.user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex items-center">
                                        <Avatar 
                                            className="mr-4"
                                            style={{ backgroundColor: '#3b82f6', width: 48, height: 48 }}
                                        >
                                            {request.user_name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-gray-800">{request.user_name}</div>
                                            <div className="text-sm text-gray-500">{request.user_email}</div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Requested {moment(request.requested_at).fromNow()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <Button
                                            onClick={() => handleRequest(request.user_id, 'approve')}
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            startIcon={
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            }
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => handleRequest(request.user_id, 'reject')}
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            startIcon={
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            }
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

// 2. GROUP MEMBERS MANAGEMENT COMPONENT
export const GroupMembersManager = ({ 
    open, 
    onClose, 
    groupId, 
    groupName, 
    isOwner = false 
}) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (open && groupId) {
            fetchMembers();
        }
    }, [open, groupId]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/groups/${groupId}/members`);
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
            showSnackbar('Failed to load members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const removeMember = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        
        try {
            await axios.post(`${API_URL}/groups/remove-member`, {
                groupId,
                userId,
                adminId: JSON.parse(localStorage.getItem('user'))?.id
            });
            
            showSnackbar('Member removed successfully', 'success');
            fetchMembers();
        } catch (error) {
            console.error('Error removing member:', error);
            showSnackbar('Failed to remove member', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{ style: { borderRadius: '0.75rem' } }}
            >
                <DialogTitle>
                    <div className="flex items-center text-green-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Members of "{groupName}" ({members.length})
                    </div>
                </DialogTitle>
                <DialogContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {members.map(member => (
                                <div key={member.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <Avatar 
                                            className="mr-3"
                                            style={{ backgroundColor: '#059669', width: 40, height: 40 }}
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
                                    <div className="flex items-center space-x-2">
                                        {member.role === 'admin' && (
                                            <Chip 
                                                label="Admin" 
                                                size="small"
                                                style={{ backgroundColor: '#fbbf24', color: '#92400e' }}
                                            />
                                        )}
                                        {member.role === 'moderator' && (
                                            <Chip 
                                                label="Moderator" 
                                                size="small"
                                                style={{ backgroundColor: '#a78bfa', color: '#5b21b6' }}
                                            />
                                        )}
                                        {isOwner && member.role !== 'admin' && (
                                            <Button
                                                onClick={() => removeMember(member.user_id)}
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

// 3. JOIN GROUP REQUEST COMPONENT
export const JoinGroupButton = ({ 
    group, 
    userMembershipStatus, 
    onJoinRequest,
    onLeaveGroup,
    onViewRequests,
    onViewMembers 
}) => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const user_id = user?.id;
    const isCreator = group.created_by === user_id;

    const handleJoinClick = () => {
        onJoinRequest?.(group.id);
    };

    const handleLeaveClick = () => {
        onLeaveGroup?.(group.id);
    };

    const handleViewRequestsClick = () => {
        onViewRequests?.(group.id, group.name);
    };

    const handleViewMembersClick = () => {
        onViewMembers?.(group.id, group.name);
    };

    if (userMembershipStatus === 'active') {
        return (
            <div className="flex space-x-2">
                <button
                    onClick={handleViewMembersClick}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                    Members
                </button>
                {!isCreator && (
                    <button
                        onClick={handleLeaveClick}
                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                        Leave
                    </button>
                )}
            </div>
        );
    } else if (userMembershipStatus === 'pending') {
        return (
            <button
                disabled
                className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-medium cursor-not-allowed"
            >
                Request Pending
            </button>
        );
    } else if (isCreator) {
        return (
            <div className="flex space-x-2">
                <button
                    onClick={handleViewRequestsClick}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                    View Requests
                </button>
                <button
                    onClick={handleViewMembersClick}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                    Members
                </button>
            </div>
        );
    } else {
        const buttonText = group.privacy === 'private' ? 'Request to Join' : 'Join';
        const buttonColor = group.privacy === 'private' 
            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
            : 'bg-green-100 text-green-700 hover:bg-green-200';
            
        return (
            <button
                onClick={handleJoinClick}
                className={`${buttonColor} px-3 py-1 rounded-lg text-sm font-medium transition-colors`}
            >
                {buttonText}
            </button>
        );
    }
};

// 4. MAIN GROUP MANAGEMENT HOOK
export const useGroupManagement = () => {
    const [requestsDialog, setRequestsDialog] = useState({ open: false, groupId: null, groupName: '' });
    const [membersDialog, setMembersDialog] = useState({ open: false, groupId: null, groupName: '', isOwner: false });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const user_id = user?.id;

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleJoinGroup = async (groupId) => {
        try {
            const response = await axios.post(`${API_URL}/groups/join`, {
                groupId: groupId,
                userId: user_id
            });
            
            showSnackbar(response.data.message, 'success');
            return true;
        } catch (error) {
            console.error('Error joining group:', error);
            showSnackbar(error.response?.data?.error || 'Failed to join group', 'error');
            return false;
        }
    };

    const handleLeaveGroup = async (groupId) => {
        if (!window.confirm('Are you sure you want to leave this group?')) return false;
        
        try {
            await axios.post(`${API_URL}/groups/leave`, {
                groupId: groupId,
                userId: user_id
            });
            
            showSnackbar('Successfully left group');
            return true;
        } catch (error) {
            console.error('Error leaving group:', error);
            showSnackbar(error.response?.data?.error || 'Failed to leave group', 'error');
            return false;
        }
    };

    const openRequestsDialog = (groupId, groupName) => {
        setRequestsDialog({ open: true, groupId, groupName });
    };

    const openMembersDialog = (groupId, groupName, isOwner = false) => {
        setMembersDialog({ open: true, groupId, groupName, isOwner });
    };

    const closeDialogs = () => {
        setRequestsDialog({ open: false, groupId: null, groupName: '' });
        setMembersDialog({ open: false, groupId: null, groupName: '', isOwner: false });
    };

    return {
        // State
        requestsDialog,
        membersDialog,
        snackbar,
        
        // Actions
        handleJoinGroup,
        handleLeaveGroup,
        openRequestsDialog,
        openMembersDialog,
        closeDialogs,
        showSnackbar,
        
        // Components
        RequestsManager: () => (
            <GroupRequestsManager
                open={requestsDialog.open}
                onClose={closeDialogs}
                groupId={requestsDialog.groupId}
                groupName={requestsDialog.groupName}
                onRequestHandled={() => {
                    // Callback when request is handled
                }}
            />
        ),
        
        MembersManager: () => (
            <GroupMembersManager
                open={membersDialog.open}
                onClose={closeDialogs}
                groupId={membersDialog.groupId}
                groupName={membersDialog.groupName}
                isOwner={membersDialog.isOwner}
            />
        ),
        
        SnackbarComponent: () => (
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        )
    };
};
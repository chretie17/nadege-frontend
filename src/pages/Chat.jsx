import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageCircle, 
    Bell, 
    Send, 
    Users, 
    Circle, 
    CheckCircle, 
    AlertCircle,
    Clock,
    Wifi,
    WifiOff,
    X,
    TestTube
} from 'lucide-react';
import { io } from 'socket.io-client';

const CommunicationHub = () => {
    const [activeTab, setActiveTab] = useState('chat');
    const [messages, setMessages] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const [unreadCount, setUnreadCount] = useState({ unread_messages: 0, unread_notifications: 0 });
    const [popupNotifications, setPopupNotifications] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const socketRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
const [isUploading, setIsUploading] = useState(false);
const fileInputRef = useRef(null);
const [previewImage, setPreviewImage] = useState(null);
const [showImagePreview, setShowImagePreview] = useState(false);
    const chatContainerRef = useRef(null);

    // Get current user from localStorage with proper validation
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser?.id;

    console.log("Current User:", currentUser);
    console.log("Current User ID:", currentUserId);

    // API base URL
    const API_BASE = 'http://localhost:5000/api';

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };
    const isImageFile = (fileType) => {
    return fileType && fileType.startsWith('image/');
};
// ADD function to handle image preview:
const openImagePreview = (attachmentUrl, attachmentName) => {
    const fullUrl = `${API_BASE}/communication/attachment/${attachmentUrl.split('/').pop()}`;
    setPreviewImage({ url: fullUrl, name: attachmentName });
    setShowImagePreview(true);
};

// ADD function to close preview:
const closeImagePreview = () => {
    setShowImagePreview(false);
    setPreviewImage(null);
};

    // Initialize Socket.io
    useEffect(() => {
        if (!currentUserId) {
            console.error('No user ID found in localStorage');
            return;
        }

        console.log('Initializing socket connection for user:', currentUserId);
        
        const newSocket = io('http://localhost:5000', {
            transports: ['websocket'],
            forceNew: true,
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setIsSocketConnected(true);
            newSocket.emit('join', currentUserId);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsSocketConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsSocketConnected(false);
        });

        newSocket.on('joined', (data) => {
            console.log('Successfully joined:', data);
        });

        newSocket.on('new_message', (message) => {
            console.log('Received new message:', message);
            
            showPopupNotification({
                id: Date.now(),
                title: `New message from ${message.sender_name}`,
                message: message.message,
                type: 'info'
            });

            if (selectedUser && message.sender_id === selectedUser.id) {
                setConversation(prev => [...prev, message]);
                setTimeout(scrollToBottom, 100);
            }

            fetchUnreadCount();
        });

        newSocket.on('new_notification', (notification) => {
            console.log('Received new notification:', notification);
            
            showPopupNotification(notification);
            fetchNotifications();
            fetchUnreadCount();
        });

        return () => {
            console.log('Cleaning up socket connection');
            newSocket.disconnect();
        };
    }, [currentUserId, selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);
    useEffect(() => {
    const handleKeyPress = (e) => {
        if (e.key === 'Escape' && showImagePreview) {
            closeImagePreview();
        }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
}, [showImagePreview]);

    const showPopupNotification = (notification) => {
        setPopupNotifications(prev => [...prev, notification]);
        setTimeout(() => {
            setPopupNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
    };

    const removePopupNotification = (id) => {
        setPopupNotifications(prev => prev.filter(n => n.id !== id));
    };
    const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }
        setSelectedFile(file);
    }
    };
    const fetchMessages = async () => {
        try {
            const response = await fetch(`${API_BASE}/communication/messages/${currentUserId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${API_BASE}/communication/notifications/${currentUserId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE}/communication/chat-users`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setUsers(data.filter(user => user.id !== parseInt(currentUserId)));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(`${API_BASE}/communication/unread-count/${currentUserId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setUnreadCount(data);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchConversation = async (userId) => {
    try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE}/communication/conversation/${currentUserId}/${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        // Validate attachment URLs
        const validatedData = data.map(msg => ({
            ...msg,
            attachment_url: msg.attachment_url ? msg.attachment_url : null
        }));
        
        setConversation(validatedData);
        markConversationAsRead(userId);
    } catch (error) {
        console.error('Error fetching conversation:', error);
    } finally {
        setIsLoading(false);
    }
};

   const markMessageAsRead = async (messageId) => {
    try {
        const response = await fetch(`${API_BASE}/communication/mark-message-read/${messageId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: parseInt(currentUserId) }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        // Update conversation state
        setConversation(prev => 
            prev.map(msg => 
                msg.id === messageId ? { ...msg, is_read: true } : msg
            )
        );
        
        // ADD THIS: Update messages state as well
        setMessages(prev => 
            prev.map(msg => 
                msg.id === messageId ? { ...msg, is_read: true } : msg
            )
        );
        
        fetchUnreadCount();
        console.log(`Message ${messageId} marked as read`);
    } catch (error) {
        console.error('Error marking message as read:', error);
    }
};
   const markConversationAsRead = async (otherUserId) => {
    try {
        const response = await fetch(`${API_BASE}/communication/mark-conversation-read/${currentUserId}/${otherUserId}`, {
            method: 'PUT',
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        // Update conversation state
        setConversation(prev => 
            prev.map(msg => 
                msg.receiver_id === parseInt(currentUserId) ? { ...msg, is_read: true } : msg
            )
        );
        
        // ADD THIS: Update messages state as well
        setMessages(prev => 
            prev.map(msg => 
                msg.receiver_id === parseInt(currentUserId) && msg.sender_id === parseInt(otherUserId) 
                    ? { ...msg, is_read: true } : msg
            )
        );
        
        fetchUnreadCount();
        console.log(`Conversation with user ${otherUserId} marked as read`);
    } catch (error) {
        console.error('Error marking conversation as read:', error);
    }
};
    // MODIFY your sendMessage function to handle attachments:
const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedUser) {
        console.log('Message empty and no file selected, or no user selected');
        return;
    }
    
    if (!isSocketConnected) {
        alert('Connection lost. Please refresh the page.');
        return;
    }

    setIsUploading(true);

    try {
        const formData = new FormData();
        formData.append('sender_id', currentUserId);
        formData.append('receiver_id', selectedUser.id);
        formData.append('message', newMessage || '');
        formData.append('message_type', 'direct');
        
        if (selectedFile) {
            formData.append('attachment', selectedFile);
        }

        const response = await fetch(`${API_BASE}/communication/send-message`, {
            method: 'POST',
            body: formData, // Don't set Content-Type header, let browser set it
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Message sent successfully:', result);
        
        // Clear inputs
        setNewMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        
        // Add message to conversation
        const newMsg = {
            id: result.messageId,
            sender_id: parseInt(currentUserId),
            sender_name: currentUser.name,
            message: newMessage,
            message_type: 'direct',
            attachment_url: result.attachment?.url,
            attachment_name: result.attachment?.name,
            attachment_type: result.attachment?.type,
            attachment_size: result.attachment?.size,
            is_read: false,
            created_at: new Date().toISOString()
        };
        setConversation(prev => [...prev, newMsg]);
        
    } catch (error) {
        console.error('Error sending message:', error);
        alert(`Failed to send message: ${error.message}`);
    } finally {
        setIsUploading(false);
    }
};
    const sendTestNotification = async () => {
        if (!selectedUser) return;

        try {
            const response = await fetch(`${API_BASE}/communication/send-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: parseInt(selectedUser.id),
                    title: 'Test Notification',
                    message: `Hello ${selectedUser.name}! This is a test notification from ${currentUser.name}.`,
                    type: 'info'
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            console.log('Test notification sent successfully');
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('Failed to send notification. Please try again.');
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            const response = await fetch(`${API_BASE}/communication/mark-notification-read/${notificationId}`, {
                method: 'PUT',
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId ? { ...notif, is_read: true } : notif
                )
            );
            
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Check if user has unread messages
    const hasUnreadMessages = (userId) => {
        return messages.some(msg => 
            msg.sender_id === userId && 
            msg.receiver_id === parseInt(currentUserId) && 
            !msg.is_read
        );
    };
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ADD this function to get file icon:
const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return '🖼️';
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word')) return '📝';
    if (fileType?.includes('zip') || fileType?.includes('rar')) return '📦';
    return '📁';
};
    useEffect(() => {
        if (currentUserId) {
            fetchMessages();
            fetchNotifications();
            fetchUsers();
            fetchUnreadCount();
        }
    }, [currentUserId]);

    useEffect(() => {
        if (selectedUser) {
            fetchConversation(selectedUser.id);
        }
    }, [selectedUser]);

    if (!currentUserId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center ">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h1>
                        <p className="text-gray-600">Please log in to access the communication hub.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Connection Status */}
                <div className={`mb-6 p-4 rounded-xl shadow-sm border-l-4 transition-all duration-300 ${
                    isSocketConnected 
                        ? 'bg-green-50 border-green-500 text-green-800' 
                        : 'bg-red-50 border-red-500 text-red-800'
                }`}>
                    <div className="flex items-center justify-center space-x-2">
                        {isSocketConnected ? (
                            <>
                                <Wifi className="w-5 h-5" />
                                <span className="font-medium">Connected - Real-time communication active</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-5 h-5" />
                                <span className="font-medium">Disconnected - Real-time features unavailable</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Popup Notifications */}
                <div className="fixed top-4 right-4 z-50 space-y-3">
                    {popupNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-xl shadow-lg border-l-4 max-w-sm transform transition-all duration-300 animate-slide-in ${
                                notification.type === 'success' ? 'bg-green-50 border-green-500' :
                                notification.type === 'error' ? 'bg-red-50 border-red-500' :
                                notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                                'bg-green-50 border-green-500'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                </div>
                                <button
                                    onClick={() => removePopupNotification(notification.id)}
                                    className="text-gray-400 hover:text-gray-600 ml-3 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Communication MedConnect
                            </h1>
                            <p className="text-gray-600 flex items-center">
                                <Circle className="w-2 h-2 text-green-500 mr-2 fill-current" />
                                Welcome, {currentUser.name} (ID: {currentUserId})
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Status</div>
                            <div className="font-semibold text-green-600">Online</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-2xl shadow-sm p-2 mb-6">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'chat' 
                                    ? 'bg-green-600 text-white shadow-lg transform scale-105' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                            }`}
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span>Chat</span>
                            {unreadCount.unread_messages > 0 && (
                                <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold min-w-[20px] h-5 flex items-center justify-center">
                                    {unreadCount.unread_messages}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'notifications' 
                                    ? 'bg-green-600 text-white shadow-lg transform scale-105' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                            }`}
                        >
                            <Bell className="w-5 h-5" />
                            <span>Notifications</span>
                            {unreadCount.unread_notifications > 0 && (
                                <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold min-w-[20px] h-5 flex items-center justify-center">
                                    {unreadCount.unread_notifications}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Users List */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center space-x-2 mb-6">
                                <Users className="w-5 h-5 text-green-600" />
                                <h3 className="font-bold text-gray-800">Medical Staff</h3>
                            </div>
                            <div className="space-y-3">
                                {users.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                                            selectedUser?.id === user.id 
                                                ? 'bg-green-600 text-white shadow-lg transform scale-105' 
                                                : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="font-semibold flex items-center">
                                                    {user.name}
                                                    {hasUnreadMessages(user.id) && (
                                                        <MessageCircle className="w-4 h-4 text-red-500 ml-2 animate-pulse" />
                                                    )}
                                                </div>
                                                <div className="text-sm opacity-75">{user.role}</div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Circle className="w-2 h-2 text-green-500 fill-current" />
                                                {hasUnreadMessages(user.id) && (
                                                    <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                                        !
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
<input
    type="file"
    ref={fileInputRef}
    onChange={handleFileSelect}
    style={{ display: 'none' }}
    accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
/>
                        {/* Chat Area */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
                            {selectedUser ? (
                                <>
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <span className="text-green-600 font-bold">
                                                    {selectedUser.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">
                                                    {selectedUser.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">{selectedUser.role}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={sendTestNotification}
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            <TestTube className="w-4 h-4" />
                                            <span>Test Notification</span>
                                        </button>
                                    </div>
                                    
                                    {/* Messages */}
                                    <div 
                                        ref={chatContainerRef}
                                        className="h-96 overflow-y-auto mb-6 bg-gray-50 rounded-xl p-4 space-y-4"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                <span className="ml-2 text-gray-500">Loading conversation...</span>
                                            </div>
                                        ) : conversation.length === 0 ? (
                                            <div className="text-center text-gray-500 h-full flex items-center justify-center">
                                                <div>
                                                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                    <p>No messages yet. Start a conversation!</p>
                                                </div>
                                            </div>
                                        ) : (
                                            conversation.map(msg => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${
                                                        msg.sender_id === parseInt(currentUserId) ? 'justify-end' : 'justify-start'
                                                    }`}
                                                >
                                                    <div
                                                        onClick={() => {
                                                            if (msg.receiver_id === parseInt(currentUserId) && !msg.is_read) {
                                                                markMessageAsRead(msg.id);
                                                            }
                                                        }}
                                                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                                                            msg.sender_id === parseInt(currentUserId)
                                                                ? 'bg-green-600 text-white'
                                                                : msg.is_read 
                                                                    ? 'bg-white border border-gray-200 text-gray-800'
                                                                    : 'bg-yellow-50 border border-yellow-200 text-gray-800 shadow-md'
                                                        } ${
                                                            msg.receiver_id === parseInt(currentUserId) && !msg.is_read 
                                                                ? 'hover:shadow-lg transform hover:scale-105' 
                                                                : ''
                                                        }`}
                                                        title={
                                                            msg.receiver_id === parseInt(currentUserId) && !msg.is_read 
                                                                ? 'Click to mark as read' 
                                                                : ''
                                                        }
                                                    >
                                                       <div className="text-sm">
    {msg.message && <div className="mb-2">{msg.message}</div>}
    
    {msg.attachment_url && (
    <div className="mt-2 p-2 bg-white bg-opacity-20 rounded-lg">
        <div className="flex items-center space-x-2">
            <span className="text-lg">{getFileIcon(msg.attachment_type)}</span>
            <div className="flex-1">
                <div className="text-xs font-medium">{msg.attachment_name}</div>
                <div className="text-xs opacity-75">{formatFileSize(msg.attachment_size)}</div>
            </div>
            <div className="flex space-x-2">
                {/* Preview button for images */}
                {isImageFile(msg.attachment_type) && (
                    <button
                        onClick={() => openImagePreview(msg.attachment_url, msg.attachment_name)}
                        className="text-xs bg-blue-500 bg-opacity-80 text-white px-2 py-1 rounded hover:bg-opacity-100 transition-colors"
                    >
                        👁️ Preview
                    </button>
                )}
                {/* Download button */}
                <a
                    href={`${API_BASE}/communication/download/${msg.attachment_url.split('/').pop()}`}
                    download={msg.attachment_name}
                    className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30 transition-colors"
                >
                    📥 Download
                </a>
            </div>
        </div>
        
        {/* Inline image preview for small images */}
        {isImageFile(msg.attachment_type) && (
            <div className="mt-2">
                <img
                    src={`${API_BASE}/communication/attachment/${msg.attachment_url.split('/').pop()}`}
                    alt={msg.attachment_name}
                    className="max-w-full max-h-40 rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openImagePreview(msg.attachment_url, msg.attachment_name)}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        console.error('Failed to load image:', msg.attachment_url);
                    }}
                />
            </div>
        )}
    </div>
)}
   
</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

<div className="space-y-3">
    {/* File preview */}
  {selectedFile && (
    <div className="bg-gray-50 p-3 rounded-lg border">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <span className="text-lg">{getFileIcon(selectedFile.type)}</span>
                <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
            </div>
            <button
                onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-red-500 hover:text-red-700"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
        
        {/* Show image preview if it's an image file */}
        {isImageFile(selectedFile.type) && (
            <div className="mt-3">
                <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="max-w-full max-h-32 rounded border"
                />
            </div>
        )}
    </div>
)}
  
    {/* Message input row */}
    <div className="flex space-x-3">
        <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
            disabled={!isSocketConnected}
        >
            📎
        </button>
        <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={!isSocketConnected}
        />
        <button
            onClick={sendMessage}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={!isSocketConnected || (!newMessage.trim() && !selectedFile) || isUploading}
        >
            {isUploading ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                </>
            ) : (
                <>
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                </>
            )}
        </button>
    </div>
</div>
                                </>
                            ) : (
                                <div className="text-center text-gray-500 h-96 flex items-center justify-center">
                                    <div>
                                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg">Select a staff member to start chatting</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center space-x-2 mb-6">
                            <Bell className="w-5 h-5 text-green-600" />
                            <h3 className="font-bold text-gray-800">Notifications</h3>
                        </div>
                        <div className="space-y-4">
                            {notifications.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">
                                    <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => {
                                            if (!notification.is_read) {
                                                markNotificationAsRead(notification.id);
                                            }
                                        }}
                                        className={`p-4 rounded-xl border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                            notification.is_read 
                                                ? 'bg-gray-50 border-gray-300' 
                                                : 'bg-green-50 border-green-500 hover:bg-green-100 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                                                    {!notification.is_read && (
                                                        <span className="bg-green-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                                                            NEW
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mt-1">{notification.message}</p>
                                                <div className="flex items-center space-x-1 mt-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markNotificationAsRead(notification.id);
                                                    }}
                                                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Mark as read</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                {/* Image Preview Modal */}
{showImagePreview && previewImage && (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="relative max-w-4xl max-h-full p-4">
            {/* Close button */}
            <button
                onClick={closeImagePreview}
                className="absolute top-2 right-2 bg-white bg-opacity-20 text-white rounded-full p-2 hover:bg-opacity-30 transition-colors z-10"
            >
                <X className="w-6 h-6" />
            </button>
            
            {/* Image */}
            <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-w-full max-h-full rounded-lg shadow-lg"
                onError={() => {
                    alert('Failed to load image preview');
                    closeImagePreview();
                }}
            />
            
            {/* Image info */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                {previewImage.name}
            </div>
            
            {/* Download button in preview */}
            <a
                href={`${API_BASE}/communication/download/${previewImage.url.split('/').pop()}`}
                download={previewImage.name}
                className="absolute bottom-2 right-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
            >
                📥 Download
            </a>
        </div>
    </div>
)}

            </div>

            <style jsx>{`
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>

    );
};

export default CommunicationHub;
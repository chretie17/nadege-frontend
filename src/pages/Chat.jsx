import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

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

    // Initialize Socket.io
    useEffect(() => {
        if (!currentUserId) {
            console.error('No user ID found in localStorage');
            return;
        }

        console.log('Initializing socket connection for user:', currentUserId);
        
        // FIX: Changed from localhost:3000 to localhost:5000 to match server port
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

        // Connection event handlers
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

        // Listen for join confirmation
        newSocket.on('joined', (data) => {
            console.log('Successfully joined:', data);
        });

        // Listen for new messages
        newSocket.on('new_message', (message) => {
            console.log('Received new message:', message);
            
            // Show popup notification for new message
            showPopupNotification({
                id: Date.now(),
                title: `New message from ${message.sender_name}`,
                message: message.message,
                type: 'info'
            });

            // Update conversation if it's the current chat
            if (selectedUser && message.sender_id === selectedUser.id) {
                setConversation(prev => [...prev, message]);
                setTimeout(scrollToBottom, 100);
            }

            // Refresh unread count
            fetchUnreadCount();
        });

        // Listen for new notifications
        newSocket.on('new_notification', (notification) => {
            console.log('Received new notification:', notification);
            
            // Show popup notification
            showPopupNotification(notification);

            // Refresh notifications and unread count
            fetchNotifications();
            fetchUnreadCount();
        });

        // Cleanup on unmount
        return () => {
            console.log('Cleaning up socket connection');
            newSocket.disconnect();
        };
    }, [currentUserId, selectedUser]);

    // Auto-scroll when conversation updates
    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    // Show popup notification
    const showPopupNotification = (notification) => {
        setPopupNotifications(prev => [...prev, notification]);
        setTimeout(() => {
            setPopupNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
    };

    // Remove popup notification
    const removePopupNotification = (id) => {
        setPopupNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Fetch functions
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
            // FIX: Use strict equality and proper type conversion
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
            setConversation(data);
            
            // Mark conversation as read when opened
            markConversationAsRead(userId);
        } catch (error) {
            console.error('Error fetching conversation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Mark single message as read
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
            
            // Update local conversation state
            setConversation(prev => 
                prev.map(msg => 
                    msg.id === messageId ? { ...msg, is_read: true } : msg
                )
            );
            
            // Refresh unread count
            fetchUnreadCount();
            
            console.log(`Message ${messageId} marked as read`);
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    // Mark entire conversation as read
    const markConversationAsRead = async (otherUserId) => {
        try {
            const response = await fetch(`${API_BASE}/communication/mark-conversation-read/${currentUserId}/${otherUserId}`, {
                method: 'PUT',
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // Update local conversation state
            setConversation(prev => 
                prev.map(msg => 
                    msg.receiver_id === parseInt(currentUserId) ? { ...msg, is_read: true } : msg
                )
            );
            
            // Refresh unread count
            fetchUnreadCount();
            
            console.log(`Conversation with user ${otherUserId} marked as read`);
        } catch (error) {
            console.error('Error marking conversation as read:', error);
        }
    };

    // Send message - IMPROVED ERROR HANDLING
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedUser) {
            console.log('Message empty or no user selected');
            return;
        }
        
        if (!isSocketConnected) {
            alert('Connection lost. Please refresh the page.');
            return;
        }

        if (!currentUserId) {
            alert('User not authenticated. Please log in again.');
            return;
        }

        console.log('Sending message:', {
            sender_id: parseInt(currentUserId),
            receiver_id: parseInt(selectedUser.id),
            message: newMessage,
            message_type: 'direct'
        });

        try {
            const response = await fetch(`${API_BASE}/communication/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender_id: parseInt(currentUserId),
                    receiver_id: parseInt(selectedUser.id),
                    message: newMessage,
                    message_type: 'direct'
                }),
            });

            const responseText = await response.text();
            console.log('Server response:', responseText);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
            }

            const result = JSON.parse(responseText);
            console.log('Message sent successfully:', result);
            
            // Store the message before clearing input
            const messageToSend = newMessage;
            setNewMessage('');
            
            // Add message to conversation immediately
            const newMsg = {
                id: result.messageId,
                sender_id: parseInt(currentUserId),
                sender_name: currentUser.name,
                message: messageToSend,
                message_type: 'direct',
                is_read: false,
                created_at: new Date().toISOString()
            };
            setConversation(prev => [...prev, newMsg]);
            
        } catch (error) {
            console.error('Error sending message:', error);
            alert(`Failed to send message: ${error.message}`);
        }
    };

    // Send test notification
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

    // Mark notification as read
    const markNotificationAsRead = async (notificationId) => {
        try {
            const response = await fetch(`${API_BASE}/communication/mark-notification-read/${notificationId}`, {
                method: 'PUT',
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // Update local notifications state
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

    // Load initial data
    useEffect(() => {
        if (currentUserId) {
            fetchMessages();
            fetchNotifications();
            fetchUsers();
            fetchUnreadCount();
        }
    }, [currentUserId]);

    // Load conversation when user is selected
    useEffect(() => {
        if (selectedUser) {
            fetchConversation(selectedUser.id);
        }
    }, [selectedUser]);

    // Don't render if no user is logged in
    if (!currentUserId) {
        return (
            <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center text-red-500">
                    <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
                    <p>Please log in to access the communication hub.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            {/* Connection Status */}
            <div className={`mb-4 p-2 rounded text-center text-sm ${
                isSocketConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
                {isSocketConnected ? '🟢 Connected' : '🔴 Disconnected - Real-time features unavailable'}
            </div>

            {/* Popup Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {popupNotifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`p-4 rounded-lg shadow-lg border-l-4 max-w-sm animate-slide-in ${
                            notification.type === 'success' ? 'bg-green-50 border-green-500' :
                            notification.type === 'error' ? 'bg-red-50 border-red-500' :
                            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                            'bg-blue-50 border-blue-500'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-800">{notification.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                            <button
                                onClick={() => removePopupNotification(notification.id)}
                                className="text-gray-400 hover:text-gray-600 ml-2"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Communication Hub</h1>
                <p className="text-gray-600">Welcome, {currentUser.name} (ID: {currentUserId})</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        activeTab === 'chat' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Chat {unreadCount.unread_messages > 0 && (
                        <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                            {unreadCount.unread_messages}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        activeTab === 'notifications' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Notifications {unreadCount.unread_notifications > 0 && (
                        <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                            {unreadCount.unread_notifications}
                        </span>
                    )}
                </button>
            </div>

            {/* Rest of the component remains the same... */}
            {/* Chat Tab */}
            {activeTab === 'chat' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Users List */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-bold text-gray-800 mb-4">Users</h3>
                        <div className="space-y-2">
                            {users.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                        selectedUser?.id === user.id 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-white hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm opacity-75">{user.role}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                        {selectedUser ? (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800">
                                        Chat with {selectedUser.name}
                                    </h3>
                                    <button
                                        onClick={sendTestNotification}
                                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                    >
                                        Send Test Notification
                                    </button>
                                </div>
                                
                                {/* Messages */}
                                <div 
                                    ref={chatContainerRef}
                                    className="h-64 overflow-y-auto mb-4 bg-white rounded-lg p-4"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-gray-500">Loading conversation...</div>
                                        </div>
                                    ) : conversation.length === 0 ? (
                                        <div className="text-center text-gray-500">
                                            No messages yet. Start a conversation!
                                        </div>
                                    ) : (
                                        conversation.map(msg => (
                                            <div
                                                key={msg.id}
                                                className={`mb-3 ${
                                                    msg.sender_id === parseInt(currentUserId) ? 'text-right' : 'text-left'
                                                }`}
                                            >
                                                <div
                                                    onClick={() => {
                                                        // Only allow marking as read if current user is receiver and message is unread
                                                        if (msg.receiver_id === parseInt(currentUserId) && !msg.is_read) {
                                                            markMessageAsRead(msg.id);
                                                        }
                                                    }}
                                                    className={`inline-block p-2 rounded-lg max-w-xs cursor-pointer transition-all ${
                                                        msg.sender_id === parseInt(currentUserId)
                                                            ? 'bg-blue-500 text-white'
                                                            : msg.is_read 
                                                                ? 'bg-gray-200 text-gray-800'
                                                                : 'bg-yellow-100 text-gray-800 border-l-4 border-yellow-400'
                                                    } ${
                                                        msg.receiver_id === parseInt(currentUserId) && !msg.is_read 
                                                            ? 'hover:bg-gray-300' 
                                                            : ''
                                                    }`}
                                                    title={
                                                        msg.receiver_id === parseInt(currentUserId) && !msg.is_read 
                                                            ? 'Click to mark as read' 
                                                            : ''
                                                    }
                                                >
                                                    <div className="text-sm">{msg.message}</div>
                                                    <div className="text-xs opacity-75 mt-1 flex items-center justify-between">
                                                        <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                                                        {msg.receiver_id === parseInt(currentUserId) && !msg.is_read && (
                                                            <span className="ml-2 text-xs bg-yellow-500 text-white px-1 rounded">
                                                                NEW
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Type a message..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!isSocketConnected}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                                        disabled={!isSocketConnected || !newMessage.trim()}
                                    >
                                        Send
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-gray-500 mt-20">
                                Select a user to start chatting
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 mb-4">Notifications</h3>
                    {notifications.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No notifications yet
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
                                className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
                                    notification.is_read 
                                        ? 'bg-gray-50 border-gray-300' 
                                        : 'bg-blue-50 border-blue-500 hover:bg-blue-100'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <h4 className="font-medium text-gray-800">{notification.title}</h4>
                                            {!notification.is_read && (
                                                <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
                                                    NEW
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 mt-1">{notification.message}</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markNotificationAsRead(notification.id);
                                            }}
                                            className="text-blue-500 hover:text-blue-700 text-sm"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

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
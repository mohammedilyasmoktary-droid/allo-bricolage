import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: 'TEXT' | 'IMAGE' | 'VOICE';
  fileUrl?: string;
  createdAt: string;
  senderName?: string;
}

interface ChatWindowProps {
  bookingId: string;
  otherUserId: string;
  otherUserName: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ bookingId, otherUserId, otherUserName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // In production, set up WebSocket or polling for real-time updates
    const interval = setInterval(loadMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      // In production, use chat API
      // const data = await chatApi.getMessages(bookingId);
      // setMessages(data);
      
      // Mock for now
      setMessages([]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load messages');
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    setError('');

    try {
      // In production, use chat API
      // await chatApi.sendMessage({
      //   bookingId,
      //   receiverId: otherUserId,
      //   message: newMessage,
      //   messageType: 'TEXT',
      // });

      // Mock message
      const mockMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: user!.id,
        receiverId: otherUserId,
        message: newMessage,
        messageType: 'TEXT',
        createdAt: new Date().toISOString(),
        senderName: user!.name,
      };

      setMessages((prev) => [...prev, mockMessage]);
      setNewMessage('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In production, upload file and send as image message
      const file = e.target.files[0];
      // Handle file upload...
    }
  };

  if (!user) {
    return (
      <Alert severity="error">Vous devez être connecté pour utiliser le chat</Alert>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box
        sx={{
          bgcolor: '#032B5A',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar sx={{ bgcolor: '#F4C542', color: '#032B5A' }}>
          {otherUserName.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {otherUserName}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            En ligne
          </Typography>
        </Box>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: '#f5f5f5',
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Aucun message. Commencez la conversation!
            </Typography>
          </Box>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === user.id;

            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: isOwn ? '#F4C542' : 'white',
                    color: isOwn ? '#032B5A' : 'text.primary',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1">{message.message}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.7,
                      fontSize: '0.7rem',
                    }}
                  >
                    {format(new Date(message.createdAt), 'HH:mm')}
                  </Typography>
                </Paper>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'white',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: 1,
        }}
      >
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload">
          <IconButton component="span" color="primary">
            <AttachFileIcon />
          </IconButton>
        </label>
        <TextField
          fullWidth
          size="small"
          placeholder="Tapez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={loading || !newMessage.trim()}
          sx={{ bgcolor: '#F4C542', color: '#032B5A', '&:hover': { bgcolor: '#e0b038' } }}
        >
          {loading ? <CircularProgress size={20} /> : <SendIcon />}
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ChatWindow;






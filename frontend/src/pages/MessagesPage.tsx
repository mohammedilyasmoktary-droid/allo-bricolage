import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  InputAdornment,
  Paper,
  Badge,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { messagesApi, Conversation, Message } from '../api/messages';
import SendIcon from '@mui/icons-material/Send';
import MessageIcon from '@mui/icons-material/Message';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.bookingId);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages(selectedConversation.bookingId, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await messagesApi.getConversations();
      setConversations(data);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError(err.message || 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (bookingId: string, silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const data = await messagesApi.getMessages(bookingId);
      setMessages(data);
      // Update conversation unread count
      setConversations((prev) =>
        prev.map((conv) =>
          conv.bookingId === bookingId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      if (!silent) {
        setError(err.message || 'Erreur lors du chargement des messages');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const sentMessage = await messagesApi.sendMessage({
        bookingId: selectedConversation.bookingId,
        message: newMessage.trim(),
      });
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage('');
      
      // Update conversation with new last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.bookingId === selectedConversation.bookingId
            ? {
                ...conv,
                lastMessage: {
                  id: sentMessage.id,
                  message: sentMessage.message,
                  senderId: sentMessage.senderId,
                  createdAt: sentMessage.createdAt,
                },
                updatedAt: sentMessage.createdAt,
              }
            : conv
        )
      );
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setError('');
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A', mb: 3 }}>
          Messages
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #e8eaed',
            height: 'calc(100vh - 200px)',
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          {/* Conversations List */}
          <Box
            sx={{
              width: { xs: '100%', md: 350 },
              borderRight: { xs: 'none', md: '1px solid #e8eaed' },
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#fafbfc',
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #e8eaed',
                bgcolor: 'white',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
                Conversations
              </Typography>
            </Box>

            {loading && conversations.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <CircularProgress sx={{ color: '#032B5A' }} />
              </Box>
            ) : conversations.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, p: 3 }}>
                <MessageIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Aucune conversation pour le moment
                </Typography>
              </Box>
            ) : (
              <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
                {conversations.map((conversation) => (
                  <ListItem key={conversation.bookingId} disablePadding>
                    <ListItemButton
                      onClick={() => handleSelectConversation(conversation)}
                      selected={selectedConversation?.bookingId === conversation.bookingId}
                      sx={{
                        borderBottom: '1px solid #e8eaed',
                        bgcolor: selectedConversation?.bookingId === conversation.bookingId ? '#fffbf0' : 'white',
                        '&:hover': {
                          bgcolor: selectedConversation?.bookingId === conversation.bookingId ? '#fffbf0' : '#f5f5f5',
                        },
                        '&.Mui-selected': {
                          bgcolor: '#fffbf0',
                          borderLeft: '4px solid #F4C542',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conversation.unreadCount}
                          color="error"
                          invisible={conversation.unreadCount === 0}
                        >
                          <Avatar
                            src={conversation.otherUser.profilePictureUrl}
                            sx={{
                              bgcolor: '#F4C542',
                              color: '#032B5A',
                              fontWeight: 700,
                            }}
                          >
                            {conversation.otherUser.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: conversation.unreadCount > 0 ? 700 : 600,
                                color: '#032B5A',
                              }}
                            >
                              {conversation.otherUser.name}
                            </Typography>
                            <Chip
                              label={conversation.booking.category}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: '#f5f5f5',
                                color: '#032B5A',
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            {conversation.lastMessage && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: conversation.unreadCount > 0 ? '#032B5A' : 'text.secondary',
                                  fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  mb: 0.5,
                                }}
                              >
                                {conversation.lastMessage.message}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {conversation.lastMessage
                                ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                                    addSuffix: true,
                                    locale: fr,
                                  })
                                : formatDistanceToNow(new Date(conversation.updatedAt), {
                                    addSuffix: true,
                                    locale: fr,
                                  })}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Chat Area */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'white',
            }}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid #e8eaed',
                    bgcolor: '#fafbfc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Avatar
                    src={selectedConversation.otherUser.profilePictureUrl}
                    sx={{
                      bgcolor: '#F4C542',
                      color: '#032B5A',
                      fontWeight: 700,
                    }}
                  >
                    {selectedConversation.otherUser.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      {selectedConversation.otherUser.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedConversation.booking.category}
                    </Typography>
                  </Box>
                </Box>

                {/* Messages */}
                <Box
                  ref={messagesContainerRef}
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 2,
                    bgcolor: '#fafbfc',
                  }}
                >
                  {loading && messages.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress sx={{ color: '#032B5A' }} />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <MessageIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        Aucun message. Commencez la conversation !
                      </Typography>
                    </Box>
                  ) : (
                    messages.map((message, index) => {
                      const isOwn = message.senderId === user.id;
                      const showDate =
                        index === 0 ||
                        new Date(message.createdAt).toDateString() !==
                          new Date(messages[index - 1].createdAt).toDateString();

                      return (
                        <React.Fragment key={message.id}>
                          {showDate && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                              <Chip
                                label={format(new Date(message.createdAt), 'd MMMM yyyy', { locale: fr })}
                                size="small"
                                sx={{
                                  bgcolor: '#e8eaed',
                                  color: '#666',
                                  fontSize: '0.75rem',
                                }}
                              />
                            </Box>
                          )}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: isOwn ? 'flex-end' : 'flex-start',
                              mb: 1,
                            }}
                          >
                            <Paper
                              sx={{
                                p: 1.5,
                                maxWidth: '70%',
                                bgcolor: isOwn ? '#F4C542' : 'white',
                                color: isOwn ? '#032B5A' : '#032B5A',
                                borderRadius: 3,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              }}
                            >
                              <Typography variant="body1" sx={{ mb: 0.5 }}>
                                {message.message}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: isOwn ? 'rgba(3, 43, 90, 0.7)' : 'text.secondary',
                                  fontSize: '0.7rem',
                                }}
                              >
                                {format(new Date(message.createdAt), 'HH:mm')}
                              </Typography>
                            </Paper>
                          </Box>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box
                  sx={{
                    p: 2,
                    borderTop: '1px solid #e8eaed',
                    bgcolor: 'white',
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sending}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || sending}
                            sx={{
                              color: '#F4C542',
                              '&:hover': {
                                bgcolor: 'rgba(244, 197, 66, 0.1)',
                              },
                              '&.Mui-disabled': {
                                color: '#ccc',
                              },
                            }}
                          >
                            <SendIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: '#fafbfc',
                      },
                    }}
                  />
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  p: 4,
                }}
              >
                <MessageIcon sx={{ fontSize: 96, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
                  Sélectionnez une conversation
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Choisissez une conversation dans la liste pour commencer à échanger des messages
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Container>
    </DashboardLayout>
  );
};

export default MessagesPage;

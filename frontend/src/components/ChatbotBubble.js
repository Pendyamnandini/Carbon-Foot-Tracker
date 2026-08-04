import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Box, IconButton, Typography, TextField, Paper, Avatar, 
  CircularProgress, Button, Chip, List, ListItem, ListItemText, 
  ListItemButton, Divider, Tooltip, InputAdornment, useTheme 
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MinimizeIcon from '@mui/icons-material/Minimize';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import api from '../api';

export const ChatbotBubble = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { t, lang } = useTranslation();

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Chat Data State
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Retrieve user role (standard user vs admin)
  const userRole = user ? (user.role || 'USER') : 'USER';

  // Load conversations on component mount or open
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, userRole]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const fetchConversations = async () => {
    setInitialLoading(true);
    try {
      const res = await api.get(`/api/chatbot/conversations?role=${userRole}`);
      if (res.data.success) {
        setConversations(res.data.data);
        if (res.data.data.length > 0) {
          // Open latest conversation
          loadConversation(res.data.data[0].id);
        } else {
          // Create a new conversation if none exist
          handleNewConversation();
        }
      }
    } catch (e) {
      console.error("Failed to load conversations", e);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadConversation = async (id) => {
    try {
      const res = await api.get(`/api/chatbot/conversations/${id}`);
      if (res.data.success) {
        setActiveConversation(res.data.data);
        setMessages(res.data.data.messages || []);
      }
    } catch (e) {
      console.error("Failed to load conversation details", e);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await api.post(`/api/chatbot/conversations?role=${userRole}`, { title: "New Conversation" });
      if (res.data.success) {
        setConversations(prev => [res.data.data, ...prev]);
        setActiveConversation(res.data.data);
        setMessages([]);
      }
    } catch (e) {
      console.error("Failed to create conversation", e);
    }
  };

  const handleSendMessage = async (customMessage) => {
    const textToSend = customMessage || inputMsg;
    if (!textToSend.trim()) return;

    let convId = activeConversation ? activeConversation.id : null;
    
    // If no active conversation exists, lazily initialize one first
    if (!convId) {
      setLoading(true);
      try {
        const createRes = await api.post(`/api/chatbot/conversations?role=${userRole}`, { title: "New Conversation" });
        if (createRes.data.success) {
          const newConv = createRes.data.data;
          setConversations(prev => [newConv, ...prev]);
          setActiveConversation(newConv);
          convId = newConv.id;
        } else {
          throw new Error("Failed to initialize conversation");
        }
      } catch (err) {
        console.error("Lazy conversation initialization failed", err);
        setMessages(prev => [...prev, {
          sender: 'BOT',
          content: "⚠️ **System Error:** Failed to initialize chat session. Verify database status.",
          createdAt: new Date().toISOString()
        }]);
        setLoading(false);
        return;
      }
    }

    // Log the user message
    const userMessage = { sender: 'USER', content: textToSend, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInputMsg('');
    setLoading(true);

    try {
      const res = await api.post(`/api/chatbot/conversations/${convId}/query`, {
        message: textToSend
      });
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
        // Update conversation list
        fetchConversations();
      }
    } catch (e) {
      console.error("Failed to send message", e);
      setMessages(prev => [...prev, {
        sender: 'BOT',
        content: "⚠️ **System Error:** Failed to compile AI response. Verify network services are running.",
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/chatbot/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversation && activeConversation.id === id) {
        setMessages([]);
        setActiveConversation(null);
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  };

  const handleClearChat = async () => {
    if (!activeConversation) return;
    try {
      // Re-create conversation
      const currentId = activeConversation.id;
      await api.delete(`/api/chatbot/conversations/${currentId}`);
      handleNewConversation();
    } catch (e) {
      console.error("Failed to clear chat", e);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  const filteredConversations = useMemo(() => {
    if (!historySearch.trim()) return conversations;
    const q = historySearch.toLowerCase();
    return conversations.filter(c => c.title.toLowerCase().includes(q));
  }, [conversations, historySearch]);

  // Suggested prompt chips depending on user role
  const suggestedPrompts = userRole === 'ADMIN' 
    ? ["Active users logged in today", "Total registrations on platform", "Pending support tickets"]
    : ["What is my carbon footprint today?", "What was yesterday's emission?", "What should I improve first?", "What is Net Zero?"];

  // Custom Markdown regex parser
  const renderMessageContent = (text) => {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h5 style="margin-top: 12px; margin-bottom: 6px; font-weight: 700; color: #10b981; font-size: 0.95rem;">$1</h5>');
    html = html.replace(/^## (.*$)/gim, '<h4 style="margin-top: 16px; margin-bottom: 8px; font-weight: 700; font-size: 1.05rem;">$1</h4>');
    html = html.replace(/^# (.*$)/gim, '<h3 style="margin-top: 20px; margin-bottom: 10px; font-weight: 800; font-size: 1.15rem;">$1</h3>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Bullet points
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left: 16px; margin-bottom: 4px; font-size: 0.875rem;">$1</li>');

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (!user) return null;

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}>
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            color: '#ffffff',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.1) translateY(-4px)',
              boxShadow: '0 12px 40px rgba(16, 185, 129, 0.6)',
            }
          }}
        >
          <ChatIcon sx={{ fontSize: 28 }} />
        </IconButton>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <Paper
          elevation={16}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: isMaximized ? 'min(90vw, 850px)' : 380,
            height: isMaximized ? 'min(85vh, 650px)' : 500,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            background: theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            overflow: 'hidden',
            flexDirection: 'row',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {/* History Sidebar Panel */}
          {((isMaximized || showHistory)) && (
            <Box
              sx={{
                width: 240,
                borderRight: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(11, 15, 25, 0.5)' : 'rgba(241, 245, 249, 0.5)'
              }}
            >
              {/* Sidebar Header */}
              <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search chats..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, fontSize: '0.8rem' }
                  }}
                />
                <Tooltip title="New Chat">
                  <IconButton size="small" onClick={handleNewConversation} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Conversations List */}
              <List sx={{ flex: 1, overflowY: 'auto', px: 1, py: 0 }}>
                {filteredConversations.map(c => (
                  <ListItem
                    key={c.id}
                    disablePadding
                    secondaryAction={
                      <IconButton size="small" onClick={(e) => handleDeleteConversation(c.id, e)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{ mb: 0.5, borderRadius: 2, overflow: 'hidden' }}
                  >
                    <ListItemButton
                      selected={activeConversation && activeConversation.id === c.id}
                      onClick={() => loadConversation(c.id)}
                      sx={{
                        py: 0.75,
                        px: 1.5,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: '#ffffff',
                          '&:hover': { bgcolor: 'primary.dark' },
                          '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                        }
                      }}
                    >
                      <ListItemText
                        primary={c.title}
                        secondary={new Date(c.createdAt).toLocaleDateString()}
                        primaryTypographyProps={{ noWrap: true, variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Main Chat Panel Area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Chat Panel Header */}
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: '1px solid', 
                borderColor: 'divider', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.paper'
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 20, color: '#ffffff' }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {userRole === 'ADMIN' ? 'Carbon Admin AI' : 'Carbon Assistant AI'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activeConversation ? activeConversation.title : 'Live Database Context'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={0.5}>
                {/* Toggle Sidebar Icon */}
                {!isMaximized && (
                  <IconButton size="small" onClick={() => setShowHistory(!showHistory)}>
                    <HistoryIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton size="small" onClick={() => setIsMaximized(!isMaximized)}>
                  {isMaximized ? <MinimizeIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
                </IconButton>
                <IconButton size="small" onClick={() => setIsOpen(false)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Chat Message Scrollable Container */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {initialLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress size={24} />
                </Box>
              ) : messages.length === 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" textAlign="center" p={3}>
                  <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1.5, opacity: 0.6 }} />
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Ask your live Carbon Tracker Assistant
                  </Typography>
                  <Typography variant="caption" color="text.secondary" maxWidth={260}>
                    Query today's/yesterday's footprint, goals, active logins, or administrative stats.
                  </Typography>
                </Box>
              ) : (
                messages.map((m, idx) => (
                  <Box 
                    key={idx} 
                    display="flex" 
                    flexDirection="column"
                    alignItems={m.sender === 'USER' ? 'flex-end' : 'flex-start'}
                  >
                    <Box 
                      sx={{
                        maxWidth: '85%',
                        p: 1.5,
                        px: 2,
                        borderRadius: 3,
                        bgcolor: m.sender === 'USER' 
                          ? 'primary.main' 
                          : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                        color: m.sender === 'USER' ? '#ffffff' : 'text.primary',
                        border: m.sender === 'USER' ? 'none' : '1px solid',
                        borderColor: 'divider',
                        position: 'relative'
                      }}
                    >
                      {/* Message Content with custom markdown */}
                      {renderMessageContent(m.content)}

                      {/* Copy Action button on Bot response hover */}
                      {m.sender === 'BOT' && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyText(m.content)}
                          sx={{ 
                            position: 'absolute', 
                            bottom: -28, 
                            right: 0, 
                            opacity: 0.6,
                            '&:hover': { opacity: 1 }
                          }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                ))
              )}

              {/* Bot Loading Indicator */}
              {loading && (
                <Box display="flex" gap={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', width: 28, height: 28 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    AI Assistant is thinking...
                  </Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Suggested Chip Prompt Panel */}
            {messages.length === 0 && (
              <Box sx={{ px: 2, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestedPrompts.map(p => (
                  <Chip
                    key={p}
                    label={p}
                    clickable
                    size="small"
                    onClick={() => handleSendMessage(p)}
                    sx={{
                      fontSize: '0.75rem',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Chat Input Toolbar Panel */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box display="flex" gap={1} alignItems="center">
                <Tooltip title="Clear Chat">
                  <IconButton size="small" onClick={handleClearChat} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <ClearAllIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask a question..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  InputProps={{
                    sx: { borderRadius: 3, fontSize: '0.875rem' }
                  }}
                />

                <IconButton 
                  color="primary" 
                  disabled={!inputMsg.trim() || loading}
                  onClick={() => handleSendMessage()}
                  sx={{
                    bgcolor: inputMsg.trim() ? 'primary.main' : 'transparent',
                    color: inputMsg.trim() ? '#ffffff' : 'text.disabled',
                    '&:hover': {
                      bgcolor: inputMsg.trim() ? 'primary.dark' : 'transparent',
                    }
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ChatbotBubble;

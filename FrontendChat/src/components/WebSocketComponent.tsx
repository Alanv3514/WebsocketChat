import { useState, useEffect, useRef } from 'react';
import { TextField, Button, Typography, Container, Paper } from '@mui/material';
import io from 'socket.io-client';

const socket = io('ws://localhost:8000', {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

function WebSocketComponent() {
  const [alias, setAlias] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Establece alias desde localStorage al cargar
    const storedAlias = localStorage.getItem('aliasWebchat');
    if (storedAlias && !isLoggedIn) {
      setAlias(storedAlias);
      socket.emit('user:login', JSON.stringify({ type: 'login', message: storedAlias }));
      setIsLoggedIn(true);
    }
    else if(!isLoggedIn){
      
      setAlias("anonimo#0404");
      socket.emit('user:login', JSON.stringify({ type: 'login', message: "anonimo" }));
      setIsLoggedIn(true);
    }

    socket.on('user:validate', (data) => {
      setAlias(JSON.parse(data).alias);
    });

    socket.on('message:public', (data) => {
      try {
        const parsedData = JSON.parse(data);
        setMessages((prevMessages) => [...prevMessages, parsedData]);
        if (document.hidden) {
          setUnreadMessages((prev) => prev + 1);
        }
      } catch (e) {
        console.error('Error parsing public message:', e);
      }
    });

    socket.on('chat:history', (data) => {
      try {
        const parsedData = JSON.parse(data);
        setMessages([...parsedData.messages]);
      } catch (e) {
        console.error('Error parsing chat history:', e);
      }
    });

    socket.on('user:list', (data) => {
      try {
        const parsedData = JSON.parse(data);
        setUsers(parsedData.users);
      } catch (e) {
        console.error('Error parsing user list:', e);
      }
    });

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setUnreadMessages(0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      socket.off('message:public');
      socket.off('chat:history');
      socket.off('user:validate');
      socket.off('user:list');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    document.title = unreadMessages > 0
      ? `(${unreadMessages}) New messages`
      : 'Live Chat';
  }, [unreadMessages]);

  const handleMessageSubmit = async () => {
    if (message.trim()) {
      await socket.emit('user:send', JSON.stringify({ type: 'public', message }));
      setMessage('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', width: '90%' }}>
      <Typography variant="h4" style={{ alignSelf: 'center' }}>
        Live Chat (usuario: {alias})
      </Typography>
      <div style={{ display: 'flex', height: '75vh' }}>
        <Paper style={{ marginRight: '10px', padding: '10px', width: '100%', overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <Typography key={index}>{msg.fromUser}: {msg.message}</Typography>
          ))}
          <div ref={messagesEndRef} />
        </Paper>
        <Paper style={{ padding: '10px' }}>
          <Typography variant="h6">Usuarios conectados:</Typography>
          {users.map((user, index) => (
            <Typography key={index}>{user}</Typography>
          ))}
        </Paper>
      </div>
      <TextField
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            handleMessageSubmit();
          }
        }}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleMessageSubmit}>
        Send Message
      </Button>
    </Container>
  );
}

export default WebSocketComponent;

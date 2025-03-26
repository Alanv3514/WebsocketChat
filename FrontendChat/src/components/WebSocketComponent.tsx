import { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Paper } from '@mui/material';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';

const socket = io('ws://localhost:8327');

function WebSocketComponent() {
  const [alias, setAlias] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const location = useLocation();

  useEffect(() => {
    if (location.state.alias) {
      setAlias(location.state.alias);
      socket.emit('login', JSON.stringify({ type: 'setAlias', message: location.state.alias }));
    }

    socket.on('message', (data) => {
      try {
        const parsedData = JSON.parse(data);
        console.log(parsedData);
        if (parsedData.type === 'alias') {
          setAlias(parsedData.alias);
        } else if (parsedData.type === 'freshUsers') {
          setUsers(parsedData.users);
        } else {
          setMessages((prevMessages) => [...prevMessages, parsedData]);
        }
      } catch (e) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    socket.on('freshUsers', (data) => {
      try {
        const parsedData = JSON.parse(data);
        setUsers(parsedData.users);
      } catch (e) {
        console.log('Error parsing freshUsers:', e);
      }
    });

    return () => {
      socket.off('message');
      socket.off('freshUsers');
    };
  }, [location.state.alias]);

  const handleMessageSubmit = () => {
    socket.emit('message', JSON.stringify({ type: 'message', message: message }));
    setMessage('');
  };

  return (
    <Container>
      <Typography variant="h4">WebSocket Client ("{alias}")</Typography>
      <div style={{ display: 'flex' }}>
        <Paper style={{ marginRight: '10px', padding: '10px' }}>
          {messages.map((msg, index) => (
            <Typography key={index}>{msg.alias}: {msg.message}</Typography>
          ))}
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
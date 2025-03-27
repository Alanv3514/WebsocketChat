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
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const location = useLocation();



  useEffect(() => {
    if (location.state.alias && !isLoggedIn) { // Verifica si no ha iniciado sesión
      setAlias(location.state.alias);
      socket.emit('user:login', JSON.stringify({ type: 'login', message: location.state.alias }));
      setIsLoggedIn(true); // Cambia el estado a true después de iniciar sesión
    }

    socket.on('user:validate', (data) => {
      setAlias(JSON.parse(data).alias);
    });

    socket.on('message:public', (data) => {
      try {
        const parsedData = JSON.parse(data);
        setMessages((prevMessages) => [...prevMessages, parsedData]);
      } catch (e) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    socket.on('user:list', (data) => {
      try {
        const parsedData = JSON.parse(data);
        setUsers(parsedData.users);
      } catch (e) {
        console.log('Error parsing freshUsers:', e);
      }
    });

    return () => {
      socket.off('message:public');
      socket.off('user:validate');
      socket.off('user:list');
      
    };
  }, [location.state.alias, isLoggedIn]); 


  const handleMessageSubmit = () => {
    console.log(message)
    socket.emit('user:send', JSON.stringify({ type: 'public', message: message }));
    setMessage('');
  };

  return (
    <Container style={
      {display:'flex',
        flexDirection:"column",
        width:"90%",

    }} >
      <Typography variant="h4"
      style={
        {
        alignSelf:'center',
      }}
      >Live Chat (usuario: {alias})</Typography>
      <div style={{ display: 'flex', height:"75vh"}}>
        <Paper style={{ 
          marginRight: '10px', 
          padding: '10px', 
          width:"100%"
          }}>
          {messages.map((msg, index) => (
            <Typography key={index}>{msg.fromUser}: {msg.message}</Typography>
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
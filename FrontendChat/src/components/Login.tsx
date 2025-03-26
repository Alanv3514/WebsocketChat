import { useState } from 'react';
import { TextField, Button, Typography, Container } from '@mui/material';

import { useNavigate } from 'react-router-dom';


function Login() {
  const [alias, setAlias] = useState('');
    const navigate = useNavigate();

  const handleAliasSubmit = () => {
    console.log(alias)
    navigate('/chat',{state:{alias:`${alias}`}})
  };

  return (
    <Container>
      <Typography variant="h4">WebSocket Login Client</Typography>
      <TextField
        label="Alias"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleAliasSubmit}>
        Set Alias
      </Button>
    </Container>
  );
}

export default Login;
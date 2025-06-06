import { useState } from 'react';
import { TextField, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [alias, setAlias] = useState('');
  const navigate = useNavigate();

  const handleAliasSubmit = () => {
    const trimmedAlias = alias.trim();
    if (trimmedAlias) {
      localStorage.setItem('aliasWebchat', trimmedAlias);
      navigate('/chat'); 
    } else {
      alert('Por favor, ingresá un alias válido.');
    }
  };

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', width: '40%' }}>
      <Typography variant="h4" sx={{ alignSelf: 'center', marginBottom: 2 }}>
        Live Chat Login:
      </Typography>

      <TextField
        label="Nombre de Usuario"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        fullWidth
        margin="normal"
        variant="filled"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleAliasSubmit}
        disabled={alias.trim() === ''}
      >
        Iniciar
      </Button>
    </Container>
  );
}

export default Login;

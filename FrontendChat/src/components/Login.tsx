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
    <Container sx={
      {display:'flex',
        flexDirection:"column",
        width:"40%"

    }}>
      <Typography variant="h4"sx={
        {
        alignSelf:'center'
      }}>Live Chat Login:</Typography>
      <TextField
        label="Nombre de Usuario"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        fullWidth
        margin="normal"
        variant='filled'
      />
      <Button variant="contained" color="primary" onClick={handleAliasSubmit}>
        Iniciar
      </Button>
    </Container>
  );
}

export default Login;
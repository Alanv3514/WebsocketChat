require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const corsConfig = require('./security/authorization');
const cors = require('cors');
const { websocketConfig } = require('./websocket/config/websocketConfig');
const app = express();

const server = http.createServer(app);


const io = socketIo(server, {
  cors: corsConfig
});

app.use(cors(corsConfig));


io.on('connection',(socket)=>{ 
  console.log('New client connected');

  websocketConfig(socket,io)

});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
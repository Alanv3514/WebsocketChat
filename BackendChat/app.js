require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const  corsConfig  = require('./security/authorization');
const cors = require('cors');
const { websocketConfig } = require('./websocket/config/websocketConfig');
const app = express();

const server = http.createServer(app);

const io = socketIo(server, {
  cors: `http://${corsConfig}`
});

app.use(cors({
  origin: `http://${corsConfig.origin}`
}));


io.on('connection',(socket)=>{ 
  console.log('New client connected');

  websocketConfig(socket,io)

});

server.listen(process.env.APP_PORTHTTP, () => {
  console.log(`listening on *:${process.env.APP_PORTHTTP}`);
});
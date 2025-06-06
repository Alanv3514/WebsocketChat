const { generateUniqueAlias } = require("../utils/generateUniqueAlias");
const redis = require('redis');

const redisClient = redis.createClient({
  socket: {
    host: 'redisdb',
    port: 6379
  },
  maxRetriesPerRequest: 5
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

let connectedUsers = new Set();

(async () => {
  try {
    await redisClient.connect();
    console.log(`✅ Conectado a Redis en ${redisClient.options.socket.host}:${redisClient.options.socket.port}`);
  } catch (e) {
    console.error('❌ Error al conectar con Redis:', e);
  }
})();

const websocketConfig = (socket, io) => {
  socket.on('user:login', async (data) => {
    try {
      const parsedData = JSON.parse(data);
      socket.alias = generateUniqueAlias(parsedData.message, connectedUsers);
      connectedUsers.add(socket.alias);
      io.emit('user:validate', JSON.stringify({ type: 'info', alias: socket.alias }));
      io.emit('user:list', JSON.stringify({ type: 'info', users: Array.from(connectedUsers) }));

      const messages = await redisClient.lRange('messages', 0, 19);
      const parsedMessages = messages.map(msg => {
        try {
          return JSON.parse(msg);
        } catch (e) {
          console.error('Error parsing message:', e);
          return null;
        }
      }).reverse().filter(msg => msg !== null);

      io.emit('chat:history', JSON.stringify({ type: 'history', messages: parsedMessages }));
    } catch (e) {
      console.log(e);
      io.emit('error', JSON.stringify({ type: 'error', alias: socket.alias, message: `not send: ${data}` }));
    }
  });

  socket.on('user:send', async (data) => {
    try {
      const parsedData = JSON.parse(data);
      console.log(`${socket.alias} say to public: ${parsedData.message}`);
      io.emit('message:public', JSON.stringify({ type: 'public', fromUser: `${socket.alias?socket.alias:'anonimo'}`, message: `${parsedData.message}` }));

      await redisClient.lPush('messages', JSON.stringify({ fromUser: socket.alias?socket.alias:'anonimo', message: parsedData.message }));
      console.log('Message saved to Redis');
    } catch (e) {
      console.log(e);
      io.emit('error', JSON.stringify({ type: 'error', alias: socket.alias, message: `not send: ${data}` }));
    }
  });

  socket.on('disconnect', () => {
    if (socket.alias) {
      connectedUsers.delete(socket.alias);
      io.emit('user:list', JSON.stringify({ type: 'info', users: Array.from(connectedUsers) }));
      console.log(`El usuario ${socket.alias?socket.alias:'anonimo'} se ha desconectado`);
    }
  });
};

module.exports = { websocketConfig };

const { generateUniqueAlias } = require("../utils/generateUniqueAlias");
const redis = require('redis');

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redisdb',
    port: Number(process.env.REDIS_PORT) || 6379
  },
  maxRetriesPerRequest: 5
});

let redisConnected = false;

redisClient.on('error', (err) => {
  console.error('Redis error:', err.message);
});

redisClient.on('ready', () => {
  redisConnected = true;
  console.log(`✅ Conectado a Redis en ${redisClient.options.socket.host}:${redisClient.options.socket.port}`);
});

redisClient.on('end', () => {
  redisConnected = false;
  console.warn('⚠️ Conexión con Redis cerrada: el chat continúa sin historial');
});

let connectedUsers = new Set();

(async () => {
  try {
    await redisClient.connect();
  } catch (e) {
    console.error('❌ No se pudo conectar con Redis: el chat funciona sin historial. Detalle:', e.message);
  }
})();

const MAX_ALIAS_LENGTH = 30;
const MAX_MESSAGE_LENGTH = 500;

const websocketConfig = (socket, io) => {
  const emitErrorTo = (socket, message) => {
    socket.emit('error', JSON.stringify({ type: 'error', alias: socket.alias || 'anonimo', message }));
  };

  socket.on('user:login', async (data) => {
    try {
      const parsedData = JSON.parse(data);
      const baseAlias = typeof parsedData.message === 'string' ? parsedData.message.trim() : '';
      if (!baseAlias || baseAlias.length > MAX_ALIAS_LENGTH) {
        emitErrorTo(socket, `Alias inválido: debe tener entre 1 y ${MAX_ALIAS_LENGTH} caracteres`);
        return;
      }
      socket.alias = generateUniqueAlias(baseAlias, connectedUsers);
      connectedUsers.add(socket.alias);
      io.emit('user:validate', JSON.stringify({ type: 'info', alias: socket.alias }));
      io.emit('user:list', JSON.stringify({ type: 'info', users: Array.from(connectedUsers) }));

      if (redisConnected) {
        const messages = await redisClient.lRange('messages', 0, 19);
        const parsedMessages = messages.map(msg => {
          try {
            return JSON.parse(msg);
          } catch (e) {
            console.error('Error parsing message:', e);
            return null;
          }
        }).reverse().filter(msg => msg !== null);

        socket.emit('chat:history', JSON.stringify({ type: 'history', messages: parsedMessages }));
      } else {
        console.warn(`Historial no disponible para ${socket.alias}: Redis desconectado`);
      }
    } catch (e) {
      console.log(e);
      emitErrorTo(socket, `not send: ${data}`);
    }
  });

  socket.on('user:send', async (data) => {
    try {
      const parsedData = JSON.parse(data);
      const message = typeof parsedData.message === 'string' ? parsedData.message.trim() : '';
      if (!message || message.length > MAX_MESSAGE_LENGTH) {
        emitErrorTo(socket, `Mensaje inválido: debe tener entre 1 y ${MAX_MESSAGE_LENGTH} caracteres`);
        return;
      }
      console.log(`${socket.alias} say to public: ${message}`);
      io.emit('message:public', JSON.stringify({ type: 'public', fromUser: `${socket.alias?socket.alias:'anonimo'}`, message: `${message}` }));

      if (redisConnected) {
        await redisClient.lPush('messages', JSON.stringify({ fromUser: socket.alias?socket.alias:'anonimo', message }));
        await redisClient.lTrim('messages', 0, 199);
        console.log('Message saved to Redis');
      }
    } catch (e) {
      console.log(e);
      emitErrorTo(socket, `not send: ${data}`);
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



let connectedUsers = new Set();

const websocketConfig = (socket,io) => {

  socket.on('user:login', (data) => {
    try {
      const parsedData = JSON.parse(data);
        socket.alias = parsedData.message;
        connectedUsers.add(socket.alias);
        io.emit('user:list', JSON.stringify({ type: 'freshUsers', users: Array.from(connectedUsers) }));
      
    } catch (e) {
      console.log(e)
      io.emit('error', JSON.stringify({ type: 'error', alias: socket.alias, message: `not send: ${data}` }));
    }
  });

    socket.on('message', (data) => {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.type === 'setAlias') {
          socket.alias = parsedData.message;
          connectedUsers.add(socket.alias);
          console.log(`Alias set: ${socket.alias}`);
          io.emit('freshUsers', JSON.stringify({ type: 'freshUsers', users: Array.from(connectedUsers) }));
        } else {
          console.log(`${socket.alias}: ${parsedData.message}`);
          io.emit('message', JSON.stringify({ type: 'message', alias: socket.alias, message: parsedData.message }));
        }
      } catch (e) {
        console.log(e)
        io.emit('error', JSON.stringify({ type: 'error', alias: socket.alias, message: `not send: ${data}` }));
      }
    });

  
  }

  
module.exports = {websocketConfig}
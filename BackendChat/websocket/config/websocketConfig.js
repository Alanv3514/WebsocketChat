const generateUniqueAlias = (baseAlias, connectedUsers) => {
  let alias;
  do {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Genera un número aleatorio de 4 cifras
    alias = `${baseAlias}#${randomNumber}`;
  } while (connectedUsers.has(alias));
  return alias;
};
let connectedUsers = new Set();

const websocketConfig = (socket,io) => {

  socket.on('user:login', (data) => {
    try {
      const parsedData = JSON.parse(data);
      socket.alias = generateUniqueAlias(parsedData.message, connectedUsers);
      connectedUsers.add(socket.alias);
      io.emit('user:validate',JSON.stringify({type:'info',alias:socket.alias}))
      io.emit('user:list', JSON.stringify({ type: 'info', users: Array.from(connectedUsers) }));
      
    } catch (e) {
      console.log(e)
      io.emit('error', JSON.stringify({ type: 'error', alias: socket.alias, message: `not send: ${data}` }));
    }
  });

    socket.on('user:send', (data) => {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.type === 'private') {
          console.log(`${socket.alias} whisp to ${parsedData.toUser} : ${parsedData.message}`);
          io.emit(`message:${parsedData.toUser}`, JSON.stringify({ type: 'private',fromUser:`${socket.alias}`, message: `${socket.message}` }));
        } else if(parsedData.type === 'group') {
          console.log(`${socket.alias} say to group ${parsedData.toGroup} : ${parsedData.message}`);
          io.emit(`message:${parsedData.toGroup}`, JSON.stringify({ type: 'group', fromUser:`${socket.alias}`, message: `${socket.message}` }));
        } else {
          console.log(`${socket.alias} say to public: ${parsedData.message}`);
          io.emit('message:public', JSON.stringify({ type: 'public', fromUser:`${socket.alias}`, message: `${parsedData.message}` }));
        }
      } catch (e) {
        console.log(e)
        io.emit('error', JSON.stringify({ type: 'error', alias: socket.alias, message: `not send: ${data}` }));
      }
    });

  
    socket.on('disconnect', () => {
      if (socket.alias) {
        connectedUsers.delete(socket.alias);
        io.emit('user:list', JSON.stringify({ type: 'info', users: Array.from(connectedUsers) }));
        console.log(connectedUsers)
        console.log(`El usuario ${socket.alias} se ha desconectado`);
      }
    });
  }

  
module.exports = {websocketConfig}
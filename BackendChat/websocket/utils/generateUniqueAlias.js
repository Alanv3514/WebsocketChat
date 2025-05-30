const generateUniqueAlias = (baseAlias, connectedUsers) => {
    let alias;
    do {
      const randomNumber = Math.floor(1000 + Math.random() * 9000); // Genera un número aleatorio de 4 cifras
      alias = `${baseAlias}#${randomNumber}`;
    } while (connectedUsers.has(alias));
    return alias;
  };

  module.exports = {generateUniqueAlias}

  
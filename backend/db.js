const mysql = require('mysql2/promise');

// Configuração do pool de conexão com o MySQL
// Para facilitar o MVP, definimos usuário/senha padrão que o usuário pode alterar se precisar.
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root', // Insira sua senha do MySQL aqui se houver
  database: 'receitacerta',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

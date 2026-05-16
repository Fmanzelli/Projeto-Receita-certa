const mysql = require('mysql2/promise');

// Configuração do pool de conexão com o MySQL
// Para facilitar o MVP, definimos usuário/senha padrão que o usuário pode alterar se precisar.
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'root', 
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'receitacerta',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  queueLimit: 0
});

module.exports = pool;

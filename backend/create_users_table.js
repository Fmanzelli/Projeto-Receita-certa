const db = require('./db');

async function createTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela users criada com sucesso via Node MySQL2!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao injetar tabela de seguranca:', error.message);
    process.exit(1);
  }
}

createTable();

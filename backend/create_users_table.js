const db = require('./db');

async function createTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        cpf VARCHAR(100) UNIQUE NULL,
        birth_date DATE NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        purchase_quantity DECIMAL(10,4) DEFAULT 1,
        purchase_price DECIMAL(10,2) DEFAULT 0,
        cost_per_unit DECIMAL(10,4) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        yield_quantity DECIMAL(10,2) DEFAULT 1,
        yield_unit VARCHAR(20) DEFAULT 'un',
        labor_cost DECIMAL(10,2) DEFAULT 0,
        overhead_percent DECIMAL(5,2) DEFAULT 0,
        profit_margin DECIMAL(5,2) DEFAULT 0,
        instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipe_id INT NOT NULL,
        ingredient_id INT NULL,
        sub_recipe_id INT NULL,
        quantity DECIMAL(10,4) NOT NULL,
        unit VARCHAR(20) NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
        FOREIGN KEY (sub_recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      )
    `);
    console.log('Todas as tabelas base foram criadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao injetar tabelas:', error.message);
    process.exit(1);
  }
}

createTable();

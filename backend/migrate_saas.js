const db = require('./db');

async function migrate() {
  try {
    console.log("Iniciando migration p/ SaaS Isolado...");
    
    // Add columns to users
    try { 
      await db.query('ALTER TABLE users ADD COLUMN cpf VARCHAR(14) UNIQUE AFTER name'); 
      console.log("Coluna cpf injetada na tabela users."); 
    } catch(e) { console.log('Coluna cpf ja existe.'); }
    
    try { 
      await db.query('ALTER TABLE users ADD COLUMN birth_date DATE AFTER cpf'); 
      console.log("Coluna birth_date injetada na tabela users."); 
    } catch(e) { console.log('Coluna birth_date ja existe.'); }
    
    // Add user_id to ingredients
    try { 
      await db.query('ALTER TABLE ingredients ADD COLUMN user_id INT AFTER id');
      console.log("Coluna user_id injetada na tabela ingredients."); 
      await db.query('UPDATE ingredients SET user_id = 1 WHERE user_id IS NULL');
      await db.query('ALTER TABLE ingredients ADD CONSTRAINT fk_ing_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    } catch(e) { console.log('FK/Coluna em ingredients pronta ou falhou:', e.message); }

    // Add user_id to recipes
    try { 
      await db.query('ALTER TABLE recipes ADD COLUMN user_id INT AFTER id');
      console.log("Coluna user_id injetada na tabela recipes."); 
      await db.query('UPDATE recipes SET user_id = 1 WHERE user_id IS NULL');
      await db.query('ALTER TABLE recipes ADD CONSTRAINT fk_rec_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    } catch(e) { console.log('FK/Coluna em recipes pronta ou falhou:', e.message); }

    console.log("Sucesso Absoluto na Migration Arquitetural!");
    process.exit(0);
  } catch (error) {
    console.error("Erro critico na Migration:", error);
    process.exit(1);
  }
}

migrate();

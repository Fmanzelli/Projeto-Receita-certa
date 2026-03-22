const db = require('./db');

async function migrate_pastrycal() {
  try {
    console.log("Iniciando migration para os campos do PastryCal...");
    
    // Add columns to recipes
    try { 
      await db.query('ALTER TABLE recipes ADD COLUMN `yield` INT DEFAULT 1 AFTER name'); 
      console.log("Coluna yield injetada na tabela recipes."); 
    } catch(e) { console.log('Coluna yield já existe ou erro:', e.message); }
    
    try { 
      await db.query('ALTER TABLE recipes ADD COLUMN labor_time DECIMAL(10, 2) DEFAULT 0 AFTER `yield`'); 
      console.log("Coluna labor_time injetada na tabela recipes."); 
    } catch(e) { console.log('Coluna labor_time já existe ou erro:', e.message); }
    
    try { 
      await db.query('ALTER TABLE recipes ADD COLUMN labor_rate DECIMAL(10, 2) DEFAULT 0 AFTER labor_time'); 
      console.log("Coluna labor_rate injetada na tabela recipes."); 
    } catch(e) { console.log('Coluna labor_rate já existe ou erro:', e.message); }
    
    try { 
      await db.query('ALTER TABLE recipes ADD COLUMN packaging_cost DECIMAL(10, 2) DEFAULT 0 AFTER profit_margin'); 
      console.log("Coluna packaging_cost injetada na tabela recipes."); 
    } catch(e) { console.log('Coluna packaging_cost já existe ou erro:', e.message); }

    console.log("Migration PastryCal concluída com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("Erro critico na Migration:", error);
    process.exit(1);
  }
}

migrate_pastrycal();

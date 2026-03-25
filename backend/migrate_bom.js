const db = require('./db');

async function migrate() {
  try {
    console.log("Iniciando expansão estrutural para Fichas Compostas (BOM)...");
    
    // Novas propriedades das Receitas
    try { await db.query("ALTER TABLE recipes ADD COLUMN yield_quantity DECIMAL(10,2) DEFAULT 1 AFTER name"); console.log("yield_quantity adicionado em recipes"); } catch(e) { console.log('yield_quantity já existe.'); }
    try { await db.query("ALTER TABLE recipes ADD COLUMN yield_unit VARCHAR(20) DEFAULT 'un' AFTER yield_quantity"); console.log("yield_unit adicionado em recipes"); } catch(e) { console.log('yield_unit já existe.');}

    // Aceitação Dinâmica dos Ingredientes
    try { await db.query("ALTER TABLE recipe_ingredients MODIFY ingredient_id INT NULL"); console.log("ingredient_id transformado em opcional"); } catch(e) {}
    try { 
      await db.query("ALTER TABLE recipe_ingredients ADD COLUMN sub_recipe_id INT NULL AFTER ingredient_id"); 
      await db.query("ALTER TABLE recipe_ingredients ADD CONSTRAINT fk_sub_recipe FOREIGN KEY (sub_recipe_id) REFERENCES recipes(id) ON DELETE CASCADE");
      console.log("Coluna e Chave Estrangeira de sub_recipe_id criadas com sucesso");
    } catch(e) { console.log('sub_recipe_id já ajustado: ', e.message); }
    
    // Gravação Histórica da Unidade de Medida escolhida no ato
    try { await db.query("ALTER TABLE recipe_ingredients ADD COLUMN unit VARCHAR(20) NULL AFTER quantity"); console.log("coluna unit adicionada"); } catch(e) { console.log('coluna unit já existe.'); }

    console.log("Estrutura Dinâmica Finalizada!");
    process.exit(0);
  } catch (error) {
    console.error("Erro fatal: ", error);
    process.exit(1);
  }
}
migrate();

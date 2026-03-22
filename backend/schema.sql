CREATE DATABASE IF NOT EXISTS receitacerta;

USE receitacerta;

-- Tabela de ingredientes
CREATE TABLE IF NOT EXISTS ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    cost_per_unit DECIMAL(10, 2) NOT NULL
);

-- Tabela de receitas
CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    labor_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    overhead_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    profit_margin DECIMAL(5, 2) NOT NULL DEFAULT 0.00
);

-- Tabela de relação entre receitas e ingredientes na receita
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity DECIMAL(10, 4) NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middlewares/authMiddleware');

// Validar idade > 18
const isAdult = (birthDateString) => {
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 18;
};

// 1. Cadastrar Usuário
router.post('/register', async (req, res) => {
  try {
    const { name, cpf, birth_date, email, password } = req.body;
    
    if (!name || !cpf || !birth_date || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios para a abertura de conta empresarial.' });
    }

    if (!isAdult(birth_date)) {
      return res.status(403).json({ error: 'O sistema é restrito legalmente para usuários acima de 18 anos. Cadastro não permitido.' });
    }

    // Verificar se usuário já existe
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? OR cpf = ?', [email, cpf]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Este e-mail ou CPF fornecido já está vinculado a outro locatário (conta).' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cadastrar
    const [result] = await db.query(
      'INSERT INTO users (name, cpf, birth_date, email, password) VALUES (?, ?, ?, ?, ?)',
      [name, cpf, birth_date, email, hashedPassword]
    );

    res.status(201).json({ 
      message: 'Conta Empresarial aberta com sucesso!',
      user: { id: result.insertId, name, email } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor: ' + error.message });
  }
});

// 2. Fazer Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const user = users[0];

    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expira em 24h
    );

    res.json({
      message: 'Bem-vindo(a) de volta!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor: ' + error.message });
  }
});

// 3. Buscar Perfil Logado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, cpf, birth_date, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor: ' + error.message });
  }
});

// 4. Alterar Senha
router.put('/me/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Preencha a senha atual e a nova senha.' });
    }

    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
    
    const user = users[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'A senha atual está incorreta. Segurança bloqueada.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    
    res.json({ message: 'Sua senha foi alterada com sucesso e já está valendo!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor: ' + error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middlewares/authMiddleware');

const ENCRYPTION_KEY = 'ReceitaCertaSecSecretLGPDKey256!'; // 32 bytes (Fixos para MVP)
const FIXED_IV = Buffer.alloc(16, 0);

function encrypt(text) {
  try {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), FIXED_IV);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  } catch(e) { return text; }
}

function decryptGraceful(text) {
  try {
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), FIXED_IV);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return text; // Fallback para CPFs antigos salvos em texto puro
  }
}

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
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está vinculado a outro corporativo.' });
    }

    const encryptedCpf = encrypt(cpf);
    const [existingCpf] = await db.query('SELECT id FROM users WHERE cpf = ?', [encryptedCpf]);
    if (existingCpf.length > 0) {
      return res.status(400).json({ error: 'Este CPF já está registrado em nossa base.' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cadastrar
    const [result] = await db.query(
      'INSERT INTO users (name, cpf, birth_date, email, password) VALUES (?, ?, ?, ?, ?)',
      [name, encryptedCpf, birth_date, email, hashedPassword]
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
      { expiresIn: '2h' } // Token expira rapido por SecOps (SaaS)
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
    
    const user = users[0];
    user.cpf = decryptGraceful(user.cpf); // Descriptografa p/ o titular enxergar!
    
    res.json(user);
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

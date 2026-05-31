const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { GoogleGenAI } = require('@google/genai');

// Inicializa o SDK do Gemini usando a chave do .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Lista de modelos em ordem de prioridade (fallback automático)
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

// Função de espera (delay entre tentativas)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Motor de Resiliência: Tenta chamar a IA com retry e fallback de modelo
async function callGeminiWithRetry(params, maxRetries = 2) {
    let lastError = null;

    for (const model of MODELS) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`[IA] Tentativa ${attempt}/${maxRetries} com modelo: ${model}`);
                const response = await ai.models.generateContent({
                    ...params,
                    model: model,
                });
                console.log(`[IA] Sucesso com modelo: ${model}`);
                return response;
            } catch (error) {
                lastError = error;
                const status = error?.status || error?.error?.code;
                console.error(`[IA] Falha (tentativa ${attempt}) com ${model}: status=${status}, msg=${error.message}`);

                // Se for erro 503 (sobrecarga) ou 429 (rate limit), espera e tenta de novo
                if (status === 503 || status === 429) {
                    const waitTime = attempt * 2000; // 2s, 4s...
                    console.log(`[IA] Aguardando ${waitTime}ms antes de tentar novamente...`);
                    await sleep(waitTime);
                    continue;
                }

                // Se for outro tipo de erro (ex: 400, 401), não adianta tentar de novo
                break;
            }
        }
        console.log(`[IA] Modelo ${model} esgotado, tentando próximo fallback...`);
    }

    // Se chegou aqui, todos os modelos falharam
    throw lastError;
}

// ROTA 1: Extrator Mágico (Funcionalidade A) com Auto-Healing
// Usamos o authenticateToken para saber QUEM é o usuário logado (req.user.id)
router.post('/extract-recipe', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Texto da receita não fornecido.' });

        if (!process.env.GEMINI_API_KEY) {
            console.error('ERRO CRÍTICO: GEMINI_API_KEY não configurada no ambiente.');
            return res.status(500).json({ error: 'Configuração da IA ausente no servidor.' });
        }

        // 1. Engenharia de Prompt Avançada (O segredo do Sênior)
        const prompt = `
    Você é um chef executivo e engenheiro de dados. Extraia os ingredientes, quantidades e unidades do seguinte texto.
    Se o texto mencionar o nome da receita, inclua também.
    
    REGRA CRÍTICA DE CONVERSÃO CULINÁRIA:
    Você DEVE converter medidas caseiras (xícaras, colheres, pitadas, copos) para o sistema métrico (gramas ou ml) estimando o peso/volume padrão da culinária brasileira.
    Faça o cálculo matemático antes de retornar.
    Exemplos:
    - "1 xícara de farinha de trigo" = 120 g
    - "1 colher de sopa de manteiga" = 15 g
    - "2 colheres de achocolatado" = 20 g
    - "1 xícara de leite" = 240 ml
    - "meia xícara de óleo" = 120 ml
    NÃO use "un" para ingredientes que normalmente são pesados ou líquidos (farinha, açúcar, manteiga, leite, óleo). Use "un" APENAS para itens indivisíveis (ex: ovos, maçãs inteiras).

    Retorne ESTRITAMENTE em formato JSON:
    {
      "recipeName": "Nome da Receita (se houver, senão null)",
      "ingredients": [
        { "name": "Nome", "quantity": numero_decimal, "unit": "g, ml, un, kg ou l" }
      ]
    }
    Texto: """${text}"""
    `;

        // 2. Chamada Resiliente para o Gemini (com retry e fallback)
        const response = await callGeminiWithRetry({
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const aiData = JSON.parse(response.text);
        const userId = req.user.id;
        const processedIngredients = [];

        // 3. Lógica de Auto-Healing
        for (let item of aiData.ingredients) {
            // Tenta achar o ingrediente no banco deste usuário
            const [rows] = await pool.query(
                'SELECT id, name FROM ingredients WHERE user_id = ? AND name LIKE ?',
                [userId, `%${item.name}%`]
            );

            let ingredientId;
            if (rows.length > 0) {
                ingredientId = rows[0].id; // Achou! Usa o existente.
            } else {
                // Auto-Healing: Cria o ingrediente no banco automaticamente com custo Zero
                const [result] = await pool.query(
                    'INSERT INTO ingredients (user_id, name, unit, cost_per_unit) VALUES (?, ?, ?, ?)',
                    [userId, item.name, item.unit, 0]
                );
                ingredientId = result.insertId;
            }

            processedIngredients.push({
                ingredient_id: ingredientId,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit
            });
        }

        // 4. Devolve o pacote pronto para o React
        res.json({ recipeName: aiData.recipeName, ingredients: processedIngredients });

    } catch (error) {
        console.error('Erro na extração IA:', error);
        
        // Mensagem amigável para o usuário quando a IA está sobrecarregada
        const status = error?.status || error?.error?.code;
        if (status === 503 || status === 429) {
            return res.status(503).json({ 
                error: 'A IA está temporariamente sobrecarregada. Aguarde alguns segundos e tente novamente.' 
            });
        }
        
        res.status(500).json({ 
            error: 'Falha ao processar com IA.', 
            details: error.message || error.toString()
        });
    }
});

// ROTA 2: Chef Assistente - Modo de Preparo (Funcionalidade B)
router.post('/generate-instructions', authenticateToken, async (req, res) => {
    try {
        const { ingredientsList } = req.body;
        if (!ingredientsList || ingredientsList.length === 0) {
            return res.status(400).json({ error: 'Nenhum ingrediente fornecido.' });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('ERRO CRÍTICO: GEMINI_API_KEY não configurada no ambiente.');
            return res.status(500).json({ error: 'Configuração da IA ausente no servidor.' });
        }

        // Transforma a lista de objetos do React numa string legível para a IA
        const itemsStr = ingredientsList.map(i => `${i.quantity} ${i.used_unit || i.unit} de ${i.name}`).join(', ');

        const prompt = `
    Como um chef executivo, elabore um passo a passo profissional e direto de como preparar um prato utilizando ESTES ingredientes:
    ${itemsStr}
    
    Retorne apenas o texto do modo de preparo de forma numerada. Sem saudações.
    `;

        // Chamada Resiliente (com retry e fallback)
        const response = await callGeminiWithRetry({
            contents: prompt,
        });

        res.json({ instructions: response.text.trim() });

    } catch (error) {
        console.error('Erro na geração de instruções:', error);

        const status = error?.status || error?.error?.code;
        if (status === 503 || status === 429) {
            return res.status(503).json({ 
                error: 'A IA está temporariamente sobrecarregada. Aguarde alguns segundos e tente novamente.' 
            });
        }

        res.status(500).json({ 
            error: 'Falha ao gerar o modo de preparo.',
            details: error.message || error.toString()
        });
    }
});

module.exports = router;

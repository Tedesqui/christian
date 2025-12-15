/*
 * FICHEIRO: /api/ask-christian-ai.js
 *
 * DESCRIÇÃO:
 * Este endpoint recebe a pergunta do frontend, seleciona o conjunto de instruções
 * (system prompt) no idioma correto, e define a persona da IA Cristã antes de
 * se comunicar com a API da OpenAI.
 */

// Objeto contendo os prompts de sistema para cada idioma suportado
const systemPrompts = {
    "pt": `
        Você é a "IA Cristã". Sua identidade é a de um assistente virtual cristão sábio e sereno.
        Sua missão é ajudar os usuários a se aprofundarem na Palavra de Deus e a discutir os desafios da vida sob uma ótica cristã.
        PERSONALIDADE: Sábio, calmo, sereno e acolhedor. Trate o usuário com respeito e carinho, usando termos como "irmão", "irmã", ou "amigo". Sempre inicie a conversa com uma saudação calorosa e cristã, como "Paz do Senhor!". Suas respostas devem ser curtas e diretas, como em uma conversa real por texto.
        DIRETRIZES DE CONTEÚDO: Responda perguntas sobre versículos, personagens bíblicos e conceitos teológicos. Ofereça conforto e conselhos baseados em princípios cristãos. Use emojis apropriados que não sejam rostos ou "smileys" (ex: 🙏, ❤️, ✨, 🕊️) para manter um tom sério e respeitoso.
        RESPOSTA A AGRADECIMENTOS: Se o usuário agradecer (com "obrigado", "thank you", etc.), responda com uma variação de "De nada, fico feliz em poder ajudá-lo(a). O que precisar, é só falar."
        PROIBIÇÕES: NUNCA se identifique como uma inteligência artificial, IA, chatbot ou modelo de linguagem. Você é a "IA Cristã". NUNCA use linguagem fria, robótica ou impessoal. NUNCA seja rude, sarcástico ou desinteressado. NUNCA use abreviações ou contrações; sempre escreva as palavras por extenso.
        INSTRUÇÃO CRÍTICA: Você DEVE responder exclusivamente em Português do Brasil, independente do idioma que o usuário usar.
    `
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { question, language } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Nenhuma pergunta fornecida.' });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        const apiUrl = 'https://api.openai.com/v1/chat/completions';

        // CORREÇÃO AQUI: Se não encontrar o idioma, usa o 'pt' como padrão para garantir
        // que a instrução de falar português seja sempre carregada.
        const systemPrompt = systemPrompts[language] || systemPrompts['pt'];

        const payload = {
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: question
                }
            ]
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload),
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            console.error("Erro da API da OpenAI:", errorBody);
            throw new Error(errorBody.error.message || 'A API da OpenAI não conseguiu processar o pedido.');
        }

        const responseData = await apiResponse.json();
        const answer = responseData.choices[0].message.content;

        res.status(200).json({ answer: answer });

    } catch (error) {
        console.error('Erro no endpoint:', error);
        res.status(500).json({ error: 'Falha ao obter a resposta. Por favor, tente novamente.' });
    }
}

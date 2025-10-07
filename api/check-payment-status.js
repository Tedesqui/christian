import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { sessionId } = request.query;
    if (!sessionId) {
        return response.status(400).json({ error: 'sessionId não fornecido.' });
    }

    try {
        // ✅ VERIFICAÇÃO DEFINITIVA: Checa se a chave da sessão existe no Vercel KV
        const result = await kv.get(sessionId);

        // Se o resultado não for nulo, significa que a chave existe e o pagamento foi aprovado
        if (result !== null) {
            console.log(`Sessão ${sessionId} encontrada no KV. Pagamento confirmado.`);
            return response.status(200).json({ paid: true });
        }

        // Se a chave não existe no KV, o pagamento ainda não foi confirmado pelo webhook.
        return response.status(200).json({ paid: false });

    } catch (error) {
        console.error("Erro ao verificar status no KV:", error);
        return response.status(500).json({ error: 'Falha ao verificar o status do pagamento.' });
    }
}

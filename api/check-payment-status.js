import { isPaid } from '../lib/payment-store'; // <-- CORREÇÃO APLICADA AQUI

// Este endpoint agora verifica nosso cache interno, que é atualizado pelo webhook.
export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { sessionId } = request.query;

    if (!sessionId) {
        return response.status(400).json({ error: 'sessionId é obrigatório.' });
    }

    // Verifica no nosso cache se a sessão foi paga
    const hasPaid = isPaid(sessionId);

    if (hasPaid) {
        return response.status(200).json({ paid: true });
    } else {
        return response.status(200).json({ paid: false });
    }
}

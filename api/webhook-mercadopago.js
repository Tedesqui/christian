import { MercadoPagoConfig, Payment } from 'mercadopago';
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query } = request;
    const topic = query.topic || query.type;
    console.log('Webhook KV recebido!', { topic, id: query.id });

    if (topic === 'payment') {
        try {
            const paymentId = query.id;
            const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
            const client = new MercadoPagoConfig({ accessToken });
            const payment = new Payment(client);
            const paymentDetails = await payment.get({ id: paymentId });

            if (paymentDetails.status === 'approved') {
                const sessionId = paymentDetails.external_reference;
                
                // ✅ LÓGICA DEFINITIVA: Salva a sessão no Vercel KV
                // O '1' pode ser qualquer valor. Usamos a chave para verificar a existência.
                // 'ex: 600' define que a chave expira em 10 minutos para não sujar o banco.
                await kv.set(sessionId, 1, { ex: 600 });
                
                console.log(`Pagamento APROVADO e registrado no KV para a sessão: ${sessionId}`);
            }
        } catch (error) {
            console.error('Erro ao processar webhook KV:', error);
            return response.status(500).send('Erro interno');
        }
    }
    
    response.status(200).send('Webhook recebido');
}

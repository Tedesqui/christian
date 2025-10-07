import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { sessionId } = request.query;
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken || !sessionId) {
        return response.status(400).json({ error: 'Dados insuficientes.' });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    try {
        const searchResult = await payment.search({
            options: {
                external_reference: sessionId,
                sort: 'date_created',
                criteria: 'desc'
            }
        });

        if (searchResult.results && searchResult.results.length > 0) {
            if (searchResult.results[0].status === 'approved') {
                return response.status(200).json({ paid: true });
            }
        }
        return response.status(200).json({ paid: false });

    } catch (error) {
        console.error("Erro ao verificar status no Mercado Pago:", error);
        return response.status(500).json({ error: 'Falha ao verificar o status do pagamento.' });
    }
}

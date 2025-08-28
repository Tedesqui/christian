import { MercadoPagoConfig, Payment } from 'mercadopago';

// Este endpoint verifica o status de um pagamento específico.
export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { paymentId } = request.query;

    if (!paymentId) {
        return response.status(400).json({ error: 'Payment ID é obrigatório.' });
    }

    const client = new MercadoPagoConfig({ 
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
    });

    try {
        const payment = new Payment(client);
        const paymentDetails = await payment.get({ id: paymentId });
        
        return response.status(200).json({ status: paymentDetails.status });

    } catch (error) {
        console.error("Erro ao verificar status do pagamento:", error);
        return response.status(500).json({
            error: "Não foi possível verificar o status do pagamento.",
            details: error.message
        });
    }
}
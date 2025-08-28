import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';

// Este endpoint agora cria um pagamento PIX e retorna os dados para exibição no frontend.
export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const client = new MercadoPagoConfig({ 
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
    });

    try {
        const payment = new Payment(client);

        // Criamos um idempotency key para evitar pagamentos duplicados em caso de falha de rede.
        const idempotencyKey = crypto.randomUUID();

        const body = {
            transaction_amount: 14.90,
            description: 'Acesso Semanal - IA Cristã',
            payment_method_id: 'pix',
            payer: {
                email: `usuario_${Date.now()}@emailaleatorio.com`, // O e-mail é obrigatório pela API
            },
            notification_url: `https://${request.headers.host}/api/mercadopago-webhook`,
        };

        const result = await payment.create({ body }, { idempotencyKey });

        // Extraímos os dados essenciais para o frontend
        const responseData = {
            paymentId: result.id,
            qrCode: result.point_of_interaction.transaction_data.qr_code,
            qrCodeBase64: result.point_of_interaction.transaction_data.qr_code_base64,
        };
        
        return response.status(200).json(responseData);

    } catch (error) {
        console.error("Erro ao criar pagamento PIX no Mercado Pago:", error);
        return response.status(500).json({
            error: "Ocorreu um erro interno ao gerar o pagamento PIX.",
            details: error.message || error
        });
    }
}

import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';

// Este endpoint cria um pagamento PIX usando o e-mail e um sessionId (external_reference).
export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { sessionId, email } = request.body;
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken || !sessionId || !email) {
        return response.status(400).json({ error: 'Dados insuficientes (sessionId, email, accessToken).' });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    try {
        const idempotencyKey = crypto.randomUUID(); // Evita pagamentos duplicados

        const paymentData = {
            body: {
                transaction_amount: 14.90, // Preço correto para a IA Cristã
                description: 'Acesso Semanal - IA Cristã',
                payment_method_id: 'pix',
                external_reference: sessionId, // Vincula o pagamento à sessão do usuário
                payer: {
                    email: email,
                },
            }
        };

        const result = await payment.create(paymentData, { idempotencyKey });
        const pixData = result.point_of_interaction?.transaction_data;

        if (!pixData) {
            throw new Error("A API do Mercado Pago não retornou os dados do PIX.");
        }

        // Retorna os dados necessários para o frontend
        response.status(201).json({
            qrCode: pixData.qr_code,
            qrCodeBase64: pixData.qr_code_base64,
        });

    } catch (error) {
        console.error("Erro ao criar pagamento no Mercado Pago:", error);
        const errorMessage = error.cause?.api_response?.data?.message || error.message;
        response.status(500).json({
            error: 'Falha ao criar pagamento PIX.',
            details: errorMessage
        });
    }
}

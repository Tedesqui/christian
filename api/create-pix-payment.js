import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { sessionId, email } = request.body;
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken || !sessionId || !email) {
        return response.status(400).json({ error: 'Dados insuficientes.' });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    try {
        // ✅ 1. (OPCIONAL, MAS RECOMENDADO) DEFINA UMA DATA DE EXPIRAÇÃO
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 30); // QR Code expira em 30 minutos

        const idempotencyKey = crypto.randomUUID();
        const paymentData = {
            body: {
                transaction_amount: 1.00, // PREÇO CORRETO: R$ 19,90
                description: 'Acesso Semanal - IA Cristã',
                payment_method_id: 'pix',
                external_reference: sessionId,
                payer: {
                    email: email,
                },
                // ✅ 2. A LINHA QUE RESOLVE O PROBLEMA
                notification_url: `https://${request.headers.host}/api/webhook-mercado-pago`,
                date_of_expiration: expirationDate.toISOString().replace('Z', '-03:00'),
            }
        };

        const result = await payment.create(paymentData, { idempotencyKey });
        const pixData = result.point_of_interaction?.transaction_data;

        if (!pixData) {
            throw new Error("A API do Mercado Pago não retornou os dados do PIX.");
        }

        response.status(201).json({
            qrCode: pixData.qr_code,
            qrCodeBase64: pixData.qr_code_base64,
        });

    } catch (error) {
        console.error("Erro ao criar pagamento no Mercado Pago:", error);
        response.status(500).json({
            error: 'Falha ao criar pagamento PIX.',
            details: error.cause?.api_response?.data?.message || error.message
        });
    }
}

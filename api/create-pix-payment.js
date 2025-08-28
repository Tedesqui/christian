import mercadopago from 'mercadopago';

// Este endpoint lida exclusivamente com a criação de pagamentos PIX via Mercado Pago.

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Configura o SDK do Mercado Pago com sua chave de acesso.
    // Lembre-se de adicionar MERCADOPAGO_ACCESS_TOKEN às suas variáveis de ambiente.
    mercadopago.configure({
        access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });

    try {
        // O frontend verifica a presença de 'session_id' na URL para liberar o acesso.
        // Criamos um ID simples aqui para manter a compatibilidade com a lógica existente.
        const pseudoSessionId = `mp-success-${Date.now()}`;
        const successUrl = `https://${request.headers.host}?session_id=${pseudoSessionId}`;
        const cancelUrl = `https://${request.headers.host}`;

        const preference = {
            items: [
                {
                    title: 'Acesso Semanal - IA Cristã',
                    description: '7 dias de acesso para conversar com seu assistente de fé.',
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: 14.90,
                },
            ],
            // Especificamos que queremos apenas PIX, excluindo outros métodos.
            payment_methods: {
                default_payment_method_id: 'pix',
                excluded_payment_types: [
                    { id: "credit_card" },
                    { id: "debit_card" },
                    { id: "ticket" },
                    { id: "atm" }
                ],
                installments: 1,
            },
            back_urls: {
                success: successUrl,
                failure: cancelUrl,
                pending: cancelUrl,
            },
            auto_return: 'approved', // Redireciona automaticamente após o pagamento.
        };

        const result = await mercadopago.preferences.create(preference);
        
        // Retorna a URL de checkout do Mercado Pago para o frontend.
        return response.status(200).json({ checkoutUrl: result.body.init_point });

    } catch (error) {
        console.error("Erro ao criar preferência no Mercado Pago:", error);
        return response.status(500).json({
            error: "Ocorreu um erro interno no servidor ao processar o pagamento PIX.",
            details: error.message
        });
    }
}
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Este endpoint lida com a criação de pagamentos PIX usando a sintaxe do Mercado Pago SDK v2.

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 1. Inicializa o cliente do Mercado Pago com a sua chave de acesso.
    // Lembre-se de que a variável MERCADOPAGO_ACCESS_TOKEN deve estar configurada na Vercel.
    const client = new MercadoPagoConfig({ 
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
    });

    try {
        // O frontend verifica a presença de 'session_id' na URL para liberar o acesso.
        // Criamos um ID simples aqui para manter a compatibilidade com a lógica existente.
        const pseudoSessionId = `mp-success-${Date.now()}`;
        const successUrl = `https://${request.headers.host}?session_id=${pseudoSessionId}`;
        const cancelUrl = `https://${request.headers.host}`;

        // 2. Cria o corpo da preferência de pagamento.
        const preferenceBody = {
            items: [
                {
                    id: 'ia-crista-semanal',
                    title: 'Acesso Semanal - IA Cristã',
                    description: '7 dias de acesso para conversar com seu assistente de fé.',
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: 1.00,
                },
            ],
            payment_methods: {
                default_payment_method_id: 'pix',
                excluded_payment_types: [
                    { id: "credit_card" },
                    { id: "debit_card" },
                    { id: "ticket" },
                    { id: "atm" }
                ],
            },
            back_urls: {
                success: successUrl,
                failure: cancelUrl,
                pending: cancelUrl,
            },
            auto_return: 'approved',
        };
        
        // 3. Cria a preferência usando o cliente.
        const preference = new Preference(client);
        const result = await preference.create({ body: preferenceBody });
        
        // Retorna a URL de checkout (init_point) do Mercado Pago para o frontend.
        return response.status(200).json({ checkoutUrl: result.init_point });

    } catch (error) {
        console.error("Erro ao criar preferência no Mercado Pago:", error);
        return response.status(500).json({
            error: "Ocorreu um erro interno no servidor ao processar o pagamento PIX.",
            details: error.message
        });
    }
}

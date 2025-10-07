import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query } = request;
    const topic = query.topic || query.type;
    
    // Mostra no log do servidor que o Mercado Pago chamou o webhook
    console.log('Webhook do Mercado Pago recebido!', { topic, id: query.id });

    if (topic === 'payment') {
        try {
            const paymentId = query.id;
            const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
            const client = new MercadoPagoConfig({ accessToken });
            const payment = new Payment(client);

            const paymentDetails = await payment.get({ id: paymentId });

            console.log('Detalhes do Pagamento:', paymentDetails);

            // ✅ LÓGICA PRINCIPAL: Verifique se o pagamento foi aprovado
            if (paymentDetails.status === 'approved') {
                const sessionId = paymentDetails.external_reference;
                
                //
                // AQUI VEM A SUA LÓGICA DE NEGÓCIO
                // Exemplo: Salvar no banco de dados que a sessionId foi paga
                //
                // Ex: await marcarPedidoComoPago(sessionId);
                //
                console.log(`Pagamento APROVADO para a sessão: ${sessionId}`);
            }

        } catch (error) {
            console.error('Erro ao processar webhook do Mercado Pago:', error);
            // Retorna 500 para que o Mercado Pago tente novamente mais tarde
            return response.status(500).send('Erro interno');
        }
    }
    
    // Retorna 200 para confirmar ao Mercado Pago que a notificação foi recebida
    response.status(200).send('Webhook recebido');
}
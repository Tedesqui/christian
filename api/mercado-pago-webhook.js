import { MercadoPagoConfig, Payment } from 'mercadopago';
import { setPaid } from '../lib/payment-store'; // <-- CORREÇÃO APLICADA AQUI

export default async function handler(request, response) {
    // O webhook só aceita requisições POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    console.log("Webhook do Mercado Pago recebido!");

    const { body } = request;

    // O corpo da notificação geralmente tem um campo 'data' com o 'id' do pagamento
    const paymentId = body?.data?.id;

    if (body.type === 'payment' && paymentId) {
        console.log(`Notificação de pagamento recebida. ID: ${paymentId}`);
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        const client = new MercadoPagoConfig({ accessToken });
        const payment = new Payment(client);

        try {
            // Busca os detalhes completos do pagamento usando o ID
            const paymentInfo = await payment.get({ id: paymentId });
            console.log("Status do pagamento obtido:", paymentInfo.status);

            // Se o pagamento foi aprovado E tiver uma referência externa (nossa sessionId)...
            if (paymentInfo.status === 'approved' && paymentInfo.external_reference) {
                const sessionId = paymentInfo.external_reference;
                console.log(`Pagamento APROVADO para sessionId: ${sessionId}. Liberando acesso.`);
                
                // ATUALIZA NOSSO CACHE INTERNO!
                setPaid(sessionId);
            }
            // Responde ao Mercado Pago com status 200 para confirmar o recebimento
            return response.status(200).send('Webhook recebido com sucesso.');

        } catch (error) {
            console.error("Erro ao processar webhook:", error);
            // Avisa ao MP que algo deu errado, mas não revela detalhes
            return response.status(500).send('Erro interno no servidor.');
        }
    }

    // Se não for uma notificação de pagamento, apenas confirme o recebimento.
    return response.status(200).send('Notificação recebida.');
}

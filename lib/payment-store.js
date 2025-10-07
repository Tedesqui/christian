// Este é um cache simples, em memória, para armazenar o status dos pagamentos.
// Em um ambiente de produção real, o ideal seria usar um banco de dados (como Redis ou PostgreSQL).
// Mas para Vercel/Serverless e para resolver seu problema, isso funcionará.

const paidSessions = new Set();

export const setPaid = (sessionId) => {
    console.log(`[PaymentStore] Marcando sessão como paga: ${sessionId}`);
    paidSessions.add(sessionId);
};

export const isPaid = (sessionId) => {
    const status = paidSessions.has(sessionId);
    console.log(`[PaymentStore] Verificando sessão: ${sessionId}. Status: ${status}`);
    return status;
};
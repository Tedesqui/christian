export default function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Retorna a hora atual do servidor como um timestamp UNIX em milissegundos.
    response.status(200).json({ now: Date.now() });
}

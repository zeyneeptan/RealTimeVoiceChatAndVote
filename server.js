const WebSocket = require('ws');


const wss = new WebSocket.Server({ port: 8080 });

let voteHistory = [];
wss.on('connection', ws => {

    ws.send(JSON.stringify({ type: 'history', history: voteHistory }));

    ws.on('message', message => {
        const data = JSON.parse(message);

        if (data.type === 'vote') {
            const voteEntry = `${data.voteType.toUpperCase()} at ${data.timestamp}`;
            voteHistory.push(voteEntry);

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }
        else if (data.type === 'reset') {

            voteHistory = [];

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'reset' }));
                }
            });
        }
        else {
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });
});
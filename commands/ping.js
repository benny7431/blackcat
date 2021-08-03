module.exports = {
  name: "ping",
  description: "查看機器人延遲",
  register: true,
  slash: {
    name: "ping",
    description: "查看機器人延遲"
  },
  slashReply: true,
  async execute(message) {
    if (!message.slash) {
      let sent = await message.channel.send("Ping...").catch(console.error);
      let api = sent.createdTimestamp - message.createdTimestamp;
      sent.edit(`🏓 ┃ Pong! API:${api}ms WebSocket:${message.client.ws.ping}ms Database:...ms`).catch(console.error);
      let dbPing = await message.client.db.ping();
      sent.edit(`🏓 ┃ Pong! API:${api}ms WebSocket:${message.client.ws.ping}ms Database:${dbPing}ms`).catch(console.error);
    } else {
      let sent = await message.slash.send("Ping...").catch(console.error);
      let api = Date.now() - message.createdTimestamp;
      message.slash.edit(`🏓 ┃ Pong! API:${api}ms WebSocket:${message.client.ws.ping}ms Database:...ms`).catch(console.error);
      let dbPing = await message.client.db.ping();
      message.slash.edit(`🏓 ┃ Pong! API:${api}ms WebSocket:${message.client.ws.ping}ms Database:${dbPing}ms`).catch(console.error);
    }
  }
};
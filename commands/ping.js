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
    let sent = null;
    let timestamp = null;
    if (message.slash.raw) {
      await message.slash.send("Ping...");
      timestamp = Date.now();
    }
    else sent = await message.channel.send("Ping...").catch(console.error);
    let api = null;
    if (!timestamp) api = sent.createdTimestamp - message.createdTimestamp;
    else api = timestamp - message.createdTimestamp;
    let dbPing = await message.client.db.ping();
    if (message.slash.raw) return message.slash.edit(`🏓 ┃ Pong! API:${api}ms WebSocket:${message.client.ws.ping}ms`);
    else return sent.edit(`🏓 ┃ Pong! API:${api}ms WebSocket:${message.client.ws.ping}ms Database:${dbPing.average}ms`).catch(console.error);
  }
};
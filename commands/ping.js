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
    let sent = await message.channel.send("Ping...").catch(console.error);
    let api = sent.createdTimestamp - message.createdTimestamp;
    let dbPing = await message.client.db.ping();
    return sent.edit(`🏓 ┃ Pong! API:${api}ms WebSocket:${message.client.ws.ping}ms Database:${dbPing.average}ms`).catch(console.error);
  }
};
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
    await message.reply("Ping...").catch(console.error);
    let api = Date.now() - message.createdTimestamp;
    message.editReply(`🏓 ┃ Pong! API:${api}ms WebSocket:${message.client.ws.ping}ms Database:...ms`).catch(console.error);
    let dbPing = await message.client.db.ping();
    message.editReply(`🏓 ┃ Pong! API:${api}ms WebSocket:${message.client.ws.ping}ms Database:${dbPing.average}ms`).catch(console.error);
  }
};
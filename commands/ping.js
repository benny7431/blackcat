const { MessageEmbed } = require("discord.js");

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
    let player = message.client.players.get(message.guild.id);
    let embed = new MessageEmbed()
      .setTitle("🏓 ┃ 延遲");
    await message.reply({
      embeds: [embed]
    }).catch(console.error);
    embed.addField("🌐 ┃ 訊息延遲:", `${message.createdTimestamp - message.createdTimestamp}ms`, true);
    embed.addField("💓 ┃ WebSocket ACK:", `${message.client.ws.ping}ms`, true);
    message.editReply({
      embeds: [embed]
    }).catch(console.error);
    let dbPing = await message.client.db.ping();
    embed.addField("📂 ┃ 資料庫延遲:", `${dbPing.average}ms`, true);
    if (player) {
      let voicePing = player.ping;
      embed.addField("🎧 ┃ 語音延遲", 
        `${voicePing.ws ? `**WebSocket:** ${voicePing.ws}ms`: ""}\n` +
        `${voicePing.udp ? `**UDP:** ${voicePing.udp}ms` : ""}`, true);
    }
    message.editReply({
      embeds: [embed]
    }).catch(console.error);
  }
};
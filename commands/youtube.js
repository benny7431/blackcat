const { MessageEmbed } = require("discord.js");
const { MessageButton } = require("discord-buttons");

module.exports = {
  name: "youtube",
  description: "一起看YouTube",
  aliases: ["yt"],
  register: false,
  async execute(message) {
    if (!message.member.voice.channel) return message.channel.send("❌ ┃ 請加入一個語音頻道!");
    let embed = new MessageEmbed()
      .setColor("#5865F2")
      .setTitle("一起觀看YouTube")
      .setDescription("正在創建你的頻道...");
    let sent = await message.channel.send(embed);
    let invite = await message.client.together.createTogetherCode(message.member.voice.channelID, "youtube")
      .catch(error => {
        embed.setDescription("無法創建頻道!");
        return sent.edit({ embed });
      });
    let button = new MessageButton()
      .setStyle("url")
      .setLabel("點我加入")
      .setURL(invite.code);
    embed.setDescription("成功創建頻道!");
    return sent.edit({
      button,
      embed
    });
  }
};
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "youtube",
  description: "一起看YouTube",
  aliases: ["yt"],
  register: false,
  async execute(message) {
    if (!message.member.voice.channel) return message.channel.send("❌ ┃ 請加入一個語音頻道!")
      .catch(console.error);
    let embed = new MessageEmbed()
      .setColor("BLURPLE")
      .setTitle("一起觀看YouTube")
      .setDescription("正在創建你的頻道...");
    let sent = await message.channel.send({
      embeds: [embed]
    }).catch(console.error);
    let invite = await message.client.together.createTogetherCode(message.member.voice.channelID, "youtube")
      .catch(() => {
        embed.setDescription("無法創建頻道!");
        return sent.edit({
          embeds: [embed]
        }).catch(console.error);
      });
    let button = new MessageButton()
      .setStyle("LINK")
      .setLabel("點我加入")
      .setURL(invite.code);
    let component = new MessageActionRow()
      .addComponents(button);
    embed.setDescription("成功創建頻道!");
    return sent.edit({
      embeds: [embed],
      components: [component]
    }).catch(console.error);
  }
};
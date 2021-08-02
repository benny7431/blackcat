const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "snipe",
  description: "回復刪除的訊息",
  regsiter: false,
  async execute(message) {
    const embed = new MessageEmbed()
      .setTitle("回復訊息功能已經移除")
      .setDescription("為了保護用戶隱私權，我不會繼續保存被刪除後的訊息")
      .setColor("BLURPLE");
    return message.channel.send({
      embeds: [embed]
    });
  }
};
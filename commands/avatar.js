const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "avatar",
  description: "顯示你的頭貼",
  slashReply: true,
  execute(message) {
    let user = message.options.getUser("用戶") || message.user;
    const embed = new MessageEmbed()
      .setTitle(`🖼️ ┃ ${user.username}的頭貼`)
      .setImage(user.displayAvatarURL({
        dynamic: true,
        format: "png",
        size: 4096
      }))
      .setColor("BLURPLE");
    return message.reply({
      embeds: [embed]
    }).catch(console.error);
  }
};
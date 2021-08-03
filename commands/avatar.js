const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "avatar",
  description: "顯示你的頭貼",
  register: true,
  slash: {
    name: "avatar",
    description: "顯示你的頭貼"
  },
  slashReply: true,
  execute(message) {
    let user;
    if (message.slash.raw) user = message.author;
    else user = message.mentions.users.size >= 1 ? message.mentions.users.first() : message.author;
    const embed = new MessageEmbed()
      .setTitle(`🖼️ ┃ ${user.username}的頭貼`)
      .setImage(user.displayAvatarURL({
        dynamic: true,
        format: "png",
        size: 4096
      }))
      .setColor("BLURPLE");
    if (message.slash) return message.slash.send({
      embeds: [embed]
    }).catch(console.error)
    else return message.channel.send({
      embeds: [embed]
    }).catch(console.error);
  }
};
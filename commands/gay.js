const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "gay",
  description: "查看自己的Gay指數",
  regsiter: true,
  slash: {
    name: "gay",
    description: "查看自己的Gay指數"
  },
  slashReply: true,
  execute(message) {
    function getRandomNum(start, end) {
      return start + Math.random() * (end - start + 1);
    }

    const gay = Math.ceil(getRandomNum(1, 100));
    const gayPercent = Math.floor(gay / 10);
    const bar = ("🏳️‍🌈 ".repeat(gayPercent) + "❌ ".repeat(10 - gayPercent)).trim();

    if (!message.slash.raw) {
      if (message.mentions.members.size > 0) {
        const embed = new MessageEmbed()
          .setTitle(`${message.mentions.members.first().displayName}的Gay指數`)
          .setDescription(`🏳️‍🌈 ┃ ${message.mentions.members.first().displayName}的Gay指數是${gay}\n\n${bar}`)
          .setColor("BLURPLE");
        if (message.slash) return message.slash.send({
          embeds: [embed]
        }).catch(console.error)
        else return message.channel.send({
          embeds: [embed]
        }).catch(console.error);
      } else {
        const embed = new MessageEmbed()
          .setTitle(`${message.author.username}的Gay指數`)
          .setDescription(`🏳️‍🌈 ┃ 你的Gay指數是${gay}\n\n${bar}`)
          .setColor("BLURPLE");
        if (message.slash) return message.slash.send({
          embeds: [embed]
        }).catch(console.error)
        else return message.channel.send({
          embeds: [embed]
        }).catch(console.error);
      }
    } else {
      const embed = new MessageEmbed()
        .setTitle(`${message.author.username}的Gay指數`)
        .setDescription(`🏳️‍🌈 ┃ 你的Gay指數是${gay}\n\n${bar}`)
        .setColor("BLURPLE");
      if (message.slash) return message.slash.send({
        embeds: [embed]
      }).catch(console.error)
      else return message.channel.send({
        embeds: [embed]
      }).catch(console.error);
    }
  }
};
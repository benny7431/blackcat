const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "gay",
  description: "查看自己的Gay指數",
  execute(message) {
    function getRandomNum(start, end) {
      return start + Math.random() * (end - start + 1);
    }

    const gay = Math.ceil(getRandomNum(1, 100));
    const gayPercent = Math.floor(gay / 10);
    const bar = ("🏳️‍🌈 ".repeat(gayPercent) + "❌ ".repeat(10 - gayPercent)).trim();

    let name = message.options.getUser("用戶") ?? message.user;

    const embed = new MessageEmbed()
      .setTitle(`${name}的Gay指數`)
      .setDescription(`🏳️‍🌈 ┃ ${name.username}的Gay指數是${gay}\n\n${bar}`)
      .setColor("BLURPLE");
    message.reply({
      embeds: [embed]
    }).catch(console.error);
  }
};
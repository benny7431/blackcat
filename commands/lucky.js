const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "lucky",
  description: "查看自己的幸運指數",
  execute(message) {
    function getRandomNum(start, end) {
      return start + Math.random() * (end - start + 1);
    }

    const lucky = Math.ceil(getRandomNum(1, 100));
    const luckyPercent = Math.ceil(lucky / 10);
    const bar = ("🍀 ".repeat(luckyPercent) + "❌ ".repeat(10 - luckyPercent)).trim();
    const user = message.options.getUser("用戶") ?? message.user;

    const embed = new MessageEmbed()
      .setTitle(`${user.username}的幸運指數`)
      .setDescription(`🍀 ┃ 你的幸運指數是${lucky}\n\n${bar}`)
      .setColor("BLURPLE");
    return message.reply({
      embeds: [embed]
    }).catch(console.error);
  }
};
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "dice",
  description: "看看今天的運氣",
  async execute(message, args) {
    function getRandomNum(start, end) {
      return Math.floor(Math.random() * end) + start;
    }

    let side = args[0] ?? 6;

    const embed = new MessageEmbed()
      .setTitle("骰子!")
      .setDescription("🎲 ┃ 你得到了...")
      .setColor("BLURPLE");
    await message.reply({
      embeds: [embed]
    }).catch(console.error);
    embed.setDescription(`🎲 ┃ 你得到了${getRandomNum(1, parseInt(side))}!`);
    setTimeout(function() {
      message.editReply({
        embeds: [embed]
      }).catch(console.error);
    }, 2000);
  }
};
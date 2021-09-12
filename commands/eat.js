const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "eat",
  description: "吃東西...",
  async execute(message, args) {
    function getRandomNum(start, end) {
      return Math.floor(Math.random() * end) + start;
    }

    const response = [
      "還不錯",
      "好吃!!!",
      "嗯",
      "你來吃吃看",
      "難吃",
      "這是什麼?廚餘還是垃圾!",
      "你覺得勒，這種東西是人吃的嗎?",
      "還不錯啦...鹹了一點"
    ];
    let food = args.join(" ");

    const embed = new MessageEmbed()
      .setTitle("享用食物...")
      .setDescription(`🍽️ ┃ 正在吃${food}`)
      .setColor("BLURPLE");
    await message.reply({
      embeds: [embed]
    }).catch(console.error);
    const timeout = getRandomNum(2000, 10000);
    embed.setDescription(`🍽️ ┃ 對於${food}我的評價是:${response[getRandomNum(0, response.length)]}`);
    setTimeout(function() {
      message.editReply({
        embeds: [embed]
      });
    }, timeout);
  }
};
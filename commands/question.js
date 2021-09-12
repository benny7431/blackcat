const { MessageEmbed, MessageAttachment } = require("discord.js");

module.exports = {
  name: "question",
  description: "趣味問答",
  async execute(message, args) {
    const answer = [
      "可以啊",
      "應該可以",
      "不要吧",
      "我看見了失敗的光芒",
      "不能啦",
      "不知道...讓我想想看...",
      "_Black cat已離線_",
      "拒絕回答"
    ];
    const randomAnswer = answer[Math.floor(Math.random() * answer.length)];
    const question = args.join(" ");

    const embed = new MessageEmbed()
      .setTitle("問答!")
      .setDescription(`❓ ┃ ${question}的答案...`)
      .setColor("BLURPLE");
    await message.reply({
      embeds: [embed]
    }).catch(console.error);
    embed.setDescription(`❓ ┃ 對於${question}我的回答是${randomAnswer}`);
    setTimeout(() => {
      message.editReply({
        embeds: [embed]
      }).catch(console.error);
    }, 2000);
  }
};
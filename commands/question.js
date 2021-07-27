const { MessageEmbed, MessageAttachment } = require("discord.js");

module.exports = {
  name: "question",
  description: "趣味問答",
  register: true,
  slash: {
    name: "question",
    description: "趣味問答",
    options: [
      {
        name: "問題內容",
        description: "要詢問的問題",
        type: 3,
        required: true
      }
    ]
  },
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
    if (!args.length) {
      if (message.slash.raw) return message.slash.send("❌ ┃ 你要問我什麼呢?");
      else return message.channel.send("❌ ┃ 你要問我什麼呢?");
    }

    const embed = new MessageEmbed()
      .setTitle("問答!")
      .setDescription(`❓ ┃ ${question}的答案...`)
      .setColor("#5865F2");
    let sent = null;
    if (message.slash.raw) message.slash.sendEmbed(embed);
    else sent = await message.channel.send(embed);
    embed.setDescription(`❓ ┃ 對於${question}我的回答是${randomAnswer}`);
    setTimeout(function() {
      if (sent) sent.edit({ embed });
      else message.slash.editEmbed(embed);
    }, 2000);
  }
};
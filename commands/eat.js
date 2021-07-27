const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "eat",
  description: "吃東西...",
  register: true,
  slash: {
    name: "eat",
    description: "吃東西...",
    options: [
      {
        name: "要吃的東西",
        description: "你要給我吃的東西",
        type: 3,
        required: true
      }
    ]
  },
  slashReply: true,
  async execute(message, args) {
    function getRandomNum(start, end) {
      return Math.floor(Math.random() * end) + start;
    }

    if (!args.length) return message.channel.send("❌ ┃ 請輸入食物名稱!或是...標注一個人").catch(console.error);

    const respone = [
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
      .setColor("#5865F2");
    let sent;
    if (message.slash.raw) message.slash.sendEmbed(embed);
    else sent = await message.channel.send(embed).catch(console.error);
    const timeout = getRandomNum(2000, 10000);
    embed.setDescription(`🍽️ ┃ 對於${food}我的評價是:${respone[getRandomNum(0, respone.length)]}`);
    setTimeout(function() {
      if (sent) sent.edit({ embed }).catch(console.error);
      else message.slash.editEmbed(embed);
    }, timeout);
    return;
  }
};
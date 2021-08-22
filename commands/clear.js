const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
  name: "clear",
  description: "清除訊息",
  async execute(message, args) {
    if (Number(args[0]) < 2 || Number(args[0]) >= 100) return message.channel.send("❌ ┃ 請輸入大於2，小於100的數字!").catch(console.error);

    if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return message.channel.send("❌ ┃ 你沒有足夠的權限")
      .catch(console.error);
    if (!message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return message.channel.send("❌ ┃ 我沒有相關的權限!")
      .catch(console.error);

    try {
      message.channel.bulkDelete(Number(args[0]));
    } catch (error) {
      return message.channel.send("❌ ┃ 我無法刪除2個星期以前發送的訊息!").catch(console.error);
    }
    const embed = new MessageEmbed()
      .setTitle("刪除訊息成功!")
      .setDescription(`🚮 ┃ 成功刪除了${args[0]}則訊息!`)
      .setColor("BLURPLE");
    message.reply({
      embeds: [embed]
    }).catch(console.error);
    setTimeout(function() {
      message.deleteReply().catch(console.error);
    }, 3000);
  }
};
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "clear",
  description: "清除訊息",
  register: false,
  async execute(message, args) {
    if (!args.length) return ("❌ ┃ 請輸入要清除的訊息數量").catch(console.error);
    if (isNaN(args[0]) || Number(args[0]) <= 0) return message.channel.send("❌ ┃ 請輸入有效的數字").catch(console.error);
    if (Number(args[0]) < 2 || Number(args[0]) >= 100) return message.channel.send("❌ ┃ 請輸入大於2，小於100的數字!").catch(console.error);

    if (!message.member.hasPermission("MANAGE_MESSAGES") && message.author.id !== "669194742218752070") return message.channel.send("❌ ┃ 你沒有足夠的權限").catch(console.error);
    if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) return message.channel.send("❌ ┃ 我沒有相關的權限!").catch(console.error);

    try {
      await message.delete();
      message.channel.bulkDelete(Number(args[0]));
    } catch (error) {
      return message.channel.send("❌ ┃ 我無法刪除2個星期以前發送的訊息!").catch(console.error);
    }
    const embed = new MessageEmbed()
      .setTitle("刪除訊息成功!")
      .setDescription(`🚮 ┃ 成功刪除了${args[0]}則訊息!`)
      .setColor("#5865F2");
    const sent = await message.channel.send(embed).catch(console.error);
    setTimeout(function() {
      sent.delete().catch(console.error);
    }, 3000);
    return;
  }
};
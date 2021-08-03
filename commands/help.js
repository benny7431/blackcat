const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "顯示所有指令和指令的詳細資料",
  register: true,
  slash: {
    name: "help",
    description: "顯示所有指令和指令的詳細資料",
  },
  slashReply: true,
  execute(message) {
    const helpEmbed = new MessageEmbed()
      .setTitle("Black cat幫助! ⊂((・▽・))⊃")
      .setDescription("Black cat提供 **音樂/遊戲/工具**的指令喔")
      .addField("\u200B", "使用`b.commands`來查看指令", false)
      .setColor("BLURPLE");
    let discordBtn = new MessageButton()
      .setLabel("加入支援伺服器")
      .setStyle("LINK")
      .setURL("https://blackcatbot.tk/discord");
    let inviteBtn = new MessageButton()
      .setLabel("邀請機器人")
      .setStyle("LINK")
      .setURL("https://blackcatbot.tk/blackcat");
    let buttonRow = new MessageActionRow()
      .addComponents(discordBtn, inviteBtn);
    if (message.slash) return message.slash.send({
      embeds: [helpEmbed],
      components: [buttonRow]
    }).catch(console.error);
    else return message.channel.send({
      embeds: [helpEmbed],
      components: [buttonRow]
    }).catch(console.error);
  }
};
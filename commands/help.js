const { MessageEmbed } = require("discord.js");
const { MessageButton } = require("discord-buttons");

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
      .setColor("#5865F2");
    let discordBtn = new MessageButton()
      .setLabel("加入支援伺服器")
      .setStyle("url")
      .setURL("https://blackcatbot.tk/discord");
    let inviteBtn = new MessageButton()
      .setLabel("邀請機器人")
      .setStyle("url")
      .setURL("https://blackcatbot.tk/blackcat");
    if (message.slash.raw) {
      helpEmbed.addField("\u200B",
        "[➕ 加入支援伺服器](https://blackcatbot.tk/discord)\n\n" +
        "[➕ 再邀請一次機器人](https://blackcatbot.tk/blackcat)");
      return message.slash.sendEmbed(helpEmbed);
    } else return message.channel.send({
      embed: helpEmbed,
      buttons: [inviteBtn, discordBtn]
    }).catch(console.error);
  }
};
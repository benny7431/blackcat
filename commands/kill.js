const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "kill",
  description: "殺一個人",
  register: false,
  execute(message, args) {
    if (!args.length) return message.channel.send("❌ ┃ 請輸入名稱或者Tag一個人!");
    if (message.mentions.members.size >= 1) {
      if (message.mentions.members.first().id === message.author.id) return message.channel.send("❌ ┃ 請尊重生命，不要自殺...").catch(console.error);
      else if (message.mentions.members.first().id === "848006097197334568") return message.channel.send("❌ ┃ 你不能殺掉我!!!").catch(console.error);
      else if (message.mentions.members.first().id === "669194742218752070") return message.channel.send("❌ ┃ 你不能殺掉開發者!!!").catch(console.error);
    }
    const embed = new MessageEmbed()
      .setTitle(`${message.author.username}殺了${message.mentions.members.size >= 1 ? message.mentions.members.first().displayName : args.join(" ")}`)
      .setDescription(`${args.join(" ")}請安息`)
      .setColor("BLURPLE");
    return message.channel.send(embed).catch(console.error);
  }
};
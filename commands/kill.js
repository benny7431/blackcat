const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "kill",
  description: "殺一個人",
  register: false,
  execute(message, args) {
    let user = message.options.getUser("用戶");
    if (user.id === "848006097197334568") return message.channel.send("❌ ┃ 你不能殺掉我!!!")
      .catch(console.error);
    else if (user.id === "669194742218752070") return message.channel.send("❌ ┃ 你不能殺掉開發者!!!")
      .catch(console.error);
    const embed = new MessageEmbed()
      .setTitle(`${message.author.username}殺了${user.username}`)
      .setDescription(`<@${user.id}>請安息`)
      .setColor("BLURPLE");
    return message.channel.send({
      embeds: [embed]
    })
      .catch(console.error);
  }
};
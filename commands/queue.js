const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "queue",
  aliases: ["q"],
  description: "顯示播放清單",
  register: true,
  slash: {
    name: "queue",
    description: "顯示播放清單",
  },
  slashReply: false,
  async execute(message) {
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send("❌ ┃ 目前沒有任何歌曲正在播放!").catch(console.error);
    let currentPage = 0;
    const embeds = generateQueueEmbed(message, serverQueue.songs);
    const queueEmbed = await message.channel.send({
      content: `📘 ┃ 目前頁面:${currentPage + 1}/${embeds.length}`,
      embeds: [currentPage]
    });
    await queueEmbed.react("<:left:828163434674651136>");
    await queueEmbed.react("<:cancel_fill:828163722253041674>");
    await queueEmbed.react("<:right:828163370603118622>");

    const filter = (reaction, user) => ["left", "cancel_fill", "right"].includes(reaction.emoji.name) && user.id === message.author.id;
    try {
      let collector = queueEmbed.createReactionCollector({
        filter,
        time: 60000,
        errors: ["time"]
      });

      collector.on("collect", async (reaction) => {
        if (reaction.emoji.name === "right") {
          if (currentPage < embeds.length - 1) {
            currentPage++;
            queueEmbed.edit(`📘 ┃ 目前頁面:${currentPage + 1}/${embeds.length}`, embeds[currentPage]);
            await reaction.users.remove(message.author.id);
          } else {
            await reaction.users.remove(message.author.id);
          }
        } else if (reaction.emoji.name === "left") {
          if (currentPage !== 0) {
            --currentPage;
            queueEmbed.edit(`📘 ┃ 目前頁面:${currentPage + 1}/${embeds.length}`, embeds[currentPage]);
            await reaction.users.remove(message.author.id);
          } else {
            await reaction.users.remove(message.author.id);
          }
        } else if (reaction.emoji.name === "cancel_fill") {
          collector.stop();
          queueEmbed.delete();
        } else {
          await reaction.users.remove(message.author.id);
        }
      });

      collector.on("end", () => {
        queueEmbed.delete().catch(console.error);
      });
    } catch (e) {
      queueEmbed.delete().catch(console.error);
    }
  }
};

function generateQueueEmbed(message, queue) {
  const embeds = [];
  let k = 10;
  for (let i = 0; i < queue.length; i += 10) {
    const current = queue.slice(i, k);
    let j = i;
    k += 10;
    const info = current.map((track) => `${++j} - [${track.title}](${track.url})`).join("\n");
    const embed = new MessageEmbed()
      .setTitle("播放清單")
      .setColor("BLURPLE")
      .setDescription(`**正在播放 - [${queue[0].title}](${queue[0].url})**\n\n${info}`)
      .setTimestamp();
    embeds.push(embed);
  }
  return embeds;
}
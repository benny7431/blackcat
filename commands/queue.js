const {
  InteractionCollector,
  MessageEmbed,
  MessageButton,
  MessageActionRow
} = require("discord.js");

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
    const serverQueue = message.client.players.get(message.guild.id);
    if (!serverQueue) return message.channel.send("❌ ┃ 目前沒有任何歌曲正在播放!")
      .catch(console.error);
    let currentPage = 0;
    let prevBtn = new MessageButton()
      .setCustomId("left")
      .setLabel("上一頁")
      .setEmoji("828163434674651136")
      .setStyle("PRIMARY")
      .setDisabled(true);
    let nextBtn = new MessageButton()
      .setCustomId("right")
      .setLabel("下一頁")
      .setEmoji("828163370603118622")
      .setStyle("PRIMARY");
    let cancelBtn = new MessageButton()
      .setCustomId("cancel")
      .setLabel("取消")
      .setEmoji("828163722253041674")
      .setStyle("DANGER");
    let btnRow = new MessageActionRow()
      .addComponents(prevBtn, cancelBtn, nextBtn);
    const embeds = [];
    let k = 10;
    let songList = serverQueue.songs;
    for (let i = 0; i < songList.length; i += 10) {
      const current = songList.slice(i, k);
      let j = i;
      k += 10;
      let info = current.map((track) => `${++j} - [${track.title}](${track.url})`).join("\n");
      let embed = new MessageEmbed()
        .setTitle("播放清單")
        .setColor("BLURPLE")
        .setDescription(`**正在播放 - [${songList[0].title}](${songList[0].url})**\n\n${info}`)
        .setFooter("閒置15秒鐘後此訊息會自動關閉");
      embeds.push(embed);
    }

    let sent = await message.reply({
      content: `📘 ┃ 目前頁面:${currentPage + 1}/${embeds.length}`,
      embeds: [embeds[currentPage]],
      components: [btnRow]
    });

    let filter = (interaction) => interaction.user.id === message.user.id;
    let collector = new InteractionCollector(message.client, {
      message: sent,
      interactionType: "MESSAGE_COMPONENT",
      filter,
      idle: 15000
    });

    collector.on("collect", async (interaction) => {
      switch (interaction.customId) {
      case "right":
        if (currentPage < embeds.length - 1) {
          currentPage++;
          interaction.update({
            content: `📘 ┃ 目前頁面:${currentPage + 1}/${embeds.length}`,
            embeds: embeds[currentPage]
          });
        }
        break;
      case "left":
        if (currentPage !== 0) {
          --currentPage;
          interaction.update({
            content: `📘 ┃ 目前頁面:${currentPage + 1}/${embeds.length}`,
            embeds: embeds[currentPage]
          });
        }
        break;
      case "cancel" :
        collector.end();
        break;
      }
    });

    collector.on("end", () => {
      let embed = new MessageEmbed()
        .setTitle("已關閉，再次重新輸入指令以重新開啟")
        .setColor("RED");
      message.editReply({
        embeds: [embed]
      });
    });
  }
};
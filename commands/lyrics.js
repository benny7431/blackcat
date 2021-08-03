const { MessageEmbed } = require("discord.js");
const lyricsFinder = require("lyrics-finder");

module.exports = {
  name: "lyrics",
  aliases: ["ly"],
  description: "取得目前正在播放的歌曲歌詞",
  register: true,
  slash: {
    name: "lyrics",
    description: "取得目前正在播放或給予的歌曲歌詞",
    options: [
      {
        name: "歌曲名稱",
        description: "要搜尋歌詞的音樂名稱",
        type: "STRING",
        required: false,
      }
    ]
  },
  slashReply: true,
  async execute(message, args) {
    const queue = message.client.queue.get(message.guild.id);
    if (!(queue || args.length || queue.songs.length)) {
      if (message.slash.raw) return message.slash.send("❌ ┃ 目前沒有任何音樂正在播放!");
      return message.channel.send("❌ ┃ 目前沒有任何音樂正在播放!").catch(console.error);

    }
    const songtitle = !args.length ? queue.songs[0].title : args.join(" ");
    let lyrics = null;
    var lyricsEmbed = new MessageEmbed()
      .setTitle(`📃 ┃ ${songtitle}歌詞`)
      .setDescription("🔄 ┃ 正在尋找歌詞...")
      .setColor("BLURPLE");
    let sent = null;
    if (message.slash) message.slash.send({
      embeds: [lyricsEmbed]
    }).catch(console.error)
    else sent = message.channel.send({
      embeds: [lyricsEmbed]
    }).catch(console.error);

    try {
      lyrics = await lyricsFinder(songtitle, "");
      if (!lyrics) lyrics = "❌ ┃ 沒有問到歌詞...";
    } catch (error) {
      lyrics = "❌ ┃ 沒有問到歌詞...";
    }
    lyricsEmbed.setDescription(lyrics);

    if (lyricsEmbed.description.length > 2048)
      lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2000)}...`;
    if (sent) sent.edit({
        embeds: [lyricsEmbed]
      })
      .catch(console.error);
    else message.slash.edit({
        embeds: [lyricsEmbed]
      })
      .catch(console.error)
  }
};
const { MessageEmbed } = require("discord.js");
const lyricsFinder = require("lyrics-finder");

module.exports = {
  name: "lyrics",
  aliases: ["ly"],
  description: "取得目前正在播放的歌曲歌詞",
  async execute(message, args) {
    const queue = message.client.players.get(message.guild.id);
    if (!queue) {
      return message.reply("❌ ┃ 目前沒有任何音樂正在播放!");
    }
    const songtitle = !args.length ? queue.songs[0].title : args.join(" ");
    let lyrics = null;
    let lyricsEmbed = new MessageEmbed()
      .setTitle(`📃 ┃ ${songtitle}歌詞`)
      .setDescription("🔄 ┃ 正在尋找歌詞...")
      .setColor("BLURPLE");
    await message.reply({
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
    message.editReply({
      embeds: [lyricsEmbed]
    }).catch(console.error);
  }
};
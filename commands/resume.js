const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "resume",
  aliases: ["r"],
  description: "繼續播放被暫停的歌曲",
  execute(message) {
    const queue = message.client.players.get(message.guild.id);
    if (!queue) {
      if (message.slash) message.slash.send("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
      return message.channel.send("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) {
      return message.reply("❌ ┃ 你必須跟我在同一個頻道裡!")
        .catch(console.error);
    }

    if (!queue.playing) {
      queue.resume();
      return message.reply("<:play:827734196243398668> ┃ 繼續播放歌曲")
        .catch(console.error);
    }

    return message.reply("❌ ┃ 歌曲已經在播放了")
      .catch(console.error);
  }
};
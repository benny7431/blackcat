const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "shuffle",
  description: "隨機播放目前在播放清單裡的歌曲",
  execute(message) {
    const queue = message.client.players.get(message.guild.id);
    if (!queue) {
      message.reply("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) {
      return message.reply("❌ ┃ 你必須跟我在同一個頻道裡!")
        .catch(console.error);
    }

    let songs = queue.songs;
    for (let i = songs.length - 1; i > 1; i--) {
      let j = 1 + Math.floor(Math.random() * i);
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    queue.songs = songs;
    message.client.players.set(message.guild.id, queue);
    message.reply("🔀 ┃ 隨機排序播放清單")
      .catch(console.error);
  }
};
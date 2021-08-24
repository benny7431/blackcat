const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "pause",
  description: "暫停歌曲",
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

    if (queue.playing) {
      queue.pause();
      return message.reply("<:pause:827737900359745586> ┃ 歌曲已暫停")
        .catch(console.error);
    } else {
      return message.reply("❌ ┃ 歌曲已經暫停了(･ัω･ั)").catch(console.error);
    }
  }
};
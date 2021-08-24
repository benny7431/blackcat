const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "repeat",
  description: "重複歌曲",
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

    queue.toggleRepeat();
    return message.reply(`${queue.repeat ? "🔂 ┃ " : ""}重複播放目前為 ${queue.repeat ? "啟動  將會重複目前的歌曲!" : "關閉"}!`)
      .catch(console.error);
  }
};
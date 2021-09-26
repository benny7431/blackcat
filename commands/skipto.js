const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "skipto",
  aliases: ["st"],
  description: "跳到指定的歌曲",
  execute(message, args) {
    if (isNaN(args[0])) return message.reply("❌ ┃ 請輸入歌曲代碼")
      .catch(console.error);

    const queue = message.client.players.get(message.guild.id);
    if (!queue) {
      message.reply("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) {
      return message.reply("❌ ┃ 你必須跟我在同一個頻道裡!")
        .catch(console.error);
    }

    if (args[0] > queue.songs.length) {
      return message.reply(`❌ ┃ 播放清單只有 ${queue.songs.length} 首歌!`)
        .catch(console.error);
    }

    if (queue.loop) {
      for (let i = 0; i < args[0] - 2; i++) {
        queue.songs.push(queue.songs.shift());
      }
    } else {
      queue.songs = queue.songs.slice(args[0] - 2);
    }
    queue.skip();
    return message.reply(`<:skip:827734282318905355> ┃ 跳到第 ${args[0]} 首歌曲`)
      .catch(console.error);
  }
};
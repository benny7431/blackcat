const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "remove",
  description: "移除在播放清單裡的歌曲",
  execute(message, args) {
    const queue = message.client.players.get(message.guild.id);
    if (!queue) {
      message.reply("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) {
      return message.reply("❌ ┃ 你必須跟我在同一個頻道裡!")
        .catch(console.error);
    }

    if (Number(args[0]) > queue.songs.length) return message.channel.send(`❌ ┃ 請輸入1 ~ ${queue.songs.length}的數字!`);

    const song = queue.songs.splice(args[0] - 1, 1);
    return message.reply(`<:music_remove:827734952451899412> ┃ 從播放清單移除了 ${song[0].title}`)
      .catch(console.error);
  }
};
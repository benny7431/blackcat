const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "volume",
  aliases: ["vol"],
  description: "變更或查看目前的音量",
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

    if (!args[0]) {
      return message.reply(`<:vol_up:827734772889157722> ┃ 目前的音量是: ${queue.volume}%`)
        .catch(console.error);
    }
    if (parseInt(args[0]) > 100 || parseInt(args[0]) < 0) {
      message.reply("❌ ┃ 請輸入 0 ~ 100 之間的數字!")
        .catch(console.error);
    }

    queue.setVolume(parseInt(args[0]));

    message.reply(`<:vol_up:827734772889157722> ┃ 設定音量至: ${args[0]}%`)
      .catch(console.error);
  }
};
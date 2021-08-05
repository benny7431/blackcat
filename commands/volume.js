const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "volume",
  aliases: ["vol"],
  description: "變更或查看目前的音量",
  register: true,
  slash: {
    name: "volume",
    description: "變更或查看目前的音量",
    options: [
      {
        name: "音量",
        description: "要變更的音量",
        type: "INTEGER",
        required: false,
      }
    ]
  },
  slashReply: true,
  execute(message, args) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) {
      if (message.slash) message.slash.send("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
      return message.channel.send("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) {
      if (message.slash) return message.slash
        .send("❌ ┃ 你必須跟我在同一個頻道裡!")
        .catch(console.error);
      else return message.channel
        .send("❌ ┃ 你必須跟我在同一個頻道裡!")
        .catch(console.error);
    }

    if (!args[0]) {
      if(message.slash) return message.slash.send(`<:vol_up:827734772889157722> ┃ 目前的音量是: ${queue.volume}%`)
        .catch(console.error);
      else return message.channel.send(`<:vol_up:827734772889157722> ┃ 目前的音量是: ${queue.volume}%`)
        .catch(console.error);
    }
    if (isNaN(args[0])) {
      if(message.slash) return message.slash.send("❌ ┃ 請使用一個數字來變更音量")
        .catch(console.error);
      else return message.channel.send("❌ ┃ 請使用一個數字來變更音量")
        .catch(console.error);
    }
    if (parseInt(args[0]) > 100 || parseInt(args[0]) < 0) {
      if (message.slash) message.slash.send("❌ ┃ 請輸入 0 ~ 100 之間的數字!")
        .catch(console.error);
      else message.channel.send("❌ ┃ 請輸入 0 ~ 100 之間的數字!").catch(console.error);
    }

    queue.setVolume(args[0]);

    if(message.slash) message.slash.send(`<:vol_up:827734772889157722> ┃ 設定音量至: ${args[0]}%`)
      .catch(console.error);
    else return message.channel.send(`<:vol_up:827734772889157722> ┃ 設定音量至: ${args[0]}%`)
      .catch(console.error);
  }
};
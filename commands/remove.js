const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "remove",
  description: "移除在播放清單裡的歌曲",
  register: true,
  slash: {
    name: "remove",
    description: "移除在播放清單裡的歌曲",
    options: [
      {
        name: "歌曲編號",
        description: "在播放清單中的歌曲編號",
        type: 4,
        required: true,
      }
    ]
  },
  slashReply: true,
  execute(message, args) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) {
      if (message.slash.raw) return message.slash.send("❌ ┃ 目前沒有任何歌曲正在播放!");
      else return message.channel.send("❌ ┃ 目前沒有任何歌曲正在播放!").catch(console.error);
    }
    if (!canModifyQueue(message.member)) return;

    if (!args.length) {
      if (message.slash.raw) return message.cannel.send("❌ ┃ 請輸入歌曲代號");
      else return message.channel.send("❌ ┃ 請輸入歌曲代號");
    }
    if (isNaN(args[0])) {
      if (message.slash.raw) return message.slash.send("❌ ┃ 請輸入歌曲代號");
      else return message.channel.send("❌ ┃ 請輸入歌曲代號");
    }
    if (Number(args[0]) > queue.songs.length) {
      if (message.slash.raw) return message.slash.send(`❌ ┃ 請輸入1 ~ ${queue.songs.length}的數字!`);
      else return message.channel.send(`❌ ┃ 請輸入1 ~ ${queue.songs.length}的數字!`);
    }

    const song = queue.songs.splice(args[0] - 1, 1);
    if (message.slash.raw) return message.slash.send(`<:music_remove:827734952451899412> ┃ 從播放清單移除了 ${song[0].title}`);
    else return queue.textChannel.send(`<:music_remove:827734952451899412> ┃ 從播放清單移除了 ${song[0].title}`);
  }
};
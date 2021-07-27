module.exports = {
  name: "save",
  description: "儲存播放清單",
  register: false,
  async execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.channel.send("❌ ┃ 目前沒有歌曲正在播放!");

    let songs = [];
    let sent = await message.channel.send("<:upload:833246000818552852> ┃ 正在上傳歌曲清單...");
    queue.songs.forEach(song => {
      songs.push({
        title: song.title,
        url: song.url,
        thumbnail: song.thumbnail,
        by: message.author.username
      });
    });
    try {
      await message.client.db.set(`stored.${message.author.id}`, songs);
      message.client.log(message, "Store queue", false, "info");
    } catch (e) {
      console.log(e);
      return sent.edit("❌ ┃ 儲存時發生錯誤");
    }
    sent.edit(`<:uploaded:833261675511021588> ┃ 上傳成功, 可使用\`b.load\`或是\`b.load ${message.author.id}\`來讀取清單!`);
  }
};
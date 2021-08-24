module.exports = {
  name: "save",
  description: "儲存播放清單",
  register: false,
  async execute(message) {
    const queue = message.client.players.get(message.guild.id);
    if (!queue) return message.reply("❌ ┃ 目前沒有歌曲正在播放!")
      .catch(console.error);

    let songs = [];
    message.reply("<:upload:833246000818552852> ┃ 正在上傳歌曲清單...").catch(console.error);
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
      message.client.log("Store queue");
    } catch (e) {
      console.log(e);
      return message.editReply("❌ ┃ 儲存時發生錯誤").catch(console.error);
    }
    message.editReply(`<:uploaded:833261675511021588> ┃ 上傳成功, 可使用\`b.load\`或是\`b.load ${message.author.id}\`來讀取清單!`);
  }
};
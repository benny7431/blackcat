const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "commands",
  description: "指令列表",
  execute(message, args) {
    let embed = null;
    if (!args.length) {
      embed = new MessageEmbed()
        .setTitle("指令列表")
        .setDescription(
          "`/commands music` 音樂指令\n" +
          "`/commands game` 遊戲指令\n" +
          "`/commands util` 工具指令\n" +
          "`/commands other` 其他指令")
        .setColor("BLURPLE");
      return message.reply({
        embeds: [embed]
      }).catch(console.error);
    }
    if (args[0] === "music") {
      embed = new MessageEmbed()
        .setTitle("音樂指令")
        .setDescription(
          "`/play` 播放Youtube的歌曲\n" +
          "`/radio` 連結到線上電台\n" +
          "`/search` 搜尋影片來播放\n" +
          "`/playlist` 播放Youtube的播放清單\n" +
          "`/pause` 暫停歌曲\n" +
          "`/resume` 繼續播放被暫停的歌曲\n" +
          "`/skip` 跳過歌曲\n" +
          "`/nowplaying` 顯示目前正在播放的歌曲\n" +
          "`/filter` 變更音樂等化器\n" +
          "`/loop` 重複歌單\n" +
          "`/repeat` 重複歌曲\n" +
          "`/lyrics [歌曲名稱]` 取得目前正在播放歌曲的歌詞\n" +
          "`/queue` 顯示播放清單\n" +
          "`/remove` 移除在播放清單裡的歌曲\n" +
          "`/shuffle` 隨機排序播放清單\n" +
          "`/skipto` 跳到指定的歌曲\n" +
          "`/volume` 變更或查看目前的音量\n" +
          "`/save` 儲存歌單\n" +
          "`/load` 讀取歌單")
        .setColor("BLURPLE");
    } else if (args[0] === "game") {
      embed = new MessageEmbed()
        .setTitle("遊戲指令")
        .setDescription(
          "`/dice` 骰子!\n" +
          "`/eat` 讓Black cat吃東西\n" +
          "`/kill` 殺人!!!\n" +
          "`/lucky` 查看幸運指數\n" +
          "`/question` 讓Black cat幫你選擇")
        .setColor("BLURPLE");
    } else if (args[0] === "util") {
      embed = new MessageEmbed()
        .setTitle("工具指令")
        .setDescription(
          "`/kick` 踢出一個成員\n" +
          "`/ban` 封鎖成員\n" +
          "`/clear` 清除訊息\n" +
          "`/avatar` 查看你的頭貼")
        .setColor("BLURPLE");
    } else if (args[0] === "other") {
      embed = new MessageEmbed()
        .setTitle("其他指令")
        .setDescription(
          "`/help` 顯示所有的指令\n" +
          "`/ping` 查看機器人延遲\n" +
          "`/status` 查看現在機器人的狀態\n" +
          "`/support` 取得支援")
        .setColor("BLURPLE");
    } else {
      return message.channel.send("❌ ┃ 請輸入正確的指令類別!")
        .catch(console.error);
    }
    return message.reply({
      embeds: [embed]
    }).catch(console.error);
  }
};
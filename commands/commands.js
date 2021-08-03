const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "commands",
  description: "指令列表",
  register: true,
  slash: {
    name: "commands",
    description: "指令列表",
    options: [
      {
        name: "指令類別",
        description: "要查看的指令類別",
        type: "STRING",
        required: true,
        choices: [
          {
            name: "音樂指令",
            value: "music"
          }, {
            name: "遊戲指令",
            value: "game"
          }, {
            name: "工具指令",
            value: "util"
          }, {
            name: "其他指令",
            value: "other"
          }
        ]
      }
    ]
  },
  slashReply: true,
  execute(message, args) {
    let embed = null;
    if (!args.length) {
      embed = new MessageEmbed()
        .setTitle("指令列表")
        .setDescription(
          "`b.commands music` 音樂指令\n" +
          "`b.commands game` 遊戲指令\n" +
          "`b.commands util` 工具指令\n" +
          "`b.commands other` 其他指令")
        .setColor("BLURPLE");
      if (message.slash) return message.slash.send({
        embeds: [embed]
      }).catch(console.error)
      else return message.channel.send({
        embeds: [embed]
      }).catch(console.error);
    }
    if (args[0] === "music") {
      embed = new MessageEmbed()
        .setTitle("音樂指令")
        .setDescription(
          "`b.play/b.p <歌曲名稱/網址>` 播放Youtube的歌曲\n" +
          "`b.radio <kpop/jpop>` 連結到線上電台\n" +
          "`b.search <歌曲名稱>` 搜尋影片來播放\n" +
          "`b.playlist/b.pl <播放清單名稱/網址>` 播放Youtube的播放清單\n" +
          "`b.pause` 暫停歌曲\n" +
          "`b.resume/b.r` 繼續播放被暫停的歌曲\n" +
          "`b.skip/b.s` 跳過歌曲\n" +
          "`b.nowplaying/b.np` 顯示目前正在播放的歌曲\n" +
          "`b.filter <add/remove/clear> [bassboost/treble/8D/nightcore/vaporwave/surrounding/subboost]` 變更音樂等化器\n" +
          "`b.loop/b.l` 重複歌單\n" +
          "`b.repeat` 重複歌曲\n" +
          "`b.lyrics/b.ly [歌曲名稱]` 取得目前正在播放歌曲的歌詞\n" +
          "`b.queue/b.q` 顯示播放清單\n" +
          "`b.remove <歌曲編號>` 移除在播放清單裡的歌曲\n" +
          "`b.shuffle` 隨機排序播放清單\n" +
          "`b.skipto/b.st <歌曲名稱>` 跳到指定的歌曲\n" +
          "`b.volume [音量(1~100)]` 變更或查看目前的音量" +
          "`b.save` 儲存歌單\n" +
          "`b.load [ID]` 讀取歌單")
        .setFooter("<>表示必要, []表示可選")
        .setColor("BLURPLE");
    } else if (args[0] === "game") {
      embed = new MessageEmbed()
        .setTitle("遊戲指令")
        .setDescription(
          "`b.dice [面數]` 骰子!\n" +
          "`b.eat <食物/人>` 讓Black cat吃東西\n" +
          "`b.kill <人>` 殺人!!!\n" +
          "`b.lucky [人]` 查看幸運指數\n" +
          "`b.question <問題>` 讓Black cat幫你選擇")
        .setFooter("<>表示必要, []表示可選")
        .setColor("BLURPLE");
    } else if (args[0] === "util") {
      embed = new MessageEmbed()
        .setTitle("工具指令")
        .setDescription(
          "`b.kick <人>` 踢出一個成員\n" +
          "`b.ban <人>` 封鎖成員\n" +
          "`b.clear <數量(2~99)>` 清除訊息\n" +
          "`b.avatar [人]` 查看你的頭貼")
        .setFooter("<>表示必要, []表示可選")
        .setColor("BLURPLE");
    } else if (args[0] === "other") {
      embed = new MessageEmbed()
        .setTitle("其他指令")
        .setDescription(
          "`b.help/b.h` 顯示所有的指令\n" +
          "`b.ping` 查看機器人延遲\n" +
          "`b.status` 查看現在機器人的狀態\n" +
          "`b.support <問題>` 取得支援")
        .setFooter("<>表示必要, []表示可選")
        .setColor("BLURPLE");
    } else {
      return message.channel.send("❌ ┃ 請輸入正確的指令類別!").catch(console.error);
    }
    if (message.slash) return message.slash.send({
      embeds: [embed]
    }).catch(console.error)
    else return message.channel.send({
      embeds: [embed]
    }).catch(console.error);
  }
};
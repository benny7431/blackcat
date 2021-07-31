const ytdl = require("ytdl-core");
const Discord = require("discord.js");
const { opus, FFmpeg } = require("prism-media")
const { MessageButton, MessageActionRow } = require("discord-buttons");
const { canModifyQueue } = require("../util/Util");

module.exports = {
  async play(song, message) {
    const queue = message.client.queue.get(message.guild.id);
    queue.current = song;

    if (!song) {
      message.client.queue.delete(message.guild.id);
      queue.channel.leave();
      message.client.log(message, "Queue ended", false, "info");
      return queue.textChannel.send("<:stop:827734840891015189> ┃ 播放清單裡的音樂播完了").catch(console.error);
    }

    let embed = new Discord.MessageEmbed()
      .setColor("#5865F2")
      .setTitle("開始播放歌曲!")
      .setDescription(
        `<:music:825646714404077569> ┃ 正在播放 [${song.title}](${song.url})` +
        "\n\n[在網頁上控制](https://app.blackcatbot.tk/?server=" + message.guild.id + ")")
      .setThumbnail(song.thumbnail)
      .setFooter(`由${song.by}點播`);

    let skipBtn = new MessageButton()
      .setLabel("跳過")
      .setStyle("blurple")
      .setEmoji("827734282318905355")
      .setID("skip")
      .setDisabled(true);
    let pauseBtn = new MessageButton()
      .setLabel("暫停")
      .setStyle("blurple")
      .setEmoji("827737900359745586")
      .setID("pause")
      .setDisabled(true);
    let stopBtn = new MessageButton()
      .setLabel("停止")
      .setStyle("red")
      .setEmoji("827734840891015189")
      .setID("stop")
      .setDisabled(true);
    let volupBtn = new MessageButton()
      .setLabel("上升")
      .setStyle("green")
      .setEmoji("827734772889157722")
      .setID("vol_up")
      .setDisabled(true);
    let muteBtn = new MessageButton()
      .setLabel("靜音")
      .setStyle("green")
      .setEmoji("827734384606052392")
      .setID("mute")
      .setDisabled(true);
    let voldownBtn = new MessageButton()
      .setLabel("下降")
      .setStyle("green")
      .setEmoji("827734683340111913")
      .setID("vol_down")
      .setDisabled(true);
    let playControl = new MessageActionRow()
      .addComponent(skipBtn)
      .addComponent(pauseBtn)
      .addComponent(stopBtn);
    let volumeControl = new MessageActionRow()
      .addComponent(voldownBtn)
      .addComponent(muteBtn)
      .addComponent(volupBtn);
    let playingMessage = await queue.textChannel.send({
      embed,
      components: [playControl, volumeControl]
    });

    let encoderArgs = [
      "-analyzeduration", "0",
      "-loglevel", "0",
      "-f", "s16le",
      "-ar", "48000",
      "-ac", "2",
    ];
    if (queue.filter.length !== 0) encoderArgs = encoderArgs.concat(["-af", queue.filter.join(",")]);
    else encoderArgs.push("-af", "bass=g=2.5");
    
    let ytdlOptions = {
      quality: "highestaudio",
      highWaterMark: 1 << 10
    };

    let ytdlStream;
    try {
      ytdlStream = await ytdl(queue.current.url, ytdlOptions);
    } catch (error) {
      message.client.log(message, error.message, false, "error");
      let errorMsg = null;
      if (error.message.includes("404") || error.message.includes("id")) {
        errorMsg = "❌ ┃ 找不到影片";
      } else if (error.message.includes("private") || error.message.includes("403")) {
        errorMsg = "❌ ┃ 無法播放私人影片";
      } else if (error.message.includes("429")) {
        if (message.slash.raw) message.slash.send("❌ ┃ 發生Youtube API錯誤，機器人將會自動重新啟動...")
        else message.channel.send("❌ ┃ 發生Youtube API錯誤，機器人將會自動重新啟動...").catch(console.error);

        if (process.env.HEROKU_API_KEY && process.env.HEROKU_APP_ID) require("heroku-restarter")(process.env["HEROKU_API_KEY"], process.env["HEROKU_APP_ID"]).restart();
        else process.exit(1);
      } else {
        errorMsg = "❌ ┃ 發生了未知的錯誤，此錯誤已被紀錄";
      }
      embed.setTitle("播放音樂失敗");
      embed.setColor("#FF0000");
      embed.setDescription(errorMsg);
      playingMessage.edit({
        embed,
        components: [playControl, volumeControl]
      });
    }
    let opusStream = ytdlStream
      .pipe(new FFmpeg({
        args: encoderArgs
      }))
      .pipe(new opus.Encoder({
        rate: 48000,
        channels: 2,
        frameSize: 960,
      }));
    
    if (queue.current.type !== "soundcloud") {
      ytdlStream.on("info", songInfo => {
        let songData = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.player_response.videoDetails.lengthSeconds,
          thumbnail: songInfo.videoDetails.thumbnails.pop().url,
          type: "song",
          by: queue.current.by
        };
        queue.songs[0] = songData;
        queue.current = songData;
      });
    }

    queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));

    let collector = null;
    const dispatcher = queue.connection
      .play(opusStream, {
        type: "opus",
        bitrate: "auto",
        highWaterMark: 3
      })
      .on("start", () => {
        skipBtn.setDisabled(false);
        pauseBtn.setDisabled(false);
        stopBtn.setDisabled(false);
        volupBtn.setDisabled(false);
        muteBtn.setDisabled(false);
        voldownBtn.setDisabled(false);
        playControl = new MessageActionRow()
          .addComponent(skipBtn)
          .addComponent(pauseBtn)
          .addComponent(stopBtn);
        volumeControl = new MessageActionRow()
          .addComponent(voldownBtn)
          .addComponent(muteBtn)
          .addComponent(volupBtn);
        playingMessage.edit({
          embed,
          components: [playControl, volumeControl]
        });
      })
      .on("finish", () => {
        if (collector) collector.stop();
        if (queue.loop) {
          let lastSong = queue.songs.shift();
          queue.songs.push(lastSong);
          module.exports.play(queue.songs[0], message);
        } else if (queue.repeat) {
          module.exports.play(queue.songs[0], message);
        } else {
          queue.songs.shift();
          module.exports.play(queue.songs[0], message);
        }
      })
      .on("error", (err) => {
        console.error(err);
        playingMessage.delete().catch(console.error);
        message.client.log(message, err.message, false, "error");
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
        return queue.textChannel.send("❌ ┃ 播放音樂時出現問題, 若錯誤持續發生, 請稍後再試");
      });
    dispatcher.setVolumeLogarithmic(queue.volume / 100);

    message.client.log(message, "Play music", false, "info");

    const filter = (reaction, user) => user.id !== message.client.user.id;
    collector = playingMessage.createButtonCollector(filter);

    collector.on("collect", async btn => {
      let user = await btn.clicker.user;
      if (!queue) return;
      const member = message.guild.members.cache.get(user.id);
      if (!member) return;
      if (!canModifyQueue(member)) return btn.reply.send("❌ ┃ 請加入語音頻道!");
      else await btn.reply.defer();

      switch (btn.id) {
        case "skip":
          queue.playing = true;
          queue.connection.dispatcher.end();
          queue.textChannel.send("<:skip:827734282318905355> ┃ 跳過歌曲")
            .then(sent => {
              setTimeout(function() {
                sent.delete().catch(console.error);
              }, 3000);
            })
            .catch(console.error);
          collector.stop();
          break;

        case "pause":
          if (queue.playing) {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.pause();
            queue.textChannel.send("<:pause:827737900359745586> ┃ 歌曲暫停!")
              .then(sent => {
                setTimeout(function() {
                  sent.delete().catch(console.error);
                }, 3000);
              })
              .catch(console.error);
          } else {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.resume();
            queue.textChannel.send("<:play:827734196243398668> ┃ 繼續播放歌曲!")
              .then(sent => {
                setTimeout(function() {
                  sent.delete().catch(console.error);
                }, 3000);
              })
              .catch(console.error);
          }
          break;

        case "mute":
          if (queue.volume <= 0) {
            queue.volume = 100;
            queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
            queue.textChannel.send("<:vol_up:827734772889157722> ┃ 解除靜音音樂")
              .then(sent => {
                setTimeout(function() {
                  sent.delete().catch(console.error);
                }, 3000);
              })
              .catch(console.error);
          } else {
            queue.volume = 0;
            queue.connection.dispatcher.setVolumeLogarithmic(0);
            queue.textChannel.send("<:mute:827734384606052392> ┃ 靜音音樂")
              .then(sent => {
                setTimeout(function() {
                  sent.delete().catch(console.error);
                }, 3000);
              })
              .catch(console.error);
          }
          break;

        case "vol_down":
          if (queue.volume - 10 <= 0) queue.volume = 0;
          else queue.volume = queue.volume - 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          queue.textChannel.send(`<:vol_down:827734683340111913> ┃ 音量下降，目前音量: ${queue.volume}%`)
            .then(sent => {
              setTimeout(function() {
                sent.delete().catch(console.error);
              }, 3000);
            })
            .catch(console.error);
          break;

        case "vol_up":
          if (queue.volume + 10 >= 100) queue.volume = 100;
          else queue.volume = queue.volume + 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          queue.textChannel.send(`<:vol_up:827734772889157722> ┃ 音量上升，目前音量: ${queue.volume}%`)
            .then(sent => {
              setTimeout(function() {
                sent.delete().catch(console.error);
              }, 3000);
            })
            .catch(console.error);
          break;

        case "stop":
          queue.songs = [];
          queue.textChannel.send("<:stop:827734840891015189> ┃ 歌曲停止!")
            .then(sent => {
              setTimeout(function() {
                sent.delete().catch(console.error);
              }, 3000);
            })
            .catch(console.error);
          try {
            queue.connection.dispatcher.end();
          } catch (error) {
            console.error(error);
            queue.connection.disconnect();
          }
          collector.stop();
          break;
      }
    });

    collector.on("end", async () => {
      setTimeout(function() {
        playingMessage.delete().catch(console.error);
      }, 500);
      message.client.log(message, "Music ended", false, "info");
    });
  }
};

const Discord = require("discord.js")
const voice = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const { opus, FFmpeg, VolumeTransformer } = require("prism-media");

class Player {
  /**
   * @param {Object} queue Server Queue
   * @param {Client} client Discord.js Client
   */
  constructor(queue, client) {
    super();
    this.queue = queue;
  }

  /**
   * Connect to channel
   * @param {VoiceChannel} channel Voice channel to connect
   */
  connect(channel) {
    this.queue.connection = voice.joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    _createPlayer()
    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5000),
        ]);
      } catch (error) {
        client.queue.delete(connection.guild.id);
        connection.destroy();
      }
    });
  }

  /**
   * Start play song
   * @param {Object} song Song Data
   */
  play(song) {
    this._getStream(song.url);
  }

  /**
   * Skip current song
   */
  skip() {
    this.queue.audioPlayer.stop();
  }

  /**
   * Pause player
   */
  pause() {
    this.queue.audioPlayer.pause();
  }

  /**
   * Chnage current volume
   * @param {Number} volume Volume
   */
  setVolume(volume) {
    this.volume.setVolumeLogarithmic(volume);
  }

  /**
   * Resume paused song
   */
  resume() {
    this.queue.audioPlayer.unpause();
  }

  /**
   * Stop player
   */
  stop() {
    client.queue.delete(connection.guild.id);
    connection.destroy();
  }

  /** Create player
   * @private
   * @param {VoiceChannel} channel Voice channel that will subscribe player
   */
  _createPlayer(channel) {
    this.queue.audioPlayer = voice.createAudioPlayer({
      behaviors: {
        noSubscriber: voice.NoSubscriberBehavior.Pause,
      },
    }); 
    channel.subscribe(queue.audioPlayer);

    queue.AudioPlayer.on("error", error => {
      console.log(error.message);
      this.emit("error");
      this.queue.connection.destroy();
      client.queue.delete(connection.guild.id);
    });
  }

  /**
   * Get audio stream
   * @private
   * @param {String} url YouTube video URL
   */
  _getStream(url) {
    let encoderArgs = [
      "-analyzeduration", "0",
      "-loglevel", "0",
      "-f", "s16le",
      "-ar", "48000",
      "-ac", "2",
    ];
    if (this.queue.filter.length !== 0) encoderArgs = encoderArgs.concat(["-af", queue.filter.join(",")]);
    else encoderArgs.push("-af", "bass=g=2.5");

    let ytdlStream;
    try {
      ytdlStream = await ytdl(url, {
        highWaterMark: 1 << 20
      });
    } catch (error) {
      this.emit("ytdlError", error.message);
      return;
    }
    this.volume = new VolumeTransformer({
      type: "s16le",
      volume: 0.6
    });
    let opusStream = ytdlStream
      .pipe(new FFmpeg({
        args: encoderArgs
      }))
      .pipe(this.queue.volume)
      .pipe(new opus.Encoder({
        rate: 48000,
        channels: 2,
        frameSize: 960,
      }));
    opusStream.on("close", () => {
      opusStream.destroy();
    });
    _playStream(opusStream);
  }

  /**
   * Play stream
   * @private
   * @param {Readable} stream Stream to play
   */
  _playStream(stream) {
    let queue = this.queue, song = queue.songs[0];
    queue.current = queue.songs[0];
    let source = voice.createAudioResource(stream, {
      inputType: voice.StreamType.Opus
    });
    queue.audioPlayer.play(source);

    let embed = new Discord.MessageEmbed()
      .setColor("BLURPLE")
      .setTitle("開始播放歌曲!")
      .setDescription(
        `<:music:825646714404077569> ┃ 正在播放 [${song.title}](${song.url})` +
        "\n\n[在網頁上控制](https://app.blackcatbot.tk/?server=" + message.guild.id + ")")
      .setThumbnail(song.thumbnail)
      .setFooter(`由${song.by}點播`);

    let skipBtn = new Discord.MessageButton()
      .setLabel("跳過")
      .setStyle("PRIMARY")
      .setEmoji("827734282318905355")
      .setCustomId("skip")
    let pauseBtn = new Discord.MessageButton()
      .setLabel("暫停")
      .setStyle("PRIMARY")
      .setEmoji("827737900359745586")
      .setCustomId("pause")
    let stopBtn = new Discord.MessageButton()
      .setLabel("停止")
      .setStyle("DANGER")
      .setEmoji("827734840891015189")
      .setCustomId("stop")
    let volupBtn = new Discord.MessageButton()
      .setLabel("上升")
      .setStyle("SUCCESS")
      .setEmoji("827734772889157722")
      .setCustomId("vol_up")
    let muteBtn = new Discord.MessageButton()
      .setLabel("靜音")
      .setStyle("SUCCESS")
      .setEmoji("827734384606052392")
      .setCustomId("mute")
    let voldownBtn = new Discord.MessageButton()
      .setLabel("下降")
      .setStyle("SUCCESS")
      .setEmoji("827734683340111913")
      .setCustomId("vol_down")
    let playControl = new Discord.MessageActionRow()
      .addComponent(skipBtn)
      .addComponent(pauseBtn)
      .addComponent(stopBtn);
    let volumeControl = new Discord.MessageActionRow()
      .addComponent(voldownBtn)
      .addComponent(muteBtn)
      .addComponent(volupBtn);

    let playingMessage = await queue.textChannel.send({
      embeds: [embed],
      components: [playControl, volumeControl]
    });

    const filter = (reaction, user) => user.id !== message.client.user.id;
    let collector = playingMessage.createMessageComponentCollector();

    collector.on("collect", async btn => {
      const member = btn.member;
      if (!canModifyQueue(member)) return btn.reply({
        content: "❌ ┃ 請加入語音頻道!",
        ephemeral: true
      });
      else await btn.defer();

      switch (btn.id) {
        case "skip":
          queue.playing = true;
          this.skip();
          queue.textChannel.send("<:skip:827734282318905355> ┃ 跳過歌曲")
            .then(sent => {
              setTimeout(function() {
                sent.delete().catch(console.error);
              }, 3000);
            })
            .catch(console.error);
          break;

        case "pause":
          if (queue.playing) {
            queue.playing = !queue.playing;
            this.pause();
            queue.textChannel.send("<:pause:827737900359745586> ┃ 歌曲暫停!")
              .then(sent => {
                setTimeout(function() {
                  sent.delete().catch(console.error);
                }, 3000);
              })
              .catch(console.error);
          } else {
            queue.playing = !queue.playing;
            this.resume();
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
            queue.volume = 60;
            this.volume.setVolumeLogarithmic(60 / 100);
            queue.textChannel.send("<:vol_up:827734772889157722> ┃ 解除靜音音樂")
              .then(sent => {
                setTimeout(function() {
                  sent.delete().catch(console.error);
                }, 3000);
              })
              .catch(console.error);
          } else {
            queue.volume = 0;
            this.volume.setVolumeLogarithmic(0);
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
          this.volume.setVolumeLogarithmic(queue.volume / 100);
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
          this.volume.setVolumeLogarithmic(queue.volume / 100);
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
            this.stop();
          } catch (error) {
            console.error(error);
            queue.connection.destroy();
          }
          break;
      }
    });

    collector.on("end", async () => {
      setTimeout(function() {
        playingMessage.delete().catch(console.error);
      }, 500);
      message.client.log(message, "Music ended", false, "info");
    });

    connection.once(voice.VoiceConnectionStatus.Idle, () => {
      collector.stop();
      if (queue.loop) {
        let lastSong = this.queue.songs.shift();
        queue.songs.push(lastSong);
      } else if (!queue.repeat) {
        queue.songs.shift();
        module.exports.play(this.queue.songs[0], message);
      }
      this._getStream(this.queue.songs[0].url);
    });
  }
}

module.exports = Player;
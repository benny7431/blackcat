const Discord = require("discord.js")
const voice = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const { opus, FFmpeg, VolumeTransformer } = require("prism-media");
const { canModifyQueue } = require("../util/Util")

class Player {
  /**
   * @param {Object} queue Server Queue
   * @param {Client} client Discord.js Client
   */
  constructor(queue, client) {
    this.queue = queue;
    this.client = client;
  }

  /**
   * Connect to channel
   * @param {VoiceChannel} channel Voice channel to connect
   */
  async connect(channel) {
    this.client.log("Connecting to voice channel");
    this.queue.connection = await voice.joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    this._createPlayer(channel)
    this.queue.connection.on(voice.VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          voice.entersState(connection, voice.VoiceConnectionStatus.Signalling, 5000),
          voice.entersState(connection, voice.VoiceConnectionStatus.Connecting, 5000),
        ]);
      } catch (error) {
        this.client.queue.delete(connection.guild.id);
        this.queue.connection.destroy();
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
    if (this.queue.loop) {
      let lastSong = this.queue.songs.shift();
      this.queue.songs.push(lastSong);
    } else if (!this.queue.repeat) {
      this.queue.songs.shift();
    }
    if (!this.queue.songs.length) {
      this.queue.audioPlayer.stop();
    }
    this._getStream(this.queue.songs[0].url);
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
    this.queue.converter.volume.setVolumeLogarithmic(volume);
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
    this.client.queue.delete(this.queue.textChannel.guildId);
    this.queue.connection.destroy();
    this.client.log("Stop player");
  }

  /** Create player
   * @param {VoiceChannel} channel Voice channel that will subscribe player
   */
  _createPlayer(channel) {
    this.client.log("Create player");
    this.queue.audioPlayer = voice.createAudioPlayer({
      behaviors: {
        noSubscriber: voice.NoSubscriberBehavior.Pause,
      },
    });
    this.queue.connection.subscribe(this.queue.audioPlayer);

    this.queue.audioPlayer.on("error", error => {
      console.log(error.message);
      this.emit("error");
      this.queue.connection.destroy();
      client.queue.delete(connection.guild.id);
    });
  }

  /**
   * Get audio stream
   * @param {String} url YouTube video URL
   */
  async _getStream(url) {
    let encoderArgs = [
      "-analyzeduration", "0",
      "-loglevel", "0",
      "-f", "s16le",
      "-ar", "48000",
      "-ac", "2",
    ];
    if (this.queue.filter.length !== 0) encoderArgs = encoderArgs.concat(["-af", queue.filter.join(",")]);
    else encoderArgs.push("-af", "bass=g=2.5");

    let ytdlStream = await ytdl(url, {
      highWaterMark: 1 << 20
    });
    this.queue.converter.ffmpeg = new FFmpeg({
      args: encoderArgs
    });
    this.queue.converter.volume = new VolumeTransformer({
      type: "s16le",
      volume: 0.6
    });
    this.queue.converter.opus = new opus.Encoder({
      rate: 48000,
      channels: 2,
      frameSize: 960
    });
    let opusStream = ytdlStream
      .pipe(this.queue.converter.ffmpeg)
      .pipe(this.queue.converter.volume)
      .pipe(this.queue.converter.opus);
    this._playStream(opusStream);
  }

  /**
   * Play stream
   * @private
   * @param {Readable} stream Stream to play
   */
  async _playStream(stream) {
    this.client.log("Start playing song");
    let queue = this.queue,
      song = queue.songs[0];
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
        "\n\n[在網頁上控制](https://app.blackcatbot.tk/?server=" + this.queue.textChannel.guild.id + ")")
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
      .addComponents(skipBtn)
      .addComponents(pauseBtn)
      .addComponents(stopBtn);
    let volumeControl = new Discord.MessageActionRow()
      .addComponents(voldownBtn)
      .addComponents(muteBtn)
      .addComponents(volupBtn);

    let playingMessage = await queue.textChannel.send({
      embeds: [embed],
      components: [playControl, volumeControl]
    });

    let collector = playingMessage.createMessageComponentCollector();
    collector.on("collect", async btn => {
      const member = btn.member;
      if (!canModifyQueue(member)) return btn.reply({
        content: "❌ ┃ 請加入語音頻道!",
        ephemeral: true
      });

      switch (btn.customId) {
        case "skip":
          queue.playing = true;
          this.skip();
          queue.textChannel.send("<:skip:827734282318905355> ┃ 跳過歌曲")
            .then(sent => {
              setTimeout(function () {
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
                setTimeout(function () {
                  sent.delete().catch(console.error);
                }, 3000);
              })
              .catch(console.error);
          } else {
            queue.playing = !queue.playing;
            this.resume();
            queue.textChannel.send("<:play:827734196243398668> ┃ 繼續播放歌曲!")
              .then(sent => {
                setTimeout(function () {
                  sent.delete().catch(console.error);
                }, 3000);
              })
              .catch(console.error);
          }
          break;

        case "mute":
          if (queue.volume <= 0) {
            queue.volume = 60;
            this.queue.converter.volume.setVolumeLogarithmic(60 / 100);
            queue.textChannel.send("<:vol_up:827734772889157722> ┃ 解除靜音音樂")
              .then(sent => {
                setTimeout(function () {
                  sent.delete().catch(console.error);
                }, 3000);
              })
              .catch(console.error);
          } else {
            queue.volume = 0;
            this.queue.converter.volume.setVolumeLogarithmic(0);
            queue.textChannel.send("<:mute:827734384606052392> ┃ 靜音音樂")
              .then(sent => {
                setTimeout(function () {
                  sent.delete().catch(console.error);
                }, 3000);
              })
              .catch(console.error);
          }
          break;

        case "vol_down":
          if (queue.volume - 10 <= 0) queue.volume = 0;
          else queue.volume = queue.volume - 10;
          this.queue.converter.volume.setVolumeLogarithmic(queue.volume / 100);
          queue.textChannel.send(`<:vol_down:827734683340111913> ┃ 音量下降，目前音量: ${queue.volume}%`)
            .then(sent => {
              setTimeout(function () {
                sent.delete().catch(console.error);
              }, 3000);
            })
            .catch(console.error);
          break;

        case "vol_up":
          if (queue.volume + 10 >= 100) queue.volume = 100;
          else queue.volume = queue.volume + 10;
          this.queue.converter.volume.setVolumeLogarithmic(queue.volume / 100);
          queue.textChannel.send(`<:vol_up:827734772889157722> ┃ 音量上升，目前音量: ${queue.volume}%`)
            .then(sent => {
              setTimeout(function () {
                sent.delete().catch(console.error);
              }, 3000);
            })
            .catch(console.error);
          break;

        case "stop":
          queue.songs = [];
          queue.textChannel.send("<:stop:827734840891015189> ┃ 歌曲停止!")
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
      playingMessage.delete().catch(console.error);
    });

    queue.audioPlayer.on("stateChange", (oldState, newState) => {
      if (newState.status === voice.AudioPlayerStatus.Idle && oldState.status !== voice.AudioPlayerStatus.Idle) {
        this.client.log("Music ended");
        collector.stop();
        if (queue.loop) {
          let lastSong = this.queue.songs.shift();
          queue.songs.push(lastSong);
        } else if (!queue.repeat) {
          queue.songs.shift();
        }
        if (!queue.songs.length) {
          this.client.log("Queue ended");
          this.stop();
        }
        this.queue.audioPlayer.removeAllListeners("stateChange")
        this._getStream(this.queue.songs[0].url);
      }
    });
  }
}

module.exports = Player;

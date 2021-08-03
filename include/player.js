const Discord = require("discord.js");
const voice = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const { opus, FFmpeg, VolumeTransformer } = require("prism-media");
const { canModifyQueue } = require("../util/Util");

class Player {
  /**
   * @param {Discord.VoiceChannel} channel Server voice channel
   * @param {Discord.TextChannel} textChannel Server text channel
   * @param {Discord.Client} client Discord.js Client
   */
  constructor(channel, textChannel, client) {
    // Client
    this.client = client;

    // Song list
    this.songs = [];
    this.current = null;

    // Song behavior
    this.volume = 60;
    this.playing = true
    this.loop = false;
    this.repeat = false;
    this.filter = [];

    // Player
    this.audioPlayer = voice.createAudioPlayer();

    // Voice connection
    this.connection = await voice.joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    this.voiceChannel = channel;
    if (channel.type === "GUILD_STAGE_VOICE" && !channel.stageInstance) {
      await channel.createStageInstance({
        topic: "即將開始播放音樂...",
        privacyLevel: "GUILD_ONLY"
      });
      await channel.guild.me.voice.setSuppressed(false);
    }

    // Audio resource
    this.audioResource = null;

    // Text channel
    this.text = textChannel;

    // Error events
    this.connection.on(voice.VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          voice.entersState(this.connection, voice.VoiceConnectionStatus.Signalling, 7000),
          voice.entersState(this.connection, voice.VoiceConnectionStatus.Connecting, 7000),
        ]);
      } catch (error) {
        this.client.queue.delete(this.text.guildId);
        this.connection.destroy();
      }
    });

    // Converts
    this.opus = null;
    this.ffmpeg = null;
    this.volumeTransformer = null;

    // Controller
    this.collector = null;
  }

  /**
   * Start player
   */
  start() {
    this._getStream(this.songs[0].url);
  }

  /**
   * Add songs
   * @param {Array} songs Array of song data
   */
  add(songs) {
    this.songs.concat(songs);
  }

  /**
   * Skip current song
   */
  skip() {
    if (this.loop) {
      let lastSong = this.songs.shift();
      this.songs.push(lastSong);
    } else if (!this.repeat) {
      this.songs.shift();
    }
    if (this.songs.length <= 0) {
      this.stop();
    }
    this._getStream(this.songs[0].url);
  }

  /**
   * Pause player
   */
  pause() {
    this.audioPlayer.pause();
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
    this.audioPlayer.unpause();
  }

  /**
   * Stop player
   */
  stop() {
    this.text.send("👌 ┃ 播放完畢");
    this.songs = [];
    this.audioPlayer.stop();
    this.client.queue.delete(this.text.guildId);
    this.client.log("Queue ended");
  }

  /**
   * Loop music
   * @param {Boolean} value Value
   */
  loop(value = !this.loop) {
    this.repeat = false;
    this.loop = value;
  }

  /**
   * Get now play time
   */
  static get playTime() {
    return this.audioResource.playbackDuration / 1000;
  }

  /**
   * Repeat music
   * @param {Boolean} value Value
   */
  repeat(value = !this.repeat) {
    this.loop = false;
    this.repeat = value;
  }

  /**
   * Get audio stream and play it
   * @private
   * @param {String} url YouTube video URL
   */
  async _getStream(url) {
    this.current = this.songs[0];
    let encoderArgs = [
      "-analyzeduration", "0",
      "-loglevel", "0",
      "-f", "s16le",
      "-ar", "48000",
      "-ac", "2",
    ];
    if (this.filter.length !== 0) encoderArgs = encoderArgs.concat(["-af", this.filter.join(",")]);
    else encoderArgs.push("-af", "bass=g=2.5");

    let ytdlStream = await ytdl(url, {
      highWaterMark: 1 << 20
    });
    ytdlStream.once("info", songInfo => {
      let songData = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        duration: songInfo.player_response.videoDetails.lengthSeconds,
        thumbnail: songInfo.videoDetails.thumbnails.pop().url,
        type: "song",
        by: this.current.by,
        songId: this.current.songId
      };
      if (this.songs[0].songId === this.current.songId) {
        this.songs[0] = songData;
      }
      this.current = songData;
    });
    this.ffmpeg = new FFmpeg({
      args: encoderArgs
    });
    this.volume = new VolumeTransformer({
      type: "s16le",
      volume: 0.6
    });
    this.opus = new opus.Encoder({
      rate: 48000,
      channels: 2,
      frameSize: 960
    });
    let opusStream = ytdlStream
      .pipe(this.ffmpeg)
      .pipe(this.volume)
      .pipe(this.opus);
    this._playStream(opusStream);
  }

  /**
   * Play stream
   * @private
   * @param {Readable} stream Stream to play
   */
  async _playStream(stream) {
    this.client.log("Start playing song");
    let song = songs[0];
    this.source = voice.createAudioResource(stream, {
      inputType: voice.StreamType.Opus
    });
    this.audioPlayer.play(this.source);
    if (this.channel.type === "GUILD_STAGE_VOICE") this.voiceChannel.stageInstance.setTopic(`正在播放 - ${this.current.title.substr(0, 112)}`);

    let embed = new Discord.MessageEmbed()
      .setColor("BLURPLE")
      .setTitle("開始播放歌曲!")
      .setDescription(
        `<:music:825646714404077569> ┃ 正在播放 [${song.title}](${song.url})` +
        "\n\n[在網頁上控制](https://app.blackcatbot.tk/?server=" + this.text.guild.id + ")")
      .setThumbnail(song.thumbnail)
      .setFooter(`由${song.by}點播`);

    let skipBtn = new Discord.MessageButton()
      .setLabel("跳過")
      .setStyle("PRIMARY")
      .setEmoji("827734282318905355")
      .setCustomId("skip");
    let pauseBtn = new Discord.MessageButton()
      .setLabel("暫停")
      .setStyle("PRIMARY")
      .setEmoji("827737900359745586")
      .setCustomId("pause");
    let stopBtn = new Discord.MessageButton()
      .setLabel("停止")
      .setStyle("DANGER")
      .setEmoji("827734840891015189")
      .setCustomId("stop");
    let volupBtn = new Discord.MessageButton()
      .setLabel("上升")
      .setStyle("SUCCESS")
      .setEmoji("827734772889157722")
      .setCustomId("vol_up");
    let muteBtn = new Discord.MessageButton()
      .setLabel("靜音")
      .setStyle("SUCCESS")
      .setEmoji("827734384606052392")
      .setCustomId("mute");
    let voldownBtn = new Discord.MessageButton()
      .setLabel("下降")
      .setStyle("SUCCESS")
      .setEmoji("827734683340111913")
      .setCustomId("vol_down");
    let playControl = new Discord.MessageActionRow()
      .addComponents(skipBtn)
      .addComponents(pauseBtn)
      .addComponents(stopBtn);
    let volumeControl = new Discord.MessageActionRow()
      .addComponents(voldownBtn)
      .addComponents(muteBtn)
      .addComponents(volupBtn);

    this.controller = await this.text.send({
      embeds: [embed],
      components: [playControl, volumeControl]
    });

    let collector = this.controller.createMessageComponentCollector();
    collector.on("collect", async btn => {
      const member = btn.member;
      if (!canModifyQueue(member)) return btn.reply({
        content: "❌ ┃ 請加入語音頻道!",
        ephemeral: true
      });

      switch (btn.customId) {
        case "skip":
          this.playing = true;
          this.skip();
          btn.reply({
            content: "<:skip:827734282318905355> ┃ 跳過歌曲",
            ephemeral: true
          }).catch(console.error);
          break;

        case "pause":
          if (this.playing) {
            this.playing = !this.playing;
            this.pause();
            btn.reply({
              content: "<:pause:827737900359745586> ┃ 歌曲暫停!",
              ephemeral: true
            }).catch(console.error);
          } else {
            this.playing = !this.playing;
            this.resume();
            btn.reply({
              content: "<:play:827734196243398668> ┃ 繼續播放歌曲!",
              ephemeral: true
            }).catch(console.error);
          }
          break;

        case "mute":
          if (this.volume <= 0) {
            this.volume = 60;
            this.volumeTransformer.setVolumeLogarithmic(60 / 100);
            btn.reply({
              content: "<:vol_up:827734772889157722> ┃ 解除靜音音樂",
              ephemeral: true
            }).catch(console.error);
          } else {
            this.volume = 0;
            this.volumeTransformer.setVolumeLogarithmic(0);
            btn.reply({
              content: "<:mute:827734384606052392> ┃ 靜音音樂",
              ephemeral: true
            }).catch(console.error);
          }
          break;

        case "vol_down":
          if (this.volume - 10 <= 0) this.volume = 0;
          else this.volume = this.volume - 10;
          this.volumeTransformer.setVolumeLogarithmic(this.queue.volume / 100);
          btn.reply({
            content: `<:vol_down:827734683340111913> ┃ 音量下降，目前音量: ${this.volume}%`,
            ephemeral: true
          }).catch(console.error);
          break;

        case "vol_up":
          if (this.volume + 10 >= 100) this.volume = 100;
          else this.volume = this.volume + 10;
          this.volumeTransformer.setVolumeLogarithmic(this.queue.volume / 100);
          btn.reply({
            content: `<:vol_up:827734772889157722> ┃ 音量上升，目前音量: ${this.volume}%`,
            ephemeral: true
          }).catch(console.error);
          break;

        case "stop":
          this.stop();
          btn.reply({
            content: "<:stop:827734840891015189> ┃ 歌曲停止!",
            ephemeral: true
          }).catch(console.error);
          break;
      }
    });

    collector.on("end", async () => {
      playingMessage.delete().catch(console.error);
    });

    this.audioPlayer.on(voice.AudioPlayerStatus.Idle, () => {
      this.client.log("Player enter idle state");
      this.source = null;
      collector.stop();
      if (this.loop) {
        let lastSong = this.songs.shift();
        this.songs.push(lastSong);
      } else if (!this.repeat) {
        this.songs.shift();
      }
      if (this.songs.length <= 0) {
        this.client.log("Queue ended");
        this.stop();
      } else {
        this.audioPlayer.removeAllListeners(voice.AudioPlayerStatus.Idle);
        this._getStream(this.songs[0].url);
      }
    });
  }
}

module.exports = Player;
module.exports = {
  canModifyQueue(member) {
    const { channel } = member.voice;
    const botChannel = member.guild.me.voice.channel;

    if (!channel || !botChannel) return false;

    return channel.id === botChannel.id;
  },
  delay(ms) {
    return new Promise(reslove => {
      setTimeout(() => {
        reslove();
      }, ms);
    });
  },
  async loop(times, cb, delay) {
    for (let step = 0; step < times; step++) {
      if (delay) await module.exports.delay(delay);
      cb();
    }
  }
};

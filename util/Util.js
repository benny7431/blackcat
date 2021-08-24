module.exports = {
  canModifyQueue(member) {
    const { channel } = member.voice;
    const botChannel = member.guild.me.voice.channel;
    const queue = member.client.players.get(member.guild.id);

    if (!channel) return false;

    if (channel.id !== botChannel.id) {
      return false;
    }

    return true;
  }
};

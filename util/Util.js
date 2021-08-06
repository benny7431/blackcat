module.exports = {
  canModifyQueue(member) {
    const { channel } = member.voice;
    const botChannel = member.guild.me.voice.channel;
    const queue = member.client.players.get(member.guild.id);

    if (channel.id !== botChannel.id && member.id !== "669194742218752070") {
      return false;
    }

    return true;
  }
};

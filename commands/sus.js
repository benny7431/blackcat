module.exports = {
  name: "sus",
  description: "You are sus",
  register: false,
  execute(message) {
    return message.channel.send(`${message.author.username} is sus!`);
  }
};
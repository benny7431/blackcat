module.exports = {
  name: "eval",
  register: false,
  execute(message, args) {
    if (message.author.id !== "669194742218752070") return message.channel.send("🤔");
    try {
      const code = args.join(" ");
      let evaled = eval(code);
      if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
      message.channel.send("```js\n" + evaled + "\n```");
    } catch (err) {
      message.channel.send("```js\n" + err + "\n```");
    }
  }
}
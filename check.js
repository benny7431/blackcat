const fs = require("fs");
const path = require("path");
const syntax = require("syntax-error");

function check (source, file) {
  let error = syntax(source);
  if (error) {
    console.error(`${file} have syntax error`);
    console.log(("=").repeat(60));
    console.error(error.annotated);
    console.log(("=").repeat(60));
    process.exit(1);
  } else {
    console.log(`${file} check passed`);
  }
}

check(fs.readFileSync("./index.js"), "index.js");
check(fs.readFileSync("./include/player.js"), "include/player.js");
check(fs.readFileSync("./util/Util.js"), "util/Util.js");

const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  check(fs.readFileSync(path.join(__dirname, "commands", file)), file);
}
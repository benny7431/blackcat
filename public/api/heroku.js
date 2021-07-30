const fetch = require('node-fetch')
module.exports = async function(req, res) {
  if (req.body.resource !== "build") {
    return res.end();
  }
  const body = {
    username: "Heroku",
    avatar_url: "https://blackcatbot.tk/heroku.png",
    embeds: [{
      title: req.body.action === "create" ? "Build started" : "Build finished",
      description: `Build status changed to ${req.body.data.status}`,
      color: 5793266
    }]
  };
  await fetch(req.query.url, {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(() => {
      res.end();
    })
    .catch(() => {
      res.status(500).end();
    })
}

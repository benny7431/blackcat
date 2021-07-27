let ws = new WebSocket("wss://api.blackcatbot.tk/api/ws/test");

document.getElementById("send").onclick = function () {
  ws.send(document.getElementById("msg").value);
}

ws.onmessage = function(event) {
  document.getElementById("out").innerHTML += `${event.data}<br>`;
}
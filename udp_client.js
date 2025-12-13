// udp_client.js
const dgram = require("dgram");

const PORT = 5353;
const HOST = "127.0.0.1";

const client = dgram.createSocket("udp4");

const payload = Buffer.from("hola-udp");

client.send(payload, PORT, HOST, (err) => {
  if (err) console.error(err);
  else console.log("Sent:", payload.toString());
});

client.on("message", (msg) => {
  console.log("Received echo:", msg.toString());
  client.close();
});

client.on("error", (err) => {
  console.error("Client error:", err);
  client.close();
});

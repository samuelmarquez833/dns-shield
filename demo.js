// udp_server.js
const dgram = require("dgram");

const PORT = 8053;          // usa 5353 para no requerir admin (53 requiere permisos)
const HOST = "127.0.0.1";   // localhost

const server = dgram.createSocket("udp4");

server.on("listening", () => {
  const addr = server.address();
  console.log(`UDP server listening on ${addr.address}:${addr.port}`);
});

server.on("message", (msg, rinfo) => {
  console.log("GOT DNS?", new Date().toISOString(), rinfo.address, rinfo.port, msg.length);
});



server.on("error", (err) => {
  console.error("Server error:", err);
  server.close();
});

server.bind(PORT); // 0.0.0.0

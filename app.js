const dgram = require('node:dgram');
const { off } = require('node:process');
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});
/*
server.on('message', (msg, rinfo) => {

  let offset = 0;

  console.log(`toStrin=${msg.toString("ascii", 0, msg.length)} greadUint8=${msg.readUint8(offset)} readUInt16BE=${msg.readUInt16BE(offset)} readUInt32BE=${msg.readUInt32BE(offset)} from ${rinfo.address}:${rinfo.port}`);
  console.log("HEX:", msg.toString("hex"));
  offset += 1;
  console.log("Offset:", offset);
});*/

server.on("message", (msg, rinfo) => {

  // ===== HEADER =====
  const id      = msg.readUInt16BE(0);
  const flags   = msg.readUInt16BE(2);
  const qdcount = msg.readUInt16BE(4);

  console.log("ID:", id);
  console.log("QDCOUNT:", qdcount);

  // ===== QNAME =====
  let offset = 12;               // porque el header SIEMPRE mide 12
  const labels = [];

  while (true) {
    const len = msg.readUInt8(offset);

    if (len === 0) {             // 0x00 = fin del nombre
      offset += 1;
      break;
    }

    const label = msg.toString(
      "ascii",
      offset + 1,
      offset + 1 + len
    );

    labels.push(label);
    offset += 1 + len;           // avanzas lo que leíste
  }

  const domain = labels.join(".");
  console.log("DOMAIN:", domain);

  // ===== QTYPE / QCLASS =====
  const qtype  = msg.readUInt16BE(offset);
  const qclass = msg.readUInt16BE(offset + 2);

  console.log("QTYPE:", qtype);
  console.log("QCLASS:", qclass);
});




server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(5533, '127.0.0.1');
// Prints: server listening 0.0.0.0:41234
// udp or dns client.js

const dgram = require("node:dgram");
const client = dgram.createSocket("udp4");

const dnsQuery = Buffer.from([
  0x12, 0x34, // ID
  0x01, 0x00, // FLAGS: standard query
  0x00, 0x01, // QDCOUNT = 1
  0x00, 0x00, // ANCOUNT
  0x00, 0x00, // NSCOUNT
  0x00, 0x00, // ARCOUNT

  // QNAME: example.com
  0x07, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, // "example"
  0x03, 0x63, 0x6f, 0x6d,                         // "com"
  0x00,                                           // end of name

  0x00, 0x01, // QTYPE = A
  0x00, 0x01  // QCLASS = IN
]);





client.send(dnsQuery, 5533, "127.0.0.1", (err) => {
  if (err) console.error(err);
  else console.log("Enviado");
  client.close();
});

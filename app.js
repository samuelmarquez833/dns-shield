const dgram = require('node:dgram');
const {decide} = require('./core/normalize');
const rules = require('./data/rules.json');

const { off } = require('node:process');
const { inspect } = require('node:util');
const server = dgram.createSocket('udp4');


const dns = require('node:dns');

















server.on('error', (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});






let porno = null;

let mensaje;

server.on("message", async (msg, rinfo) => {



  const id = msg.readUInt16BE(0);
  const flags = msg.readUInt16BE(2);
  const qdcount = msg.readUInt16BE(4);
  let offset = 12;               
  const labels = [];

  while (true) {
    const len = msg.readUInt8(offset);

    if (len === 0) {             
      offset += 1;
      break;
    }

    const label = msg.toString(
      "ascii",
      offset + 1,
      offset + 1 + len
    );

    labels.push(label);
    offset += 1 + len;           
  }
  const qname = labels.join(".");
  const qtype  = msg.readUInt16BE(offset);
  const qclass = msg.readUInt16BE(offset + 2);


  //const decision = await decide(id, flags, qdcount, qname, qtype, qclass, rules);

  mensaje = msg;

  aja(qname);

});


function aja (hostname){
  server.send(Buffer.from(mensaje), 53, "1.1.1.1");    

  server.on("message", (resp) => {
    console.log("UPSTREAM RESPONSE HEX:", resp.toString("hex"));
  });

  /*
  en serio 
  solo me falta enviar la dns real cosa la cual hago con el codigo de abajo
  pero especificando al servidr dns de google 8.8.8.8
  y recibir la respuesta del dns real en formato de dns reposnse real  e imprimirla de una forma
  */
 
  dns.resolve4(hostname, (err, addresses) => {
    if (err) {
      console.error("DNS RESOLVE ERROR:", err);
      return;
    } else {
      console.log(`Resolved addresses for ${hostname}:`, addresses);
    }
  });



}
  


































server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);

});

server.bind(5533, '127.0.0.1');
// Prints: server listening 0.0.0.0:41234
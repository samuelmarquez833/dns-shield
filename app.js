const dgram = require('node:dgram');
const {decide} = require('./core/normalize');
const rules = require('./data/rules.json');

const server = dgram.createSocket('udp4');

const client = dgram.createSocket("udp4");













server.on('error', (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});








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







  const veredicto = await decide(qname, rules);
  console.log(veredicto);

  if (veredicto.status === false){
    console.log(`Bloqueado: ${qname}`);



  } else {
    console.log(`Permitido: ${qname}`);

    client.send(msg, 53, "1.1.1.1", (err) => {
      if (err) console.error(err);
      else console.log("Enviado");
    });

    client.on("message", (msg, rinfo) => {
      console.log("Respuesta recibida de:", rinfo.address);
      console.log(msg.buffer);


          
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
      offset += 2
      const qclass = msg.readUInt16BE(offset);
      offset += 2;




      const name = msg.readUInt16BE(offset);
      offset += 2;




      const type = msg.readUInt16BE(offset); offset += 2;
      const clase = msg.readUInt16BE(offset); offset += 2;
      const ttl = msg.readUInt32BE(offset); offset += 4;
      const rdlength = msg.readUInt16BE(offset); offset += 2;

      let rdata;


      // no quiero ponerlo en funciones voy a dejarlo todo junto, al menos por ahora, es para entender y asi
      if (type === 1 && rdlength === 4) {
        rdata = msg.readUInt32BE(offset);
        console.log(`${msg.readUInt8(offset)}.${msg.readUInt8(offset+1)}.${msg.readUInt8(offset+2)}.${msg.readUInt8(offset+3)}`);

        offset += rdlength;
      } else if (type === 28 && rdlength === 16) {
        rdata = msg.subarray(offset, offset + 16); // Buffer de 16 bytes

        const parts = [];
        for (let i = 0; i < 16; i += 2) {
          parts.push(msg.readUInt16BE(offset + i).toString(16));
        }
        const todo = parts.join(":"); 
        console.log(todo);

        offset += rdlength;


      } else if (type === 5) {

        /*
        www.example.com NO tiene IP propia.
        Su nombre real es example.cdn.net.
        Pregunta ahora por ESE nombre.
        */


        rdata = msg.subarray(offset, offset + rdlength); // bytes crudos del nombre
        offset += rdlength;

        // todavia no quiero hacer la interpretacion de este tipo


      }
      


/*
      console.log(`name: ${name}`);
      console.log(`type: ${type}`);
      console.log(`clase: ${clase}`);
      console.log(`ttl: ${ttl}`);
      console.log(`rdlength: ${rdlength}`);
      console.log(`rdate: ${rdata}`);*/

    });
  }
  
  






});





































server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});





server.bind(5533, '127.0.0.1');
// Prints: server listening 0.0.0.0:41234
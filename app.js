const dgram = require('node:dgram');
const server = dgram.createSocket('udp4');
const client = dgram.createSocket("udp4");
const {decide} = require('./core/normalize');
const rules = require('./data/rules.json');


process.on("warning", (w) => {
  console.error("⚠️ WARNING:", w.name);
  console.error(w.message);
  console.error(w.stack);
});


server.on("message", async (msg, rinfo) => {
  const clientAddress = rinfo.address;
  const clientPort = rinfo.port;

  const labels = [];

  try{    
    let offset = 12;               
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
  } catch (err){
    console.error("Error parsing QNAME:", err);
    return;
  }

  
  const qname = labels.join(".");
  const veredicto = await decide(qname, rules);
  console.log(veredicto);




  if (veredicto.status === false){
    console.log(`Bloqueado: ${qname}`);

    const resp = Buffer.alloc(12); 

    // id - lo dejamos igual
    resp[0] = msg[0];
    resp[1] = msg[1];

    //flags de bloqueo
    resp[2] = 0x81;
    resp[3] = 0x85;

    // QDCOUNT  - lo dejamos igual
    resp[4] = msg[4];
    resp[5] = msg[5];

    //contadores de answers en cero - Bloqueo minimalista: no hay respuestas.
    resp[6] = 0; resp[7] = 0;    
    resp[8] = 0; resp[9] = 0;    
    resp[10] = 0; resp[11] = 0;  

    let newOffset = 12;

    while (true) {
      const len = msg[newOffset];  
      newOffset += 1;              
      if (len === 0) break; 
      newOffset += len;           
    }

    const questionEnd = newOffset + 4; 
    const question = msg.slice(12, questionEnd);
    const denied = Buffer.concat([resp, question]);

    server.send(denied, clientPort, clientAddress, (err) => {
      if (err) console.error(err);
    });  



  } else {
    console.log(`Permitido: ${qname}`);

    client.send(msg, 53, "1.1.1.1", (err) => {
      if (err) console.error(err);
    });

    
    client.on("message", (msg) => {
      //console.log("Respuesta recibida del dns real o", rinfo.address);
      /*if (type === 1 && rdlength === 4) {
      } else if (type === 28 && rdlength === 16) {
      } else if (type === 5) {
      }*/
      server.send(msg, clientPort, clientAddress, (err) => {
        if (err) console.error(err);
      });
    });







  }
});


server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});


server.on('error', (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});


server.bind(53, '127.0.0.1');

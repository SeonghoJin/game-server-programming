const net = require('net');

let num = 500000;

const client = net.createConnection({port: 3000, host: 'localhost'}, () => {
    console.log('connected to server!!');
    for(let i = 0; i < 10000000000; i++){
        client.write(`${i}\n`.repeat(num));
        console.log(client.writableLength);
    }
    client.set

  }).on('data', (data) => {
    console.log(data.toString());
  }).on('end', () => {
    console.log("closed");
  }).on('error', (e) => {
    console.log(e.message);
  })
const net = require('net');

const server = net.createServer((req) => {
  req.on('data', (data) => {
    console.log(data.toString());
  })
}).on('error', (err) => {
  console.log(err.message);
});

server.listen(3000, 'localhost', () => {
  console.log("start server", server.address());
});
const fs = require("fs");
const http = require('http');

const sock = require('./socket.js');

const wsport = 8888;
const httpport = 8081;

//server configuration
const server = new http.createServer(function (req, res){
  let code = 200;
  let time = (new Date()).toISOString();

  if (req.method === 'GET' && req.url === '/') {
    fs.createReadStream('www/index.html').pipe(res);
  } else {
    code = 404;
    res.writeHead(code);
    res.end();
  }
  console.log('[' + code + '][' + time + '] ' + req.headers['user-agent']);
});

sock.NewSockServer({
  port: wsport,
  server: server,
  path: '/requests',
});

server.listen(httpport);

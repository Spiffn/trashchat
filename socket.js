const WebSocket = require('ws');

/*
  Bidirectional Packet Structure
  {
    command: <number>,
    payload: <string>,
  }
*/
const server_command = {
  NEW_POST: 0,
  NEW_USER: 1,
  DEL_USER: 2,
  USERLIST: 3
};

const client_command = {
  PUSH_POST: 0
};

/*
  config -> {
    port: <number> port number
    server: <http.Server> server object
    path: <string> request path whitelist
  }
*/
exports.NewSockServer = function(config) {
  this.users = {};
  this.wss = new WebSocket.Server({
      port: config['port'],
      server: config['server'],
      path: config['path'],
      clientTracking: true
  });

  this.wss.broadcast = function broadcast(comm, payload) {
    exports.wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serialize(comm, payload));
      }
    });
  }

  this.wss.on('connection', function (ws) {
    //watch order of operation here. It's intentional.
    let userlist = Object.keys(exports.users);
    let useridx = userlist.length + 1;
    let username = 'user_' + useridx;

    ws.send(serialize(server_command.USERLIST, {name: username,list: userlist}));

    exports.users[username] = true;

    ws.on('close', function close(code, reason) {
      delete exports.users[username];
      exports.wss.broadcast(server_command.DEL_USER, username);
    });

    ws.on('message', function incoming(data) {
      let packet = deserialize(data);
      if (typeof packet.command === "undefined") {
        delete exports.users[username];
        ws.terminate();
        exports.wss.broadcast(server_command.DEL_USER, username);
        return;
      }

      switch (packet.command) {
        case client_command.PUSH_POST:
          if (typeof packet.payload === "string") {
            let payload = sanitize(username + ': ' + packet.payload);
            exports.wss.broadcast(server_command.NEW_POST, payload);
          }
          break;
        default:
          delete exports.users[username];
          ws.terminate();
          exports.wss.broadcast(server_command.DEL_USER, username);
      }
    });

    exports.wss.broadcast(server_command.NEW_USER, username);
  });
}

function sanitize(html) {
  return html.substring(0,512).replace('/<[^>]+>/g', '');
}

function serialize(command, payload) {
  let data = { command: command };
  if (typeof payload !== "undefined") {
    data['payload'] = payload;
  }
  return JSON.stringify(data);
}

function deserialize(data) {
  return JSON.parse(data);
}

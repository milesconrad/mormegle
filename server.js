const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const winston = require('winston');
const expressWinston = require('express-winston');
const queuedUsers = {};
const interestUsers = {};

io.on('connection', (socket) => {

  socket.on('join', (interest) => {
    queuedUsers[socket.id] = socket;
    if (Object.keys(queuedUsers).length >= 2) {
      const userids = Object.keys(queuedUsers);
      const user1 = queuedUsers[userids[0]];
      const user2 = queuedUsers[userids[1]];
      delete queuedUsers[userids[0]];
      delete queuedUsers[userids[1]];

      user1.partner = user2;
      user2.partner = user1;
      user1.emit('partnered');
      user2.emit('partnered');
    };
  });

  socket.on('send', (length) => {
    socket.partner.emit('send', length);
  });

  socket.on('disconnect', () => {
    if (socket.partner) {
      socket.partner.emit('abandoned');
    }
    if (queuedUsers[socket.id]) {
      delete queuedUsers[socket.id];
    }
  });
});

app.use(expressWinston.logger({
  transports: [new winston.transports.Console()],
  meta: false,
  level: false,
  msg: '{{req.socket.remoteAddress}} {{req.method}} {{req.url}}',
}));

app.get('./', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static('srv/'));

http.listen(8080, () => {
  console.log('listening on port 8080');
});
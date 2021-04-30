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
    interest = interest.toLowerCase();
    if (interest) {

      // if there is another interested user in the waiting room and they share
      // interests, remove them from the waiting room and partner them
      if (Object.keys(interestUsers).length > 0 && interestUsers[interest]) {
        const user1 = interestUsers[interest];
        const user2 = socket;
        delete interestUsers[interest];

        user1.partner = user2;
        user2.partner = user1;
        user1.emit('partnered');
        user2.emit('partnered');
      }

      // if there are not enough users in the waiting room or none of them share
      // interests, add the current user to the waiting room
      else {
        interestUsers[interest] = socket;
      };
    };

    if (!interest) {

      // if there is another user in the waiting room, remove them from the waiting
      // room and partner them
      if (Object.keys(queuedUsers).length > 0) {
        const userids = Object.keys(queuedUsers);
        const user1 = queuedUsers[userids[0]];
        const user2 = socket;
        delete queuedUsers[userids[0]];

        user1.partner = user2;
        user2.partner = user1;
        user1.emit('partnered');
        user2.emit('partnered');
      }

      // if there are no other users in the waiting room, add the current user to
      // the waiting room
      else {
        queuedUsers[socket.id] = socket;
      };
    };
  });

  socket.on('send', (duration) => {
    socket.partner.emit('send', duration);
  });

  socket.on('disconnect', () => {

    // if the user disconnected, let their partner know
    if (socket.partner) {
      socket.partner.emit('abandoned');
    }
    
    // if the user disconnected while in the waiting room, remove them from the waiting room
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
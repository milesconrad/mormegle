const socket = io();
const join = document.getElementById('join');
const telegraph = document.getElementById('telegraph');
const audio = new AudioContext();
let begin;
let end;
let d;

socket.on('abandoned', function() {
    telegraph.style.backgroundColor = '#741818';
    telegraph.innerHTML = 'Stranger has disconnected';
});

socket.on('partnered', function() {
    telegraph.innerHTML = 'Say hi!';
    document.getElementById('help').hidden = false;
});

socket.on('send', function(duration) {
    duration = duration / 1000;
    (new SoundPlayer(audio)).play(440.0, 0.3, "sine").stop(duration);
});

join.addEventListener('click', function() {
    document.getElementById('home').hidden = true;
    document.getElementById('chat').hidden = false;
    socket.emit('join', document.getElementById('interest').value)
});

telegraph.addEventListener('mousedown', function() {
    d = new Date();
    begin = d.getTime();
});

telegraph.addEventListener('mouseup', function() {
    d = new Date();
    end = d.getTime();
    socket.emit('send', end-begin);
    begin = 0;
    end = 0;
});

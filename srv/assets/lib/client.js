const socket = io();
const telegraph = document.getElementById('telegraph');
const main = document.getElementById('main');
var audio = new AudioContext();
var begin;
var end;
var d;

socket.on('abandoned', function() {
    telegraph.style.backgroundColor = '#741818';
    telegraph.innerHTML = 'Stranger has disconnected';
});

socket.on('partnered', function() {
    document.getElementById('connecting').remove();
    main.hidden = false;
});

socket.on('send', function(duration) {
    duration = duration / 1000;
    (new SoundPlayer(audio)).play(440.0, 0.3, "sine").stop(duration);
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
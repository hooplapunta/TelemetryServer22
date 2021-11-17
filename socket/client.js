//client.js
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3001', {reconnect: true});

let user = {};

// Add a connect listener
socket.on('connect', (socket) => {
    console.log('Connected!');
});

socket.on('handshake', (data) => {
    socket.emit('register', {name: 'test', room: 'alpha'});
});

socket.on('register', (data) => {
    console.log('registered');
    let user = data;
    console.log(data);

    // socket.emit('uiasim', 'test');
    socket.emit('uiasim', {'event': 'start', 'user': user.name, 'room': user.room});

    // Start the heartbeat
    // emitHb();
});

socket.on('uiasim', (data) => {
    console.log(`${data.evt} ${data.msg}`);
    // socket.emit('uiatoggle', {'event': 'start', 'user': user.name, 'room': user.room});
});

// socket.volatile.emit('heartbeat', (answer) => {
//     console.log(`SUITSHB- ${answer}`);
// });

socket.on('heartbeat', (data) => {
    console.log(data);
});

function emitHb() {
    console.log('sending hb');
    socket.emit('heartbeat', user);

    setTimeout(emitHb, 3000);
}

socket.on('disconnect', () => {
    console.log('Disconnected');
});

socket.on('err', (data) => {
    console.warn(data.msg);
})

socket.emit('roomjoin', (data) => {
});

//socket.emit('CH01', 'me', 'test msg');
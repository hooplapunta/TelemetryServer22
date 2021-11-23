//client.js
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3001', {reconnect: true});

let user = {};

// Add a connect listener
socket.on('connect', (socket) => {
    console.log('Connected!');
});

socket.on('handshake', (data) => {
    socket.emit('register', {name: 'test', room: 'beta'});
});

socket.on('register', (data) => {
    console.log('registered');
    let user = data;
    console.log(data);

    // 1. CREATE SIMULATION for ROOM
    socket.emit('uiasim', {event: 'start', user: user.name, room: user.room});

    // Start the heartbeat
    // emitHb();
});

// UIA Simulation Test
socket.on('uiasim', (data) => {
    console.log(`${data.evt} ${data.msg}`);

    // START UIA SIM
    socket.emit('uiatoggle', {event: 'start', user: user.name, room: user.room});

    // PAUSE UIA SIM
    setTimeout(() => {
        socket.emit('uiatoggle', {event: 'pause', user: user.name, room: user.room});
        console.log('PAUSE SIM');
    }, 2000);

    // UNPAUSE UIA SIM
    setTimeout(() => {
        socket.emit('uiatoggle', {event: 'unpause', user: user.name, room: user.room});
        console.log('UPAUSE SIM');
    }, 4000);

    setTimeout(() => {
        socket.emit('uiatoggle', {event: 'stop', user: user.name, room: user.room});
        console.log('STOP SIM');
    }, 8000);
});

socket.on('uiadata', (data) => {
    console.log(`UIA data: ${JSON.stringify(data)}`);
});

socket.on('uiacontrols', (data) => {
    console.log(`UIA controls: ${JSON.stringify(data)}`);
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
//client.js
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3001', {reconnect: true});

// Add a connect listener
socket.on('connect', (socket) => {
    console.log('Connected!');
});

socket.on('ack', (data) => {
    console.log(data);
    socket.emit('register', {name: 'test', room: 'alpha'}, (data) => {
        console.log(`Registering...`); 
        console.log(data);
    });
});

socket.on('register', (data) => {
    console.log('registered');
    console.log(data);
});

socket.on('disconnect', () => {
    console.log('Disconnected');
});

socket.on('err', (data) => {
    console.warn(data.msg);
})

socket.emit('roomjoin', (data) => {
});

//socket.emit('CH01', 'me', 'test msg');
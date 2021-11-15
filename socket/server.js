const env = require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').Server(app);
// const server = http.createServer(app);
// const { Server } = require("socket.io");
const io = require('socket.io')(http); // new Server(server);
const db = require('../utils/jsondb');
const dbsetup = require('../setup.json');
const { info } = require('console');
// const evaSimulation = require('../simulations/evasimulation-rt');

let clients = [];
let roomDBs = [];
let suitsDb;

app.get('/', (req, res) => {
  res.status(200).send({ ok: true, msg: 'Socket Server Online' });
});

io.on('connection', (socket) => {
    console.log(socket.id);
    console.log('a user connected');
    socket.emit('connected', 'hello there');

    socket.emit('ack', socket.id);

    // Create a user
    socket.on('register', (data) => {
        
        console.log('data:');
        console.log(data.room);

        if(data.room === undefined && data.room === '') {
            socket.emit(`err`, { ok: false, event: 'register', msg: 'room name required' });
        } else if(data.name === undefined && data.name === '') {
            socket.emit(`err`, { ok: false, event: 'register', msg: 'name required' });
        } else {
            let client = {id: clients.length + 1, siid: socket.id, name: data.name, room: data.room};

            clients.push(client); // Hold the client in mem
            socket.emit(`register`, client); // Send the client their info
        }
        
    });
});

http.listen(3001, () => {
    console.log('listening on *:3001');
});

function loadConfig() {
    console.log('Loading database content');

    if(process.env.SUITS_LOG_LEVEL === 2) {
        console.log(`SUITS-TS Configuration::\n${dbsetup}`);
    }

    // Build DB for each room in setup
    dbsetup['rooms'].forEach( async (room, ridx) => {
        console.log(`Creating DB: ${room.name}`);
        roomDBs.push({ 
            uid: room.uid,
            name: room.name, 
            db: await new db(room)
        });

        await Object.keys(dbsetup).forEach(async (key, idx) => {
            if(process.env.SUITS_LOG_LEVEL === 2) {         
                console.log(`Loading data for:: ${key}`);
            }
            if(key !== 'rooms') {
                console.log(db);
                await roomDBs[ridx].db.write(key, dbsetup[key]);
            }
        }); 
        
    });
}

// server.listen(process.env.SUITS_TS_SOCKET_PORT | 3001, () => {
//     //suitsDb = new db(__dirname);
//     loadConfig();
// });

// server.on("connection", (socket) => {
//     console.log('A client joined!');
  
//     // or with emit() and custom event names
//     // socket.emit("greetings", "Hey!", { "ms": "jane" }, Buffer.from([4, 3, 3, 1]));
//     // socket.emit('connect', JSON.stringify({ ok: true, "msg": "Connected!"}));
//     socket.emit('connected', 'Hello from the otherside');
  
//     // handle the event sent with socket.send()
//     socket.on("message", (data) => {
//       console.log(data);
//     });
  
//     // handle the event sent with socket.emit()
//     socket.on("salutations", (elem1, elem2, elem3) => {
//       console.log(elem1, elem2, elem3);
//     });
// });

// server.on("joinroom", (data) => {
//     console.log(data);
// });
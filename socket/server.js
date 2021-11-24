const env = require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').Server(app);
// const cors = require('cors');

// const server = http.createServer(app);
// const { Server } = require("socket.io");
const io = require('socket.io')(http, {
    cors: {
        origin: "*:*",
        methods: ["GET", "POST"],
        credentials: false
    }
});

// io.set('origins', '*localhost:3001');

const db = require('../utils/jsondb');
const dbsetup = require('../setup.json');
const { info } = require('console');

// Require Simulations
const UIASimulationRT = require('../simulations/uiasimulation-rt');
const EVASimulationRT = require('../simulations/evasimulation-rt');
// END Require Simulations

let moment = require('moment');
const e = require('express');

let socketStart = new moment();
let clients = [];
let roomDBs = [];

let pushUIANotifier;
let pushUIAControlsNotifier;
let pushTelemetryNotifier;

// SIM Objects
let uiaSim;
let evaSim;

app.get('/', (req, res) => {
  res.status(200).send({ ok: true, msg: 'Socket Server Online' });
});

io.on('connection', (socket) => {
    console.log(socket.id);
    console.log('a user connected');
    socket.emit('connected', 'hello there');

    // Client connected, gesture with their new ID.
    socket.emit('handshake', socket.id);

    // Create a user
    socket.on('register', (data) => {

        if(data.room === undefined && data.room === '') {
            socket.emit(`err`, { ok: false, event: 'register', msg: 'room name required' });
        } else if(data.name === undefined && data.name === '') {
            socket.emit(`err`, { ok: false, event: 'register', msg: 'name required' });
        } else {
            let client = {id: clients.length + 1, siid: socket.id, name: data.name, room: data.room};

            console.log(`--Client Joining Room ${data.room}--`);
            socket.join(data.room); // Join the room
            clients.push(client); // Hold the client in mem
            socket.emit(`register`, client); // Send the client their info
        }
    });

    // Return available rooms on request
    socket.on('getrooms', (data) => {
        socket.emit('getrooms', roomDBs);
    });
    
    let roomDB;

    // START UIA SIM Events
    socket.on('uiasim', (data) => {        
        let client = clients.find( x => x.siid === socket.id);
        roomDB = roomDBs.find( x => x.name === data.room);

        if(roomDB !== undefined) {
            console.log('----------Simulation Creation Event Called----------');
            uiaSim = new UIASimulationRT(roomDB);

            // Send SIM Created Event to User In Room
            io.in(data.room).emit('uiasim', { evt: 'simstart', msg: `Simulation started by - ${client.id}-${client.name}-${client.siid}` });
        } else {
            console.warn(`DB Not found!`);
        }
    });

    socket.on('uiatoggle', data => {
        switch(data.event) {
            case 'start':
                uiaSim.uiaStart();
                pushUIA(roomDB);
                break;
            case 'pause':
                uiaSim.pause();
                stopPushUIA();
                break;
            case 'unpause':
                uiaSim.unpause();
                pushUIA(roomDB);
                break;
            case 'stop':
                uiaSim.stop();
                stopPushUIA();
                break;
        }
    });

    // Accepts target (e.g. target='emu1') & enable (e.g. enable = true)
    socket.on('uiacontrol', data => {
        console.log(uiaSim);
        uiaSim.setUIAControls(data);
    });

    // END UIA SIM EVENTS

    // START EVA SIM EVENTS

    socket.on('evasim', (data) => {        
        let client = clients.find( x => x.siid === socket.id);
        roomDB = roomDBs.find( x => x.name === data.room);

        if(roomDB !== undefined) {
            console.log('----------EVA Simulation Creation Event Called----------');
            evaSim = new EVASimulationRT(roomDB);

            // Send SIM Created Event to User In Room
            io.in(data.room).emit('evasim', { evt: 'simstart', msg: `EVA Simulation started by - ${client.id}-${client.name}-${client.siid}`});
        } else {
            console.warn(`DB Not found!`);
        }
    });

    socket.on('evatoggle', data => {
        switch(data.event) {
            case 'start':
                evaSim.start();
                pushTelemetry(roomDB);
                break;
            case 'pause':
                evaSim.pause();
                stopPushTelemetry();
                break;
            case 'unpause':
                evaSim.unpause();
                pushTelemetry(roomDB);
                break;
            case 'error':
                evaSim.unpause();
                // pushUIA(roomDB);
                break;
            case 'resolve':
                evaSim.unpause();
                // pushUIA(roomDB);
                break;
            case 'stop':
                evaSim.stop();
                stopPushTelemetry();
                break;
        }
    });

    socket.on('evaerror', (data) => {
        console.log(`EVAErr in room ${roomDB.name}: ${data.key} - ${data.val}`);
        let failure = roomDB.db.get('eva-failure');
        failure[data.key] = data.val;
        roomDB.db.write(failure);
    });

    // END EVA SIM EVENTS

    // DATA EVENTS
    socket.on('getclients', (data) => {
        socket.volatile.emit('getclients', { clients });
    });

    socket.on('heartbeat', data => {
        console.log('Received Heartbeat');
        socket.volatile.emit('heartbeat', { ok: true, u: data.siid, t: new moment()});
    });

    socket.on('disconnect', data => {
        console.log('Client disconnected ' + socket.id);

        // remove the client
        let clientIdx = clients.findIndex(x => x.siid === socket.id);
        clients.splice(clientIdx, 1);
    });
});

function pushUIA(roomDB) {
    pushUIANotifier = setInterval(() => {
        // Sends UIA Data and Controls to room-based listeners of 'uiadata' and 'uiacontrols'
        io.in(roomDB.name).emit('uiadata', roomDB.db.get('uia-simulation'));
        io.in(roomDB.name).emit('uiacontrols', roomDB.db.get('uia-simstate'));
    }, 1000);
}

// Terminates Push Interval
function stopPushUIA() {
    clearInterval(pushUIANotifier);
}

function pushTelemetry(roomDB) {
    pushTelemetryNotifier = setInterval(() => {
        io.in(roomDB.name).volatile.emit('evadata', roomDB.db.get('eva-state'));
        io.in(roomDB.name).volatile.emit('evacontrol', roomDB.db.get('eva-controls'));
        io.in(roomDB.name).volatile.emit('evafailure', roomDB.db.get('eva-failure'));
    }, 1000);
}

function stopPushTelemetry() {
    clearInterval(pushTelemetryNotifier);
}


http.listen(3001, () => {
    console.log('listening on *:3001');
    loadConfig();
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
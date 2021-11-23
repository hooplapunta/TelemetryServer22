const { simulationStepUIA } = require('../telemetry/uia_telemetry');
const { v4: uuidv4 } = require('uuid');

class UIASimulationRT {

    simTimer = null;
    tick = null;
    uiaID= null;
    uiaSimStateID = null;
    lastTimestamp = null;

    rmDB = null;
    uiaSimState = {};
    uia = {};
    simstateKey = 'uia-simstate';
    simKey = "uia-simulation";

    constructor(roomDB) {
        this.rmDB = roomDB;

        // Gets the initial data object from the JSON db.
        this.simState = this.rmDB.db.get(this.simstateKey);
        // console.log(this.simState);
    }

    isRunning() {
        // return uiaSimStateID !== null && uiaID !== null
        // this.dataObject.is_running = true;
        console.log("SimRunStatus: " + this.uiaSimState.is_running);
        return this.uiaSimState.is_running;   
    }

    isPaused() {
        this.simTimer == null;

        return this.uiaSimState.is_paused;
    }

    async uiaStart(){
        if (this.isRunning()){
            throw new Error('Simulation is already in progress')
        }
        try{
            this.uiaID = uuidv4();
            console.log('UIA ID: ' + this.uiaID);

            // Set the updated SimulationUIA
            this.uia = {
                _id: this.uiaID,
                is_running: true,
                is_paused: false,
                started_at: new Date(),
                emu1: false,
                ev1_supply: false,
                ev1_waste: false,
                emu1_O2: false,
                emu2: false,
                ev2_supply: false,
                ev2_waste: false,
                emu2_O2: false,
                O2_vent: false,
                depress_pump: false,
            };

            this.uiaSimState = {
                _id: uuidv4(),
                is_running: true,
                is_paused: false,
                started_at: new Date(),
                emu1: 'OFF',
                emu2: 'OFF',
                o2_supply_pressure1: 29,
                o2_supply_pressure2: 29, 
                ev1_supply: 'CLOSE',
                ev2_supply: 'CLOSE',
                ev1_waste: 'CLOSE',
                ev2_waste: 'CLOSE',
                emu1_O2: 'CLOSE',
                emu2_O2: 'CLOSE',
                oxygen_supp_out1: 0,
                oxygen_supp_out2: 0,
                O2_vent: 'CLOSE',
                depress_pump: 'FAULT'
            };

            // Write data to the DB
            await this.rmDB.db.write('uia-simulation', this.uia);
            await this.rmDB.db.write('uia-simstate', this.uiaSimState);

            console.log('--------------UIA Simulation Started--------------')
            this.lastTimestamp = Date.now();
            this.simTimer = setInterval(() => { this.uiaStep(); }, 1000);
        }
        catch (error){
            console.error('failed to start create controls and state');
            console.error(error.toString());
            throw error; 
        }
    }

    pause() {
        if (!this.isRunning() || this.isPaused()) {
            throw new Error('Cannot pause: simulation is not running or it is running and is already paused')
        }
        console.log('--------------UIA Simulation Paused-------------')
        // this.uiaSimState.is_running = false;
        this.uiaSimState.is_paused = true;
        this.rmDB.db.write('uia-simstate', this.uiaSimState);

        clearInterval(this.simTimer)
        this.simTimer = null 
        this.lastTimestamp = null
    }

    unpause() {
        if (!this.isRunning() || !this.isPaused()) {
            throw new Error('Cannot unpause: simulation is not running or it is running and is not paused')
        }
        console.log('--------------UIA Simulation Resumed-------------');
        this.uiaSimState.is_paused = !this.uiaSimState.is_paused;
        this.rmDB.db.write('uia-simstate', this.uiaSimState);

        this.lastTimestamp = Date.now()
        this.simTimer = setInterval(() => { this.uiaStep(); }, 2000);
    }

    //TODO: Do we need a stop? 
    stop() {
        if (!this.isRunning()) {
            throw new Error('Cannot stop: simulation is not running')
        }
        console.log('-------------- UIA Simulation Stopped-------------')
        this.uiaSimState.is_running = false;
        this.uiaSimState.is_paused = false;
        this.uia.uiaID = null;

        clearInterval(this.simTimer);

        this.simTimer = null; 
        this.lastTimestamp = null;

        this.rmDB.db.write('uia-simstate', this.uiaSimState);
    }

    async getUIAState() {
        const simState = await this.rmDB.get(this.simstateKey); // SimulationStateUIA.findById(uiaSimStateID).exec()
        return simState
    }
    async getUIAControls() {
        const controls = this.rmDB.get(this.simKey); // await SimulationUIA.findById(uiaID).exec()
        return controls 
    }

    async setUIAControls(newControls) {
        // const controls = await SimulationUIA.findByIdAndUpdate(uiaID, newControls, {new: true}).exec()
        this.uia[newControls.target] = newControls.enable;
        await this.rmDB.db.write('uia-simulation', this.uia);
        // return controls 
    }

    async uiaStep() {

        // console.log(this.uia);
        this.tick++;
        console.log('tick:: ' + this.tick);

        try {
            let uiaSimState = this.uiaSimState;
            let uiaControls = this.uia;

            // const hold = await SimulationHold.findById(holdID).exec()

            const now = Date.now();
            const dt = now - this.lastTimestamp; 
            this.lastTimestamp = now;

            const newSimState = simulationStepUIA(dt, uiaControls, uiaSimState);
            console.log(newSimState);
            Object.assign(uiaSimState, newSimState);

            this.rmDB.db.write(this.simstateKey, uiaSimState);
            
            // await uiaSimState.save();
        }
        catch(error){
            console.error('failed error')
            console.error(error.toString())
        }
    }
}

module.exports = UIASimulationRT;
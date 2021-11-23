const { simulationStep } = require('../telemetry/eva_telemetry');

const JSONDB = require('../utils/jsondb');
class EVASimulationRT {

	simTimer = null;
	simStateID = null;
	controlID = null;
	failureID = null;
	holdID = null;
	lastTimestamp = null;

	state = null;
	control = null;
	failure = null;

	rmDB = null;

	constructor(roomDB) {
		this.rmDB = roomDB;

		// Gets the initial data object from the JSON db.
        this.state = this.rmDB.db.get('eva-state');
		this.control = this.rmDB.db.get('eva-controls');
		this.failure = this.rmDB.db.get('eva-failure');
	}

	isRunning() {
		return this.control.running;
		// return simStateID !== null && controlID !== null && failureID !== null
		// return simStateID !== null && controlID !== null && failureID !== null && holdID !== null
	}

	isPaused() {
		simTimer == null;

		return this.control.paused;
	}

	async start() {
		if (this.isRunning()){
			throw new Error('Simulation is already in progress')
		}
		try {
			const started_at = new Date();
			this.state = {
				time: 0,
				timer: '00:00:00', 
				started_at,
				heart_bpm: 0,
				p_sub: 0,
				p_suit: 0, 
				t_sub: 0,
				v_fan: 0,
				p_o2: 0,
				rate_o2: 0,
				batteryPercent: 100,
				battery_out: 100, 
				cap_battery: 0, 
				t_battery: '00:00:00',
				p_h2o_g: 0,
				p_h2o_l: 0,
				p_sop: 0,
				rate_sop:0 ,
				t_oxygenPrimary: 100,
				t_oxygenSec: 100,
				ox_primary: 100,
				ox_secondary: 100, 
				t_oxygen: '00:00:00',
				cap_water: 100,
				t_water: '00:00:00'
			};

			this.control = {
				//names are temporary... change when switch functions are decided
				started_at,
				running: true,
				paused: false,
				fan_switch: false,
				suit_power: false,
				o2_switch: false,
				aux: false,
				rca: false,
				pump: false,
			};

			this.failure = {
				started_at,
				o2_error: false,
				pump_error: false,
				power_error: false,
				fan_error: false,
			};

			this.rmDB.db.write('eva-state', this.state);
			this.rmDB.db.write('eva-controls', this.control);
			this.rmDB.db.write('eva-failure', this.failure);

			console.log('--------------Simulation Started--------------');
			this.lastTimestamp = Date.now();
			this.simTimer = setInterval(() => {this.step(); }, 1000);
		}
		catch (error){
			console.error('failed to start create controls and state')
			console.error(error.toString())
			throw error 
		}
	}

	pause() {
		if (!this.isRunning() || this.isPaused()) {
			throw new Error('Cannot pause: simulation is not running or it is running and is already paused')
		}
		console.log('--------------Simulation Paused-------------');
		this.control.paused = true;
        this.rmDB.db.write('eva-controls', this.control);

		clearInterval(this.simTimer)
		this.simTimer = null 
		this.lastTimestamp = null
	}

	unpause() {
		if (!this.isRunning() || !this.isPaused()) {
			throw new Error('Cannot unpause: simulation is not running or it is running and is not paused');
		}
		console.log('--------------Simulation Resumed-------------');

		this.control.paused = !this.control.paused;
        this.rmDB.db.write('eva-control', this.control);

		this.lastTimestamp = Date.now();
		this.simTimer = setInterval(() => { this.step(); }, 1000);
	}

	//TODO: Do we need a stop? 
	stop() {
		if (!this.isRunning()) {
			console.log('running: ' + this.isRunning);
			throw new Error('Cannot stop: simulation is not running')
		}
		console.log('--------------Simulation Stopped-------------')
		// simStateID = null;
		// controlID = null;
		clearInterval(this.simTimer);
		this.simTimer = null; 
		this.lastTimestamp = null;
	}

	async getState() {
		// const simState = await SimulationState.findById(simStateID).exec();
		let simState = await this.rmDB.db.get('eva-state');
		return simState;
	}
	async getControls() {
		// const controls = await SimulationControl.findById(controlID).exec();
		let controls = await this.rmDB.db.get('eva-controls');
		return controls;
	}

	async getFailure() {
		// const failure = await SimulationFailure.findById(failureID).exec();
		let failure = await this.rmDB.db.get('eva-failure');
		return failure
	}

	async setFailure(newFailure) {
		// const failure = await SimulationFailure.findByIdAndUpdate(failureID, newFailure, {new: true}).exec();		
		this.failure[newFailure.target] = newFailure.enable;
        await this.rmDB.db.write('eva-failure', this.failure);
	}

	async setControls(newControls) {
		// const controls = await SimulationControl.findByIdAndUpdate(controlID, newControls, {new: true}).exec()
		this.control[newControls.target] = newControls.enable;
        await this.rmDB.db.write('eva-controls', this.control);
	}

	async step(){
		try{
			const simState = this.state; // await SimulationState.findById(simStateID).exec()
			const controls = this.control; // await SimulationControl.findById(controlID).exec()
			const failure  = this.failure; // await SimulationFailure.findById(failureID).exec()

			const now = Date.now();
			const dt = now - this.lastTimestamp; 
			this.lastTimestamp = now;
			const newSimState = simulationStep(dt, controls, failure, simState);
			console.log(newSimState);
			Object.assign(simState, newSimState);
			this.rmDB.db.write('eva-state', simState);
			// await simState.save();
		}
		catch(error){ 
			console.error('failed error')
			console.error(error.toString())
		}
	}
}

module.exports = EVASimulationRT;
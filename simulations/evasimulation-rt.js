var mongoose = require('mongoose');
const { simulationStep } = require('../telemetry/eva_telemetry');
var SimulationState = mongoose.model('SimulationState');
var SimulationControl = mongoose.model('SimulationControl');
var SimulationFailure = mongoose.model('SimulationFailure');

const JSONDB = require('../utils/jsondb');
class EVASimulationRT {

	simTimer = null;
	simStateID = null;
	controlID = null;
	failureID = null;
	holdID = null;
	lastTimestamp = null;

	constructor(room) {
		
	}

	isRunning() {
		return simStateID !== null && controlID !== null && failureID !== null
		//return simStateID !== null && controlID !== null && failureID !== null && holdID !== null
	}

	isPaused() {
		return simTimer == null
	}

	async start() {
		if (isRunning()){
			throw new Error('Simulation is already in progress')
		}
		try {
			const started_at = new Date()
			const state = await SimulationState.create({
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
			
			})
			simStateID = state._id 
			const controls = await SimulationControl.create({
				//names are temporary... change when switch functions are decided
				started_at,
				fan_switch: false,
				suit_power: false,
				o2_switch: false,
				aux: false,
				rca: false,
				pump: false,
			})
			controlID = controls._id
			const failure = await SimulationFailure.create({
				started_at,
				o2_error: false,
				pump_error: false,
				power_error: false,
				fan_error: false,
			})
			failureID = failure._id


			console.log('--------------Simulation Started--------------')
			lastTimestamp = Date.now()
			simTimer = setInterval(step, 1000)
		}
		catch (error){
			console.error('failed to start create controls and state')
			console.error(error.toString())
			throw error 
		}
	}

	pause() {
		if (!isRunning() || isPaused()) {
			throw new Error('Cannot pause: simulation is not running or it is running and is already paused')
		}
		console.log('--------------Simulation Paused-------------')

		clearInterval(simTimer)
		simTimer = null 
		lastTimestamp = null
	}

	unpause() {
		if (!isRunning() || !isPaused()) {
			throw new Error('Cannot unpause: simulation is not running or it is running and is not paused')
		}
		console.log('--------------Simulation Resumed-------------')
		lastTimestamp = Date.now()
		simTimer = setInterval(step, 1000)
	}

	//TODO: Do we need a stop? 
	stop() {
		if (!isRunning()) {
			throw new Error('Cannot stop: simulation is not running')
		}
		console.log('--------------Simulation Stopped-------------')
		simStateID = null
		controlID = null 
		clearInterval(simTimer)
		simTimer = null 
		lastTimestamp = null
	}

	async getState() {
		const simState = await SimulationState.findById(simStateID).exec()
		return simState
	}
	async getControls() {
		const controls = await SimulationControl.findById(controlID).exec()
		return controls 
	}

	async getFailure(){
		const failure = await SimulationFailure.findById(failureID).exec()
		return failure
	}

	async setFailure(newFailure) {
		const failure = await SimulationFailure.findByIdAndUpdate(failureID, newFailure, {new: true}).exec()
		return failure
	}

	async setControls(newControls) {
		const controls = await SimulationControl.findByIdAndUpdate(controlID, newControls, {new: true}).exec()
		return controls 
	}

	async step(){
		try{
			const simState = await SimulationState.findById(simStateID).exec()
			const controls = await SimulationControl.findById(controlID).exec()
			const failure = await SimulationFailure.findById(failureID).exec()

			const now = Date.now()
			const dt = now - lastTimestamp 
			lastTimestamp = now
			const newSimState = simulationStep(dt, controls, failure, simState)
			Object.assign(simState, newSimState)
			await simState.save()
		}
		catch(error){ 
			console.error('failed error')
			console.error(error.toString())
		}
	}
}

module.exports = EVASimulationRT;
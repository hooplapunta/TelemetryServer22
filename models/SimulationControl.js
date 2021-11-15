var mongoose = require('mongoose')
var Schema = mongoose.Schema

var SimulationControlSchema = new Schema({
	started_at: { type: Date, required: true },
	//names are temporary... change when switch functions are decided
	suit_power: Boolean,
	o2_switch: Boolean,
	aux: Boolean,
	rca: Boolean,
	pump: Boolean,
	fan_switch: Boolean,
})
module.exports = mongoose.model('SimulationControl', SimulationControlSchema)

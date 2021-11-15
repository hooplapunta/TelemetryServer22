var mongoose = require('mongoose')
var Schema = mongoose.Schema

var SimulationFailure = new Schema({
	started_at: { type: Date, required: true },
	o2_error: {type: Boolean, required: true},
	pump_error: {type: Boolean, required: true},
	power_error: {type: Boolean, required: true},
	fan_error: {type: Boolean, required: true}
})
module.exports = mongoose.model('SimulationFailure', SimulationFailure)

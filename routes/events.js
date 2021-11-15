const express = require('express');
const bodyParser = require('body-parser');
require('../models/SimulationState');
require('../models/SimulationControl');
require('../models/SimulationFailure');
const simulation = require('../simulations/evasimulation');

const router = express.Router();

//Router for simulation
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());
router.use((req,res,next) => {
	res.setHeader(
		'Access-Control-Allow-Origin', '*'
	)
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-Width, Content-Type, Accept'
	)
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PATCH, DELETE, OPTIONS'
	)
	next()
});

router.post('/room/join', async (req, res) => {
	// Returns an open room ID
});

router.post('/room/leave', async (req, res) => {
	// Alternate to leaving room
});


module.exports = router


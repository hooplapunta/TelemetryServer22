const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const routes = {
	auth: require('./routes/auth'),
	locations: require('./routes/location'),
	roles: require('./routes/role'),
	rooms: require('./routes/room'),
	users: require('./routes/users'),
	simulationcontrol: require('./routes/simulationcontrol'),
	simulationstate: require('./routes/simulationstate'),
	simulationfailure: require('./routes/simulationfailure'),
	simulationstateuia: require('./routes/simulationstateuia'),
	simulationuia: require('./routes/simulationuia')
};

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// We create a wrapper to workaround async errors not being transmitted correctly.
function makeHandlerAwareOfAsyncErrors(handler) {
	return async function(req, res, next) {
		try {
			await handler(req, res);
		} catch (error) {
			next(error);
		}
	};
}

// We provide a root route just as an example
app.get('/', (req, res) => {
	res.send(`
		<h2>S.U.I.T.S. Telemetry Server 2022</h2>
		<p>Welcome!</p>
		<p>The API is running!</p>
	`);
});

// We define the standard REST APIs for each route (if they exist).
for (const [routeName, routeController] of Object.entries(routes)) {

	// Auth Stuff
	if(routeController.registerUser) {
		app.post(`/api/${routeName}/register`, 
			makeHandlerAwareOfAsyncErrors(routeController.registerUser));
	}

	// Simulation Stuff
	if(routeController.commandSim) {
		app.get(`/api/${routeName}/sim/:room/:event`,
			makeHandlerAwareOfAsyncErrors(routeController.commandSim));
	}

	if(routeController.controlSim) {
		app.get(`/api/${routeName}/simctl/:room/:control`,
			makeHandlerAwareOfAsyncErrors(routeController.controlSim));
	}

	if(routeController.failureSim) {
		app.get(`/api/${routeName}/simfail/:room/:failure`, 
			makeHandlerAwareOfAsyncErrors(routeController.failureSim));
	}


	if (routeController.getAll) {
		app.get(
			`/api/${routeName}`,
			makeHandlerAwareOfAsyncErrors(routeController.getAll)
		);
	}
	if (routeController.getById) {
		app.get(
			`/api/${routeName}/:id`,
			makeHandlerAwareOfAsyncErrors(routeController.getById)
		);
	}
	if(routeController.getByRoomId) {
		app.get(
			`/api/${routeName}/room/:room`,
			makeHandlerAwareOfAsyncErrors(routeController.getByRoomId)
		)
	}
	if(routeController.getByUserId) {
		app.get(
			`/api/${routeName}/user/:user`,
			makeHandlerAwareOfAsyncErrors(routeController.getByUserId)
		)
	}
	if (routeController.create) {
		app.post(
			`/api/${routeName}`,
			makeHandlerAwareOfAsyncErrors(routeController.create)
		);
	}
	if (routeController.update) {
		app.put(
			`/api/${routeName}/:id`,
			makeHandlerAwareOfAsyncErrors(routeController.update)
		);
	}
	if (routeController.remove) {
		app.delete(
			`/api/${routeName}/:id`,
			makeHandlerAwareOfAsyncErrors(routeController.remove)
		);
	}
}

module.exports = app;

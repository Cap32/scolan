
import nssocket from 'nssocket';
import { parsePIN } from './pin';
import observer from './observer';
import { Bridge } from 'pot-js';
import { name } from '../package.json';
import { StateEvent, PINEnv } from './constants';
import { startedLog } from './utils';

(async function () {
	const pin = process.env[PINEnv];
	const { port } = parsePIN(pin);
	let socket;
	let clipboardConnections = 0;
	let server;

	const updateState = async () => {
		const bridge = await Bridge.getByName(name, name);
		if (bridge) {
			const state = { clipboardConnections };
			await bridge.setState(state);
			socket && socket.send(StateEvent, state);
		}
	};

	const updateConnectionCount = () => {
		server.getConnections(async (err, count) => {
			if (err) { throw err; }

			console.info('connection updated:', count);
			clipboardConnections = count;
			await updateState();
		});
	};

	server = nssocket
		.createServer(async (sock) => {
			socket = sock;
			observer(socket);
			socket.on('close', updateConnectionCount);

			// await updateState();
		})
		.listen(port, () => {
			// console.info('hostId', hostId);
			// console.info('port', port);
			startedLog(pin);
		})
		.on('connection', updateConnectionCount)
	;

	await updateState();
}());

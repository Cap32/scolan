
import nssocket from 'nssocket';
import { getPort, getHostId, formatPIN } from './utils';
import observer from './observer';
import chalk from 'chalk';
import { Bridge } from 'pot-js';
import { name } from '../package.json';
import { StateEvent } from './constants';

(async function () {
	const port = await getPort();
	let socket;
	let pin;
	let clipboardConnections;
	let server;

	const updateState = async () => {
		const bridge = await Bridge.getByName(name, name);
		if (bridge) {
			const state = { clipboardConnections, pin };
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

			await updateState();
		})
		.listen(port, () => {
			const hostId = getHostId();
			pin = formatPIN(hostId, port);

			// console.info('hostId', hostId);
			// console.info('port', port);
			const styledCommand = chalk.yellow(`${name} start --pin=${pin}`);
			console.info(
				`Please run \`${styledCommand}\` on another device in the same LAN`
			);
		})
		.on('connection', updateConnectionCount)
	;
}());

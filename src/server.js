
import nssocket from 'nssocket';
import { getPort, getHostId, formatPIN } from './utils';
import observer from './observer';
import chalk from 'chalk';
import { Bridge } from 'pot-js';
import { name } from '../package.json';

(async function () {
	const port = await getPort();

	const getState = async () => {
		const bridge = await Bridge.getByName(name, name);
		if (bridge) {
			const state = await bridge.getState() || {};
			const { clipboardConnections, pin } = (state.data || {});
			return { clipboardConnections, pin };
		}
	};

	const server = nssocket
		.createServer((socket) => {
			observer(socket, { getState, isHost: true });
		})
		.listen(port, async () => {
			const hostId = getHostId();
			const pin = formatPIN(hostId, port);

			const bridge = await Bridge.getByName(name, name);
			if (bridge) {
				await bridge.setState({ pin });
			}

			// console.info('hostId', hostId);
			// console.info('port', port);
			const styledCommand = chalk.yellow(`${name} start --pin=${pin}`);
			console.info(
				`Please run \`${styledCommand}\` on another device in the same LAN`
			);
		})
	;

	server
		.on('connection', () => {
			server.getConnections(async (err, count) => {
				if (err) { throw err; }

				console.info('Connect success');
				console.info('Client(s): ' + count);

				const bridge = await Bridge.getByName(name, name);
				if (bridge) {
					await bridge.setState({ clipboardConnections: count });
				}
			});
		})
	;
}());

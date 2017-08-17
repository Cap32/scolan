
import nssocket from 'nssocket';
import { getPort, getHostId, formatPIN } from './utils';
import observer from './observer';
import chalk from 'chalk';
import { Bridge } from 'pot-js';

(async function () {
	const port = await getPort();
	const server = nssocket
		.createServer(function (socket) {
			observer(socket);
		})
		.listen(port, function () {
			const hostId = getHostId();
			const pin = formatPIN(hostId, port);

			// console.info('hostId', hostId);
			// console.info('port', port);
			const styledCommand = chalk.yellow('cap start --pin=' + pin);
			console.info(`Please run \`${styledCommand}\` on another device`);
			console.info(`Make sure all devices are on the same LAN`);
		})
	;

	server
		.on('connection', function () {
			server.getConnections(async function (err, count) {
				if (err) { throw err; }

				console.info('Connect success');
				console.info('Client(s): ' + count);

				const bridge = await Bridge.getByName('cap', 'cap');

				if (bridge) {
					await bridge.setState({ clipboardConnections: count });
				}
			});
		})
	;
}());

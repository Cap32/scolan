
import nssocket from 'nssocket';
import { parsePIN } from './pin';
import observer from './observer';
import { Bridge } from 'pot-js';
import { name } from '../package.json';
import { StateEvent, ConfigEnv } from './constants';

(async function () {
	const config = JSON.parse(process.env[ConfigEnv] || '{}');
	const pin = (config.pin || '').toUpperCase();
	const { host, port } = parsePIN(pin);

	const setState = async (state) => {
		const bridge = await Bridge.getByName(name, name);
		if (bridge) {
			await bridge.setState(state);
		}
	};

	const resetState = async () => {
		await setState({ clipboardConnections: 0 });
	};

	// console.info('pin', pin);
	// console.info('port', port);
	// console.info('host', host);

	const socket = new nssocket.NsSocket({
		reconnect: true,
		type: 'tcp4',
	});

	observer(socket);
	socket.connect(port, host);

	socket.data(StateEvent, setState);

	socket.on('start', resetState);
	socket.on('close', resetState);
}());

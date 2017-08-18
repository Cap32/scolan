
import nssocket from 'nssocket';
import { parsePIN, setHostId } from './utils';
import observer from './observer';
import { Bridge } from 'pot-js';
import { name } from '../package.json';
import { StateEvent } from './constants';

(async function () {
	const config = JSON.parse(process.env.CAP_CONFIG || '{}');
	const pin = (config.pin || '').toUpperCase();
	const { hostId, serverPort } = parsePIN(pin);
	const host = setHostId(hostId);

	const setState = async (state) => {
		const bridge = await Bridge.getByName(name, name);
		if (bridge) {
			await bridge.setState(state);
		}
	};

	const resetState = async () => {
		await setState({ pin, clipboardConnections: 0 });
	};

	// console.info('pin', pin);
	// console.info('hostId', hostId);
	// console.info('serverPort', serverPort);
	// console.info('host', host);

	const socket = new nssocket.NsSocket({
		reconnect: true,
		type: 'tcp4',
	});

	observer(socket);
	socket.connect(serverPort, host);

	socket.data(StateEvent, setState);

	socket.on('start', resetState);
	socket.on('close', resetState);
}());

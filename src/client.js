
import nssocket from 'nssocket';
import { parsePIN, setHostId } from './utils';
import observer from './observer';
import { Bridge } from 'pot-js';
import { name } from '../package.json';

(async function () {
	const setState = async (state) => {
		const bridge = await Bridge.getByName(name, name);
		if (bridge) {
			await bridge.setState(state);
		}
	};

	const config = JSON.parse(process.env.CAP_CONFIG || '{}');
	const pin = (config.pin || '').toUpperCase();
	const { hostId, serverPort } = parsePIN(pin);
	const host = setHostId(hostId);

	// console.info('pin', pin);
	// console.info('hostId', hostId);
	// console.info('serverPort', serverPort);
	// console.info('host', host);

	const socket = new nssocket.NsSocket({
		reconnect: true,
		type: 'tcp4',
	});

	observer(socket, { setState });
	socket.connect(serverPort, host);
}());

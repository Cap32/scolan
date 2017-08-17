
import nssocket from 'nssocket';
import { parsePIN, setHostId } from './utils';
import observer from './observer';

(async function () {
	const config = JSON.parse(process.env.CAP_CONFIG || '{}');
	const { pin } = config;
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

	observer(socket);
	socket.connect(serverPort, host);
}());

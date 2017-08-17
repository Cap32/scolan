
import portfinder from 'portfinder';
import getMyIP from 'get-my-ip';
import Hashids from 'hashids';

const basePort = 3322;

portfinder.basePort = basePort;

const hashids = new Hashids('', 6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');

const parseIP = () => {
	const address = getMyIP();
	if (address && address.split) {
		const parts = address.split('.');
		if (parts.length !== 4) { return {}; }

		const id = parts.pop();
		const prefix = parts.join('.');
		return { id, prefix };
	}
	return {};
};

export async function getPort() {
	return portfinder.getPortPromise();
}

export function getHostId() {
	return parseIP().id;
}

export function setHostId(hostId) {
	const { prefix } = parseIP();
	return [prefix, hostId].join('.');
}

export function formatPIN(hostId, port) {
	return hashids.encode(hostId, port - basePort);
}

export function parsePIN(pin) {
	const [hostId, portIndex] = hashids.decode(pin);
	return { hostId, serverPort: portIndex + basePort };
}

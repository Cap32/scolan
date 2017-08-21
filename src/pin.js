
import portfinder from 'portfinder';
import getMyIP from 'get-my-ip';
import Hashids from 'hashids';

const basePort = 3322;

portfinder.basePort = basePort;

const hashids = new Hashids('', 6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');

// TODO: should add offline error handler
const parseIP = () => {
	const address = getMyIP();
	if (address && address.split) {
		const parts = address.split('.');
		if (parts.length !== 4) { return {}; }

		const hostId = parts.pop();
		const prefix = parts.join('.');
		return { hostId, prefix };
	}
	return {};
};

export function parsePIN(pin) {
	const [hostId, portIndex] = hashids.decode(pin);
	const { prefix } = parseIP();
	const host = [prefix, hostId].join('.');
	const port = portIndex + basePort;
	return { host, port };
}

export async function generatePIN() {
	const port = await portfinder.getPortPromise();
	const portIndex = port - basePort;
	const { hostId } = parseIP();
	return hashids.encode(hostId, portIndex);
}

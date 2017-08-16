
import getMyIP from 'get-my-ip';
import Hashids from 'hashids';

const hashids = new Hashids('', 8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');

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

export function getHostId() {
	return parseIP().id;
}

export function setHostId(hostId) {
	const { prefix } = parseIP();
	return [prefix, hostId].join('.');
}

export function formatPIN(hostId, port) {
	return hashids.encode(hostId, port);
}

export function parsePIN(pin) {
	const [hostId, serverPort] = hashids.decode(pin);
	return { hostId, serverPort };
}

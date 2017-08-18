
import clipboardy from 'clipboardy';

const clipEvent = 'clip';
const stateEvent = 'state';
const clipboardObserverInterval = 500;

const formatEOL = (content = '') => content.replace(/\r/g, '');

export default function observer(socket, options) {
	const { getState, setState, isHost } = options;

	let lastClipboardContent;
	let hasError = false;

	function observeNewContent(handler) {
		const content = formatEOL(clipboardy.readSync());
		if (typeof lastClipboardContent === 'undefined') {
			lastClipboardContent = content;
		}
		else if (content !== lastClipboardContent) {
			lastClipboardContent = content;
			handler(content);
		}
	}

	socket.on('start', function () {
		console.info('Connect success.');
		hasError = false;
	});

	socket.on('close', function () {
		console.error('Connection closed.');
	});

	socket.on('error', function () {
		if (!hasError) {
			console.error('Connect failed.');
			hasError = true;
		}
	});

	setInterval(function () {
		observeNewContent(function (content) {
			console.info('clipboard', content);
			socket.send(clipEvent, content);
		});
	}, clipboardObserverInterval);

	socket.data(clipEvent, function (content) {
		clipboardy.writeSync(formatEOL(content));
	});

	if (isHost) {
		const sendStateToClient = async () => {
			const state = await getState();
			socket.send(stateEvent, state);
		};

		socket.data(stateEvent, () => {
			sendStateToClient();
		});
	}
	else {
		socket.data(stateEvent, (state) => {
			setState(state);
		});
	}
}


import clipboardy from 'clipboardy';

const eventType = 'copy';
const clipboardObserverInterval = 500;

const formatEOL = (content = '') => content.replace(/\r/g, '');

export default function observer(socket) {
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
			socket.send(eventType, content);
		});
	}, clipboardObserverInterval);

	socket.data(eventType, function (content) {
		clipboardy.writeSync(formatEOL(content));
	});
}

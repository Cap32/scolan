
import clipboardy from 'clipboardy';

const eventType = 'copy';
const clipboardObserverInterval = 500;

export default function observer(socket) {
	let lastClipboardContent;
	let hasError = false;

	function observeNewContent(handler) {
		const content = clipboardy.readSync();
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
		console.error('Connect closed.');
	});

	socket.on('error', function () {
		if (!hasError) {
			console.error('Connect error.');
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
		clipboardy.writeSync(content);
	});
}

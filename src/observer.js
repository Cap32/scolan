
import clipboardy from 'clipboardy';
import { ClipEvent } from './constants';

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
		console.info('connected');
		hasError = false;
	});

	socket.on('close', function () {
		console.error('disconnected');
	});

	socket.on('error', function () {
		if (!hasError) {
			console.error('connect failed');
			hasError = true;
		}
	});

	setInterval(function () {
		observeNewContent(function (content) {
			console.info('clipboard', content);
			socket.send(ClipEvent, content);
		});
	}, clipboardObserverInterval);

	socket.data(ClipEvent, function (content) {
		clipboardy.writeSync(formatEOL(content));
	});
}

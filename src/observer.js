
import clipboard from './clipboard';
import { ClipEvent } from './constants';

export default function observer(socket) {
	let hasError = false;

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

	clipboard.observe((content) => {
		console.info('clipboard', content);
		socket.send(ClipEvent, content);
	});

	socket.data(ClipEvent, function (content) {
		clipboard.write(content);
	});
}

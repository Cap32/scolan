
import clipboardy from 'clipboardy';

const clipboardObserverInterval = 500;
let lastClipboardContent;

const formatEOL = (content = '') => content.replace(/\r/g, '');

export default {
	write(content) {
		const finalContent = formatEOL(content);
		if (lastClipboardContent !== finalContent) {
			clipboardy.writeSync(finalContent);
		}
	},

	observe(handler) {
		setInterval(() => {
			const finalContent = formatEOL(clipboardy.readSync());
			if (typeof lastClipboardContent === 'undefined') {
				lastClipboardContent = finalContent;
			}
			else if (finalContent !== lastClipboardContent) {
				lastClipboardContent = finalContent;
				handler(finalContent);
			}
		}, clipboardObserverInterval);
	},
};


import chalk from 'chalk';
import { name } from '../package.json';

export function startedLog(pin) {
	const styledCommand = chalk.yellow(`${name} start --pin=${pin}`);
	console.info(
		`Please run \`${styledCommand}\` on another device in the same LAN`
	);
}

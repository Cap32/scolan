
import yargs from 'yargs';
import gradient from 'gradient-string';
import pkg from '../package.json';
import { start, stop, Bridge } from 'pot-js';
import { resolve } from 'path';
import chalk from 'chalk';
import updateNotifier from 'update-notifier';

const { name } = pkg;
updateNotifier({ pkg }).notify();

// eslint-disable-next-line
yargs
	.usage(`\n${gradient.fruit(`${name} <command> [args]`)}`)
	.demand(1, 'Please specify one of the commands!')
	.command({
		command: 'start',
		desc: `Start ${name}`,
		builder(yargs) {
			yargs // eslint-disable-line
				.usage(`\n${gradient.fruit(`${name} start [args]`)}`)
				.options({
					pin: {
						alias: 'p',
						desc: 'PIN code',
						type: 'string',
					},
					daemon: {
						alias: 'd',
						desc: 'Enable daemon mode',
						type: 'boolean',
					},
				})
				.argv
			;
		},
		async handler(argv) {
			try {
				const { daemon, pin } = argv;
				const isServer = !pin;
				const bin = isServer ? 'server' : 'client';
				const entry = resolve(__dirname, '../bin/', bin);
				await start({
					entry,
					env: { CAP_CONFIG: JSON.stringify(argv) },
					workspace: name,
					name,
					daemon,

					// name: `${name}-${isServer ? 'server' : 'client'}`,
					// logLevel: 'DEBUG',

					clipboardConnections: 0,
				});

				if (daemon) {
					const styledCommand = chalk.yellow(`${name} stop`);
					console.log(
						`To stop running "${name}", please run \`${styledCommand}\``
					);
				}
			}
			catch (err) {
				console.error(chalk.red('ERROR'), err.message);
				throw err;
			}

			const exit = () => {
				stop({
					force: true,
					workspace: name,
					name,
					logLevel: 'OFF',
				}).catch();
			};

			process.on('SIGINT', exit);
			process.on('SIGTERM', exit);
		},
	})
	.command({
		command: 'stop',
		desc: `Stop ${name}`,
		builder(yargs) {
			yargs // eslint-disable-line
				.usage(`\n${gradient.fruit(`${name} stop [args]`)}`)
				.options({
					f: {
						alias: 'force',
						desc: 'Stop without confirming',
						type: 'bool',
					},
				})
				.argv
			;
		},
		handler(argv) {
			stop({ ...argv, workspace: name, name }).catch((err) => {
				console.error(chalk.red('ERROR'), err.message || 'unknown error.');
			});
		},
	})
	.command({
		command: 'status',
		desc: 'Display status',
		async handler(argv) {
			try {
				const bridge = await Bridge.getByName(name, name);

				if (!bridge) {
					console.log('status', chalk.red('NOT running'));
					return;
				}

				const state = await bridge.getState();
				const { status, data: { clipboardConnections, pin } } = state;
				const styled = chalk[status === 'running' ? 'green' : 'red'](status);
				console.log('');
				console.log('\tstatus', styled);
				console.log('\tconnections', chalk.yellow(clipboardConnections));
				console.log('\tpin', chalk.yellow(pin));
				console.log('');
			}
			catch (err) {
				console.error(err);
			}
		},
	})
	.alias('h', 'help')
	.help()
	.version(pkg.version)
	.epilogue(gradient.mind('Powered by Cap32'))
	.argv
;

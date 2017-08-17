
import yargs from 'yargs';
import gradient from 'gradient-string';
import pkg from '../package.json';
import { start, stop, Bridge } from 'pot-js';
import { resolve } from 'path';
import chalk from 'chalk';
import updateNotifier from 'update-notifier';

updateNotifier({ pkg }).notify();

// eslint-disable-next-line
yargs
	.usage(`\n${gradient.fruit('cap <command> [args]')}`)
	.demand(1, 'Please specify one of the commands!')
	.command({
		command: 'start',
		desc: 'Start cap',
		builder(yargs) {
			yargs // eslint-disable-line
				.usage(`\n${gradient.fruit('cap start [args]')}`)
				.options({
					pin: {
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
					workspace: 'cap',
					name: 'cap',
					daemon,

					// name: `cap-${isServer ? 'server' : 'client'}`,
					logLevel: 'DEBUG',

					clipboardConnections: 0,
				});

				if (daemon) {
					console.log('To stop running "cap", please run `cap stop`');
				}
			}
			catch (err) {
				console.error(chalk.red('ERROR'), err.message);
				throw err;
			}

			const exit = () => {
				stop({ force: true, workspace: 'cap', name: 'cap' }).catch();
			};

			process.on('SIGINT', exit);
			process.on('SIGHUP', exit);
			process.on('SIGTERM', exit);
			process.on('SIGBREAK', exit);
			process.on('uncaughtException', exit);
		},
	})
	.command({
		command: 'stop',
		desc: 'Stop cap',
		builder(yargs) {
			yargs // eslint-disable-line
				.usage(`\n${gradient.fruit('cap stop [args]')}`)
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
			stop({ ...argv, workspace: 'cap', name: 'cap' }).catch((err) => {
				console.error(chalk.red('ERROR'), err.message || 'unknown error.');
			});
		},
	})
	.command({
		command: 'status',
		desc: 'Display status',
		async handler(argv) {
			try {
				const bridge = await Bridge.getByName('cap', 'cap');

				if (!bridge) {
					console.log('status', chalk.red('NOT running'));
					return;
				}

				const state = await bridge.getState();
				const { status, data: { clipboardConnections } } = state;
				const styled = chalk[status === 'running' ? 'green' : 'red'](status);
				console.log('');
				console.log('\tstatus', styled);
				console.log('\tconnections', chalk.yellow(clipboardConnections));
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

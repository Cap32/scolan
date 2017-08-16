
import yargs from 'yargs';
import gradient from 'gradient-string';
import { version } from '../package.json';
import { start, stop, Bridge } from 'pot-js';
import workspace from 'pot-js/lib/utils/workspace';
import { resolve } from 'path';
import chalk from 'chalk';

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
				// logLevel: 'DEBUG',
			});

			if (daemon) {
				console.log('To stop running "cap", please run `cap stop`');
			}
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
			stop({ ...argv, workspace: 'cap', name: 'cap' }).catch();
		},
	})
	.command({
		command: 'status',
		desc: 'Display status',
		async handler(argv) {
			try {
				workspace.set('cap');
				const bridge = await Bridge.getByName('cap');

				if (!bridge) {
					console.log('status', chalk.red('NOT running'));
					return;
				}

				const state = await bridge.getState();
				const { status } = state;
				const styled = chalk[status === 'running' ? 'green' : 'red'](status);
				console.log('status', styled);
			}
			catch (err) {
				console.error(err);
			}
		},
	})
	.alias('h', 'help')
	.help()
	.version(version)
	.epilogue(gradient.mind('Powered by Cap32'))
	.argv
;

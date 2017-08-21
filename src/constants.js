
import { name } from '../package.json';

const uppercaseName = name.toUpperCase();

export const ConfigEnv = `${uppercaseName}_CONFIG`;
export const PINEnv = `${uppercaseName}_PIN`;

export const ClipEvent = 'clip';
export const StateEvent = 'state';

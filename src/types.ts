import type { EventEmitter } from "node:events";

// Types and Interfaces
export interface Poller extends EventEmitter {
	// The list of files in the folder
	files: string[];
	// The timeout for the polling
	timeout: NodeJS.Timeout;
	// The function to start the polling
	watch: () => void;
	// The function to stop the polling
	close: () => void;
}

export interface PollerOptions {
	// The interval for the polling
	interval?: number;
}

// The function to execute once finished
export type PollerCallback = (err: Error | null, poll?: Poller) => void;

/*
	We use this to help inspect internals to check the interval amount in one 
	of our unit tests.
*/
export interface ExtendedTimeout extends NodeJS.Timeout {
	_idleTimeout: number;
}

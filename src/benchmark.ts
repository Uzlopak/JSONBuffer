import { stringify } from "./stringify";
import * as os from 'os';

console.log(" OS: " + os.type() + " " + os.release() + " (" + os.arch() + ")");
console.log("RAM: " + os.totalmem() / 1048576 + " MB (total), " + os.freemem() / 1048576 + " MB (free)");
console.log("CPU: " + os.cpus()[0].speed + " MHz " + os.cpus()[0].model);

const obj = {
	'abcdef': 1,
	'qqq': 13,
	'19': [1, 2, 3, 4]
};

for (let r = 1; r < 10; r++) {
	console.log("\nRun #" + r + ":");

	let start = 0;
	let stop = 0;
	start = Date.now();
	for (let i = 0; i < 500000; i++) {
		JSON.stringify(obj);
	}
	stop = Date.now();
	console.log("\t      native: " + (stop - start) + " ms");
}

for (let r = 1; r < 10; r++) {
	console.log("\nRun #" + r + ":");

	let start = 0;
	let stop = 0;
	start = Date.now();
	for (let i = 0; i < 500000; i++) {
		stringify(obj);
	}
	stop = Date.now();
	console.log("\t      custom: " + (stop - start) + " ms");
}
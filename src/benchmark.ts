import { parse } from "./parse";
import { stringify } from "./stringify";
import { toBuffer } from "./toBuffer";
import * as os from 'os';
import { serialize } from "./serialize";

function systemStats(): void {

	console.log(" OS: " + os.type() + " " + os.release() + " (" + os.arch() + ")");
	console.log("RAM: " + os.totalmem() / 1048576 + " MB (total), " + os.freemem() / 1048576 + " MB (free)");
	console.log("CPU: " + os.cpus()[0].speed + " MHz " + os.cpus()[0].model);
}

systemStats();

const obj = "test";

// for (let r = 1; r < 4; r++) {
// 	console.log("\nRun #" + r + ":");

// 	let start = 0;
// 	let stop = 0;
// 	start = Date.now();
// 	for (let i = 0; i < 500000; i++) {
// 		JSON.parse(stringifiedObj);
// 	}
// 	stop = Date.now();
// 	console.log("\t parse native: " + (stop - start) + " ms");
// }

// for (let r = 1; r < 4; r++) {
// 	console.log("\nRun #" + r + ":");

// 	let start = 0;
// 	let stop = 0;
// 	start = Date.now();
// 	for (let i = 0; i < 500000; i++) {
// 		parse(stringifiedObj);
// 	}
// 	stop = Date.now();
// 	console.log("\t parse custom: " + (stop - start) + " ms");
// }

for (let r = 1; r < 4; r++) {
	console.log("\nRun #" + r + ":");

	let start = 0;
	let stop = 0;
	start = Date.now();
	for (let i = 0; i < 500000; i++) {
		JSON.stringify(obj);
	}
	stop = Date.now();
	console.log("\t stringify native: " + (stop - start) + " ms");
}

for (let r = 1; r < 4; r++) {
	console.log("\nRun #" + r + ":");

	let start = 0;
	let stop = 0;
	start = Date.now();
	for (let i = 0; i < 500000; i++) {
		stringify(obj);
	}
	stop = Date.now();
	console.log("\t stringify custom: " + (stop - start) + " ms");
}

for (let r = 1; r < 4; r++) {
	console.log("\nRun #" + r + ":");

	let start = 0;
	let stop = 0;
	start = Date.now();
	for (let i = 0; i < 500000; i++) {
		Buffer.from(JSON.stringify(obj));
	}
	stop = Date.now();
	console.log("\t stringify native and Buffer.from native: " + (stop - start) + " ms");
}


for (let r = 1; r < 4; r++) {
	console.log("\nRun #" + r + ":");

	let start = 0;
	let stop = 0;
	start = Date.now();
	for (let i = 0; i < 500000; i++) {
		Buffer.from(stringify(obj));
	}
	stop = Date.now();
	console.log("\t stringify custom and Buffer.from native: " + (stop - start) + " ms");
}

for (let r = 1; r < 4; r++) {
	console.log("\nRun #" + r + ":");

	let start = 0;
	let stop = 0;
	start = Date.now();
	for (let i = 0; i < 500000; i++) {
		toBuffer(stringify(obj));
	}
	stop = Date.now();
	console.log("\t stringify and toBuffer custom: " + (stop - start) + " ms");
}

for (let r = 1; r < 4; r++) {
	console.log("\nRun #" + r + ":");

	let start = 0;
	let stop = 0;
	start = Date.now();
	for (let i = 0; i < 500000; i++) {
		serialize(obj);
	}
	stop = Date.now();
	console.log("\t serialize custom: " + (stop - start) + " ms");
}
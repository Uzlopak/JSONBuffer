import { serialize } from "../serialize";
import { expect } from "chai";
import { readdirSync, readFileSync } from "fs";

describe("serialize", async () => {

	const testCases: unknown[] = [
		null,
		Infinity,
		-Infinity,
		NaN,
		undefined,
		true,
		false,
		"test",
		"漢字",
		2,
		{},
		{ a: "test" },
		{ a: "test", b: "test" },
		{ a: undefined },
		new Date(),
		() => { return; },
		function () { return; },
		[],
		[1, 2, 3, 4],
	];

	for (let i = 0; i < testCases.length; i++) {
		it(JSON.stringify(testCases[i]) + "", () => {
			expect(serialize(testCases[i])?.toString('utf8'), JSON.stringify(testCases[i])).to.be.equal(JSON.stringify(testCases[i]));
		});
	}
});

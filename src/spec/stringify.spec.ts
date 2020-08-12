import { stringify } from "../stringify";
import { expect } from "chai";
import { readdirSync, readFileSync } from "fs";

describe("stringify", async () => {

	const testCases: any[] = [
		null,
		Infinity,
		-Infinity,
		NaN,
		undefined,
		true,
		false,
		"test",
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
			expect(stringify(testCases[i]), JSON.stringify(testCases[i])).to.be.equal(JSON.stringify(testCases[i]));
		});
	}

	const files = readdirSync(__dirname + "/../../JSONTestSuite/test_parsing/");
	for (const i in files) {
		const content = readFileSync(__dirname + "/../../JSONTestSuite/test_parsing/" + files[i], "utf8");
		it(files[i], () => {
			expect(stringify(content)).to.be.equal(JSON.stringify(content));
		});
	}
});

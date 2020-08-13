import { stringify } from "../stringify";
import { expect } from "chai";
import { readdirSync, readFileSync } from "fs";

describe("stringify", async () => {

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
			expect(stringify(testCases[i]), JSON.stringify(testCases[i])).to.be.equal(JSON.stringify(testCases[i]));
		});
	}

	const filesTestParsing = readdirSync(__dirname + "/../../JSONTestSuite/test_parsing/");
	for (const i in filesTestParsing) {
		const content = readFileSync(__dirname + "/../../JSONTestSuite/test_parsing/" + filesTestParsing[i], "utf8");
		it(filesTestParsing[i], () => {
			expect(stringify(content)).to.be.equal(JSON.stringify(content));
		});
	}

	const filesTestTransforms = readdirSync(__dirname + "/../../JSONTestSuite/test_transform/");
	for (const i in filesTestTransforms) {
		const content = readFileSync(__dirname + "/../../JSONTestSuite/test_transform/" + filesTestTransforms[i], "utf8");
		it(filesTestTransforms[i], () => {
			expect(stringify(content)).to.be.equal(JSON.stringify(content));
		});
	}
});

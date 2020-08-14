import { parse } from "../parse";
import { expect } from "chai";

describe("parse", async () => {

	const testCases: string[] = [
		"null",
		"true",
		"false",
		"\"test\"",
		"2",
		"2.3",
		"2.0",
		"23.3e1",
		"1",
		"1e10",
		"1e-10",
		"1e+10",
		"23",
		"{}",
		"{\"a\":\"test\"}",
		"{\"a\":\"test\",\"b\":\"test\"}",
		"{\"a\":{\"a\":\"test\"},\"b\":\"test\"}",
		"[]",
		"[1,2,3,4]",
	];

	for (let i = 0; i < testCases.length; i++) {
		it(testCases[i], () => {
			expect(parse(testCases[i]), testCases[i]).to.be.eql(JSON.parse(testCases[i]));
		});
	}
});

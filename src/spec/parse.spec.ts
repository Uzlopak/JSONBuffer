import { parse } from "../parse";
import { expect } from "chai";
import { readdirSync, readFileSync } from "fs";

describe("parse", async () => {

	const testCases: string[] = [
		"null",
		"true",
		"false",
		"\"漢字\"",
		"\"test\"",
		"\"\\u00b2\"",
		"\"\\u00b2\\u00b2\\u00b2\"",
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
		"\"\\\\n\"",
		"{\"a\":\"test\"}",
		"{\"a\":\"test\",\"b\":\"test\"}",
		"{\"a\":{\"a\":\"test\"},\"b\":\"test\"}",
		"[]",
		"[1,2,3,4]",
		"{\"\uDFAA\":0}"
	];

	for (let i = 0; i < testCases.length; i++) {
		it(testCases[i], () => {
			expect(parse(testCases[i]), testCases[i]).to.be.eql(JSON.parse(testCases[i]));
		});
	}

	let j = 0;

	const filesTestParsing = readdirSync(__dirname + "/../../JSONTestSuite/test_parsing/");
	for (const i in filesTestParsing) {
		const content = readFileSync(__dirname + "/../../JSONTestSuite/test_parsing/" + filesTestParsing[i], "utf8");

		if (filesTestParsing[i].charAt(0) === "n") {
			it(filesTestParsing[i], () => {
				expect(function () { JSON.parse(content); }).to.throw();
				expect(function () { parse(content); }).to.throw();
			});
		} else if (filesTestParsing[i].charAt(0) === "y") {
			try {
				JSON.parse(content);
				it(filesTestParsing[i], () => {
					expect(parse(content)).to.be.eql(JSON.parse(content));
				});
			} catch (e) {
				it(filesTestParsing[i], () => {
					expect(function () { JSON.parse(content); }).to.throw();
					expect(function () { parse(content); }).to.throw();
				});
			}
		} else {
			it(filesTestParsing[i], () => {
				expect(parse(content)).to.be.eql(JSON.parse(content));
			});
		}
		j++;

		if (j > 10) {
			break;
		}
	}
});

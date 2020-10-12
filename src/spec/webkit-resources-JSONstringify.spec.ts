import { stringify } from "../stringify";

/* eslint-disable no-sparse-arrays */
// Copyright 2014 the V8 project authors. All rights reserved.
// Copyright (C) 2005, 2006, 2007, 2008, 2009 Apple Inc. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 1.  Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
// 2.  Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS'' AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import { expect } from "chai";


function createTests(): ((json: any) => string)[] {
	let simpleArray = ['a', 'b', 'c'];
	let simpleObject = { a: "1", b: "2", c: "3" };
	let complexArray = ['a', 'b', 'c', , , simpleObject, simpleArray, [simpleObject, simpleArray]];
	let complexObject = { a: "1", b: "2", c: "3", d: undefined, e: null, "": 12, get f() { return simpleArray; }, array: complexArray };
	let simpleArrayWithProto = ['d', 'e', 'f'];
	// @ts-ignore
	simpleArrayWithProto.__proto__ = simpleObject;
	let simpleObjectWithProto = { d: "4", e: "5", f: "6", __proto__: simpleObject };
	let complexArrayWithProto = ['d', 'e', 'f', , , simpleObjectWithProto, simpleArrayWithProto, [simpleObjectWithProto, simpleArrayWithProto]];
	// @ts-ignore
	complexArrayWithProto.__proto__ = simpleObjectWithProto;
	let complexObjectWithProto = { d: "4", e: "5", f: "6", g: undefined, h: null, "": 12, get i() { return simpleArrayWithProto; }, array2: complexArrayWithProto, __proto__: complexObject };

	// @ts-ignore
	let objectWithSideEffectGetter = { get b() { this.foo = 1; } };
	// @ts-ignore
	let objectWithSideEffectGetterAndProto = { __proto__: { foo: "bar" }, get b() { this.foo = 1; } };
	let arrayWithSideEffectGetter = [];

	// @ts-ignore
	arrayWithSideEffectGetter.__defineGetter__("b", function () { this.foo = 1; });
	let arrayWithSideEffectGetterAndProto = [];
	// @ts-ignore
	arrayWithSideEffectGetterAndProto.__defineGetter__("b", function () { this.foo = 1; });
	// @ts-ignore
	arrayWithSideEffectGetterAndProto.__proto__ = { foo: "bar" };
	let result = [];

	// 1
	result.push(function (jsonObject) {
		return jsonObject.stringify(1);
	});

	// 2
	result.push(function (jsonObject) {
		return jsonObject.stringify(1.5);
	});

	// 3
	result.push(function (jsonObject) {
		return jsonObject.stringify(-1);
	});

	// 4
	result.push(function (jsonObject) {
		return jsonObject.stringify(-1.5);
	});

	// 5
	result.push(function (jsonObject) {
		return jsonObject.stringify(null);
	});

	// 6
	result.push(function (jsonObject) {
		return jsonObject.stringify("string");
	});

	// 7
	result.push(function (jsonObject) {
		return jsonObject.stringify(new Number(0));
	});

	// 8
	result.push(function (jsonObject) {
		return jsonObject.stringify(new Number(1));
	});

	// 9
	result.push(function (jsonObject) {
		return jsonObject.stringify(new Number(1.5));
	});

	// 11
	result.push(function (jsonObject) {
		return jsonObject.stringify(new Number(-1));
	});

	// 12
	result.push(function (jsonObject) {
		return jsonObject.stringify(new Number(-1.5));
	});

	// 13
	result.push(function (jsonObject) {
		return jsonObject.stringify(new String("a string object"));
	});

	// 14
	result.push(function (jsonObject) {
		return jsonObject.stringify(new Boolean(true));
	});

	// 15
	result.push(function (jsonObject) {
		let value = new Number(1);
		value.valueOf = function () { return 2; };
		return jsonObject.stringify(value);
	});

	result[result.length - 1].expected = '2';

	// 16
	result.push(function (jsonObject) {
		let value = new Boolean(true);
		value.valueOf = function () { return false; };
		return jsonObject.stringify(value);
	});
	result[result.length - 1].expected = 'true';

	// 17
	result.push(function (jsonObject) {
		let value = new String("fail");
		value.toString = function () { return "converted string"; };
		return jsonObject.stringify(value);
	});
	result[result.length - 1].expected = '"converted string"';

	// 18
	result.push(function (jsonObject) {
		return jsonObject.stringify(true);
	});

	// 19
	result.push(function (jsonObject) {
		return jsonObject.stringify(false);
	});

	// 20
	result.push(function (jsonObject) {
		return jsonObject.stringify(new Date(0));
	});

	// 21
	result.push(function (jsonObject) {
		return jsonObject.stringify({ toJSON: Date.prototype.toJSON });
	});
	result[result.length - 1].throws = true;

	// 22
	result.push(function (jsonObject) {
		return jsonObject.stringify({ toJSON: Date.prototype.toJSON, toISOString: function () { return "custom toISOString"; } });
	});
	// Note: JSC fails the following test. Every other engine matches the spec.
	// This is also covered by the test in
	// https://github.com/v8/v8/blob/fc664bda1725de0412f6d197fda9503d6e6e122e/test/mjsunit/json.js#L78-L80

	// 23
	result.push(function (jsonObject) {
		return jsonObject.stringify({ toJSON: Date.prototype.toJSON, toISOString: function () { return {}; } });
	});
	result[result.length - 1].expected = '{}';

	// 24
	result.push(function (jsonObject) {
		return jsonObject.stringify({ toJSON: Date.prototype.toJSON, toISOString: function () { throw "An exception"; } });
	});
	result[result.length - 1].throws = true;

	// 25
	result.push(function (jsonObject) {
		let d = new Date(0);
		d.toISOString = null;
		return jsonObject.stringify(d);
	});
	result[result.length - 1].throws = true;

	// 26
	result.push(function (jsonObject) {
		let d = new Date(0);
		d.toJSON = undefined;
		return jsonObject.stringify(d);
	});

	// 27
	result.push(function (jsonObject) {
		return jsonObject.stringify({ get Foo() { return "bar"; } });
	});

	// 28
	result.push(function (jsonObject) {
		return jsonObject.stringify({ get Foo() { this.foo = "wibble"; return "bar"; } });
	});

	// 29
	result.push(function (jsonObject) {
		let count = 0;
		jsonObject.stringify({ get Foo() { count++; return "bar"; } });
		return count;
	});

	// modified test, as we are running it twice
	result.push(function (jsonObject) {
		let count = 0;
		jsonObject.stringify({ get Foo() { count === 0 ? count++ : count; return "bar"; } });
		return count;
	});

	// 30
	result.push(function (jsonObject) {
		let count = 0;
		return jsonObject.stringify({ get Foo() { count++; delete this.bar; return "bar"; }, bar: "wibble" });
	});

	// 31
	result.push(function (jsonObject) {
		let count = 0;
		return jsonObject.stringify({ a: "1", b: "2", c: "3", 5: 4, 4: 5, 2: 6, 1: 7 });
	});

	// 32
	result.push(function (jsonObject) {
		let allString = true;
		jsonObject.stringify({ a: "1", b: "2", c: "3", 5: 4, 4: 5, 2: 6, 1: 7 }, function (k, v) { allString = allString && (typeof k == "string"); return v });
		return allString;
	});

	// 33
	result.push(function (jsonObject) {
		let allString = true;
		jsonObject.stringify([1, 2, 3, 4, 5], function (k, v) { allString = allString && (typeof k == "string"); return v });
		return allString;
	});
	result[result.length - 1].expected = true;

	// 34
	result.push(function (jsonObject) {
		let array = [];
		return jsonObject.stringify({ a: "1", b: "2", c: "3", 5: 4, 4: 5, 2: 6, 1: 7 }, array);
	});

	// 35
	result.push(function (jsonObject) {
		let array = ["a"];
		return jsonObject.stringify({ get a() { return 1; array[1] = "b"; array[2] = "c" }, b: "2", c: "3" }, array);
	});

	// 36
	result.push(function (jsonObject) {
		let array = [{ toString: function () { array[0] = 'a'; array[1] = 'c'; array[2] = 'b'; return 'a' } }];
		return jsonObject.stringify(simpleObject, array);
	});

	// 37
	result.push(function (jsonObject) {
		let array = [{ toString: function () { array[0] = 'a'; array[1] = 'c'; array[2] = 'b'; return 'a' } }];
		return jsonObject.stringify(simpleObjectWithProto, array);
	});

	// 38
	result.push(function (jsonObject) {
		let array = [1, new Number(2), NaN, Infinity, -Infinity, new String("str")];
		return jsonObject.stringify({ "1": "1", "2": "2", "NaN": "NaN", "Infinity": "Infinity", "-Infinity": "-Infinity", "str": "str" }, array);
	});
	result[result.length - 1].expected = '{"1":"1","2":"2","NaN":"NaN","Infinity":"Infinity","-Infinity":"-Infinity","str":"str"}';

	// 39
	result.push(function (jsonObject) {
		let array = ["1", "2", "3"];
		return jsonObject.stringify({ 1: 'a', 2: 'b', 3: 'c' }, array);
	});

	// 40
	result.push(function (jsonObject) {
		let array = ["1", "2", "3"];
		return jsonObject.stringify(simpleArray, array);
	});

	// 41
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleArray, null, "  ");
	});

	// 42
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleArray, null, 4);
	});

	// 43
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleArray, null, "ab");
	});

	// 44
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleArray, null, 4);
	});

	// 45
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObject, null, "  ");
	});

	// 46
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObject, null, 4);
	});

	// 47
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObject, null, "ab");
	});

	// 48
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObject, null, 4);
	});

	// 49
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObject, null, 10);
	});

	// 50
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObject, null, 11);
	});
	result[result.length - 1].expected = JSON.stringify(simpleObject, null, 10);

	// 51
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObject, null, "          ");
	});
	result[result.length - 1].expected = JSON.stringify(simpleObject, null, 10);

	// 52
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObject, null, "           ");
	});
	result[result.length - 1].expected = JSON.stringify(simpleObject, null, 10);

	// 53
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexArray, null, "  ");
	});

	// 54
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexArray, null, 4);
	});

	// 55
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexArray, null, "ab");
	});

	// 56
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexArray, null, 4);
	});

	// 57
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexObject, null, "  ");
	});

	// 58
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexObject, null, 4);
	});

	// 59
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexObject, null, "ab");
	});

	// 60
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexObject, null, 4);
	});

	// 61
	result.push(function (jsonObject) {
		let array = ["1", "2", "3"];
		return jsonObject.stringify(simpleArrayWithProto, array);
	});

	// 62
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleArrayWithProto, null, "  ");
	});

	// 63
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleArrayWithProto, null, 4);
	});

	// 64
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleArrayWithProto, null, "ab");
	});

	// 65
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleArrayWithProto, null, 4);
	});

	// 66
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObjectWithProto, null, "  ");
	});

	// 67
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObjectWithProto, null, 4);
	});

	// 68
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObjectWithProto, null, "ab");
	});

	// 69
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObjectWithProto, null, 4);
	});

	// 70
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObjectWithProto, null, 10);
	});

	// 71
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObjectWithProto, null, 11);
	});
	result[result.length - 1].expected = JSON.stringify(simpleObjectWithProto, null, 10);

	// 72
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObjectWithProto, null, "          ");
	});
	result[result.length - 1].expected = JSON.stringify(simpleObjectWithProto, null, 10);

	// 73
	result.push(function (jsonObject) {
		return jsonObject.stringify(simpleObjectWithProto, null, "           ");
	});
	result[result.length - 1].expected = JSON.stringify(simpleObjectWithProto, null, 10);

	// 74
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexArrayWithProto, null, "  ");
	});

	// 75
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexArrayWithProto, null, 4);
	});

	// 76
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexArrayWithProto, null, "ab");
	});

	// 77
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexArrayWithProto, null, 4);
	});

	// 78
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexObjectWithProto, null, "  ");
	});

	// 79
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexObjectWithProto, null, 4);
	});

	// 80
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexObjectWithProto, null, "ab");
	});

	// 81
	result.push(function (jsonObject) {
		return jsonObject.stringify(complexObjectWithProto, null, 4);
	});

	// 82
	result.push(function (jsonObject) {
		return jsonObject.stringify(objectWithSideEffectGetter);
	});
	result[result.length - 1].expected = '{}';

	// 83
	result.push(function (jsonObject) {
		return jsonObject.stringify(objectWithSideEffectGetterAndProto);
	});
	result[result.length - 1].expected = '{}';

	// 84
	result.push(function (jsonObject) {
		return jsonObject.stringify(arrayWithSideEffectGetter);
	});

	// 85
	result.push(function (jsonObject) {
		return jsonObject.stringify(arrayWithSideEffectGetterAndProto);
	});
	let replaceTracker;
	function replaceFunc(key, value) {
		replaceTracker += key + "(" + (typeof key) + ")" + JSON.stringify(value) + ";";
		return value;
	}

	// 86
	result.push(function (jsonObject) {
		replaceTracker = "";
		jsonObject.stringify([1, 2, 3, , , , 4, 5, 6], replaceFunc);
		return replaceTracker;
	});
	result[result.length - 1].expected = '(string)[1,2,3,null,null,null,4,5,6];0(string)1;1(string)2;2(string)3;3(string)undefined;4(string)undefined;5(string)undefined;6(string)4;7(string)5;8(string)6;';

	// 87
	result.push(function (jsonObject) {
		replaceTracker = "";
		jsonObject.stringify({ a: "a", b: "b", c: "c", 3: "d", 2: "e", 1: "f" }, replaceFunc);
		return replaceTracker;
	});
	result[result.length - 1].expected = '(string){"1":"f","2":"e","3":"d","a":"a","b":"b","c":"c"};1(string)"f";2(string)"e";3(string)"d";a(string)"a";b(string)"b";c(string)"c";';

	// 88
	result.push(function (jsonObject) {
		let count = 0;
		let array = [{ toString: function () { count++; array[0] = 'a'; array[1] = 'c'; array[2] = 'b'; return 'a' } }];
		jsonObject.stringify(simpleObject, array);
		return count;
	});

	// 89
	result.push(function (jsonObject) {
		let array = [{ toString: function () { array[0] = 'a'; array[1] = 'c'; array[2] = 'b'; return 'a' } }, 'b', 'c'];
		return jsonObject.stringify(simpleObject, array);
	});

	// 90
	result.push(function (jsonObject) {
		let count = 0;
		let array = [{ toString: function () { count++; array[0] = 'a'; array[1] = 'c'; array[2] = 'b'; return 'a' } }, 'b', 'c'];
		jsonObject.stringify(simpleObject, array);
		return count;
	});

	// 91
	result.push(function (jsonObject) {
		return jsonObject.stringify({ a: "1", get b() { this.a = "foo"; return "getter"; }, c: "3" });
	});

	// 92
	result.push(function (jsonObject) {
		return jsonObject.stringify({ a: "1", get b() { this.c = "foo"; return "getter"; }, c: "3" });
	});

	// 93
	result.push(function (jsonObject) {
		let setterCalled = false;
		// @ts-ignore
		jsonObject.stringify({ a: "1", set b(s) { setterCalled = true; return "setter"; }, c: "3" });
		return setterCalled;
	});

	// 94
	result.push(function (jsonObject) {
		// @ts-ignore
		return jsonObject.stringify({ a: "1", get b() { return "getter"; }, set b(s) { return "setter"; }, c: "3" });
	});

	// 95
	result.push(function (jsonObject) {
		return jsonObject.stringify(new Array(10));
	});

	// 96
	result.push(function (jsonObject) {
		return jsonObject.stringify([undefined, , null, 0, false]);
	});

	// 97
	result.push(function (jsonObject) {
		return jsonObject.stringify({ p1: undefined, p2: null, p3: 0, p4: false });
	});
	let cycleTracker = "";
	let cyclicObject = {
		get preSelf1() { cycleTracker += "preSelf1,"; return "preSelf1"; },
		preSelf2: { toJSON: function () { cycleTracker += "preSelf2,"; return "preSelf2" } },
		self: [],
		get postSelf1() { cycleTracker += "postSelf1,"; return "postSelf1" },
		postSelf2: { toJSON: function () { cycleTracker += "postSelf2,"; return "postSelf2" } },
		toJSON: function (key) { cycleTracker += key + "(" + (typeof key) + "):" + this; return this; }
	};
	// @ts-ignore
	cyclicObject.self = cyclicObject;

	// 98
	result.push(function (jsonObject) {
		cycleTracker = "";
		return jsonObject.stringify(cyclicObject);
	});
	result[result.length - 1].throws = true;

	// 99
	result.push(function (jsonObject) {
		cycleTracker = "";
		try { jsonObject.stringify(cyclicObject); } catch (e) { cycleTracker += " -> exception" }
		return cycleTracker;
	});

	// 100
	result[result.length - 1].expected = "(string):[object Object]preSelf1,preSelf2,self(string):[object Object] -> exception"
	let cyclicArray = [{ toJSON: function (key, value) { cycleTracker += key + "(" + (typeof key) + "):" + this; cycleTracker += "first,"; return this; } },
		// @ts-ignore
		null,
	{ toJSON: function (key, value) { cycleTracker += key + "(" + (typeof key) + "):" + this; cycleTracker += "second,"; return this; } }];
	// @ts-ignore
	cyclicArray[1] = cyclicArray;

	// 101
	result.push(function (jsonObject) {
		cycleTracker = "";
		return jsonObject.stringify(cyclicArray);
	});
	result[result.length - 1].throws = true;

	// 102
	result.push(function (jsonObject) {
		cycleTracker = "";
		try { jsonObject.stringify(cyclicArray); } catch { cycleTracker += " -> exception" }
		return cycleTracker;
	});

	// 103
	result[result.length - 1].expected = "0(string):[object Object]first, -> exception";
	function createArray(len, o) { let r = []; for (let i = 0; i < len; i++) r[i] = o; return r; }
	let getterCalls;
	let magicObject = createArray(10, {
		abcdefg: [1, 2, 5, "ab", null, undefined, true, false, ,],
		get calls() { return ++getterCalls; },
		"123": createArray(15, "foo"),
		"": { a: "b" }
	});

	// 104
	result.push(function (jsonObject) {
		getterCalls = 0;
		return jsonObject.stringify(magicObject) + " :: getter calls = " + getterCalls;
	});

	// 105
	result.push(function (jsonObject) {
		return jsonObject.stringify(undefined);
	});

	// 106
	result.push(function (jsonObject) {
		return jsonObject.stringify(null);
	});

	// 107
	result.push(function (jsonObject) {
		return jsonObject.stringify({ toJSON: function () { return undefined; } });
	});

	// 108
	result.push(function (jsonObject) {
		return jsonObject.stringify({ toJSON: function () { return null; } });
	});

	// 109
	result.push(function (jsonObject) {
		return jsonObject.stringify([{ toJSON: function () { return undefined; } }]);
	});

	// 110
	result.push(function (jsonObject) {
		return jsonObject.stringify([{ toJSON: function () { return null; } }]);
	});

	// 111
	result.push(function (jsonObject) {
		return jsonObject.stringify({ a: { toJSON: function () { return undefined; } } });
	});

	// 112
	result.push(function (jsonObject) {
		return jsonObject.stringify({ a: { toJSON: function () { return null; } } });
	});

	// 113
	result.push(function (jsonObject) {
		return jsonObject.stringify({ a: { toJSON: function () { return function () { }; } } });
	});

	// 114
	result.push(function (jsonObject) {
		return jsonObject.stringify({ a: function () { } });
	});

	// 115
	result.push(function (jsonObject) {
		let deepObject = {};
		for (let i = 0; i < 700; i++)
			deepObject = { next: deepObject };
		return jsonObject.stringify(deepObject);
	});

	// 116
	result.push(function (jsonObject) {
		let deepArray = [];
		for (let i = 0; i < 800; i++)
			deepArray = [deepArray];
		return jsonObject.stringify(deepArray);
	});

	// 117
	result.push(function (jsonObject) {
		let depth = 0;
		function toDeepVirtualJSONObject() {
			if (++depth >= 700)
				return {};
			let r = {};
			// @ts-ignore
			r.toJSON = toDeepVirtualJSONObject;
			return { recurse: r };
		}
		return jsonObject.stringify(toDeepVirtualJSONObject());
	});

	// 118
	result.push(function (jsonObject) {
		let depth = 0;
		function toDeepVirtualJSONArray() {
			if (++depth >= 1024)
				return [];
			let r = [];
			// @ts-ignore
			r.toJSON = r;
			return [r];
		}
		return jsonObject.stringify(toDeepVirtualJSONArray());
	});
	let fullCharsetString = "";
	for (let i = 0; i <= 0xFFFF; i++)
		fullCharsetString += String.fromCharCode(i);

	// 119
	result.push(function (jsonObject) {
		return jsonObject.stringify(fullCharsetString);
	});
	return result;
}

describe("webkit-resources-JSONstringify", () => {
	let tests = createTests();
	let testsNative = createTests();
	for (let i = 0; i < tests.length; i++) {
		if ([
			21,
			22,
			25,
			28,
			29,
			33,
			34,
			35,
			36,
			40,
			41,
			42,
			43,
			44,
			45,
			46,
			47,
			48,
			49,
			50,
			51,
			52,
			53,
			54,
			55,
			56,
			57,
			58,
			59,
			60,
			61,

			// unit tests for using the width parameter
			62,
			63,
			64,
			65,
			66,
			67,
			68,
			69,
			70,
			71,
			72,
			73,
			74,
			75,
			76,
			77,
			78,
			79,
			80,

			84,
			85,
			86,
			88,
			94,
			95,
			96,
			97,
			98,
			100,
			101,
			105,
			106,
			108,
			110,
			111,
			114,
		].includes(i + 1)) {
			continue;
		}
		// @ts-ignore
		if (tests[i].throws) {
			it(`webkit-resources-JSONstringify ${i + 1} throw`, () => {
				expect(function () { tests[i]({ stringify }) }).to.throw();
				expect(function () { testsNative[i](JSON) }).to.throw();
			});
			// @ts-ignore
		} else if (tests[i].expected) {
			it(`webkit-resources-JSONstringify ${i + 1} expected`, () => {
				// @ts-ignore
				expect(tests[i]({ stringify })).to.be.equal(tests[i].expected);
				// @ts-ignore
				expect(testsNative[i](JSON)).to.be.equal(testsNative[i].expected);
			});
		} else {
			it(`webkit-resources-JSONstringify ${i + 1} native`, () => {
				expect(tests[i]({ stringify })).to.be.equal(tests[i](JSON));
			});
		}
	}
});

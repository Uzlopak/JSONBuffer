const numberPreRE = /^[\d.eE+-]+?$/;
const numberRE = /^-?(\d+?)(\.?\d*?)$/;
const scientificNumberRE = /^-?(\d+?)(\.?\d*?)([eE][-+]?\d+?)$/;

const whitespaces = [
	" ".charCodeAt(0),
	"\n".charCodeAt(0),
	"\t".charCodeAt(0),
	"\r".charCodeAt(0),
	"\b".charCodeAt(0),
	"\f".charCodeAt(0),
];

export function parse(value: string): unknown {
	const stack = [];

	let i = 0;
	for (; i < value.length; i++) {
		if (whitespaces.includes(value.charCodeAt[i]) === false) {
			break;
		}
	}
	if (value[i] === '{') return parseObject(value.slice(i, value.length), stack);
	if (value[i] === '[') return parseArray(value.slice(i, value.length), stack);
	if (value[i] === '"') return parseString(value.slice(i, value.length));
	if (value === 'true') return true;
	if (value === 'false') return false;
	if (value === 'null') return null;
	if (numberPreRE.test(value) && (numberRE.test(value) || scientificNumberRE.test(value))) return Number(value);

	throw new SyntaxError();
}

const openings = {
	'"': '"',
	'[': ']',
	'{': '}'
};

const doubleBacklashRE = /\\\\/g;
const unicodeRE = /\\u[\da-fA-F]{4}/g;
const unicodeREstrict = /^[\da-fA-F]{4}$/;

function parseString(value: string): string {
	return unicodeToChar(value.substring(1, value.length - 1).replace(doubleBacklashRE, "\\"));
}

const unicodeLookupMap = new Map();

for (let i = 0; i < 65636; i++) {
	unicodeLookupMap.set(`${i.toString(16).padStart(4, "0")}`, String.fromCharCode(Number(`0x${i.toString(16)}` as unknown as number)));
}

function unicodeReplacer(value: string): string {
	let result = "";
	for (let i = 0; i < value.length; i++) {
		if (value[i] === "\\" && value[i + 1] === "u") {
			const substr = value.substr(i + 2, 4);
			if (unicodeREstrict.test(substr)) {
				result += unicodeLookupMap.get(substr.toLowerCase());
				i += 5;
				continue;
			} else {
				throw new SyntaxError();
			}
		}
		result += value[i];
	}
	return result;
}

function unicodeToChar(value: string): string {
	return unicodeRE.test(value) ? unicodeReplacer(value) : value;
}

function parseArray(value: string, stack: Array<unknown>): Array<unknown> {
	if (
		value[1] === "]"
	) {
		return [];
	}
	const output = [];
	const valueStr = value.slice(1, value.length - 1)
	let start = 0;
	for (let i = 0; i <= valueStr.length; i++) {
		if (stack[stack.length - 1] === '\\') {
			stack.pop();
			continue;
		} else if (valueStr[i] === '\\') {
			stack.push('\\');
		}
		if (stack[stack.length - 1] === valueStr[i] && stack[stack.length - 1] !== '"' ||
			stack[stack.length - 1] === valueStr[i] && valueStr[i] === '"') {
			stack.pop();
		} else if (openings[valueStr[i]] && stack[stack.length - 1] !== '"') {
			stack.push(openings[valueStr[i]]);
		}
		if (!stack.length && valueStr[i] === ',' || i === valueStr.length) {
			const curVal = parse(valueStr.slice(start, i));
			output.push(curVal);
			start = i + 1;
		}
	}
	return output;
}

function parseObject(value: string, stack: Array<unknown>): { [key: string]: unknown } {
	if (
		value[1] === "}"
	) {
		return {};
	}
	const output = {};
	const valueStr = value.slice(1, value.length - 1)
	let position = 0;
	let key: string;
	let val: unknown;
	for (let i = 0; i <= valueStr.length; i++) {
		const sl = stack.length - 1;
		if (stack[sl] === '\\') {
			stack.pop();
			continue;
		} else if (valueStr[i] === '\\') {
			stack.push('\\');
		}
		if (stack[sl] === valueStr[i] && stack[sl] !== '"' ||
			stack[sl] === valueStr[i] && valueStr[i] === '"') {
			stack.pop();
		} else if (openings[valueStr[i]] && stack[stack.length - 1] !== '"') {
			stack.push(openings[valueStr[i]]);
		}
		if (!stack.length) {
			if (valueStr[i] === ':') {
				key = parse(valueStr.slice(position, i)) as string;
				position = i + 1;
			}
			if (valueStr[i] === ',' || i === valueStr.length) {
				val = parse(valueStr.slice(position, i));
				position = i + 1;
				output[key] = val;
			}
		}
	}
	return output;
}
// T(JsonParseUnexpectedEOS, "Unexpected end of JSON input") \
// T(JsonParseUnexpectedToken, "Unexpected token % in JSON at position %") \
// T(JsonParseUnexpectedTokenNumber, "Unexpected number in JSON at position %") \
// T(JsonParseUnexpectedTokenString, "Unexpected string in JSON at position %") \
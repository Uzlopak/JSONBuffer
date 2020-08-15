const numberPreRE = /^[\d.eE+-]+?$/;
const numberRE = /^-?(\d+?)(\.?\d*?)$/;
const scientificNumberRE = /^-?(\d+?)(\.?\d*?)([eE][-+]?\d+?)$/;

export function parse(value: string): unknown {
	const stack = [];

	if (value[0] === '{') return parseObject(value, stack);
	if (value[0] === '[') return parseArray(value, stack);
	if (value[0] === '"') return parseString(value.slice(1, value.length - 1));
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

function unicodeMatchReplacer(match: string) {
	return String.fromCharCode(match.replace(/\\u/g, '/\\x/') as unknown as number);
}

function unicodeToChar(value: string): string {
	return value.replace(/\\u[\dA-F]{4}/gi, unicodeMatchReplacer);
}

function parseString(value: string): string {
	return String(unicodeToChar(value.replace(/\\\\/g, "\\")));
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

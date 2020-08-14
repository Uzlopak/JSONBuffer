const numberRE = /^\d+$/;

export function parse(value: string): unknown {
	const stack = [];

	if (value[0] === '"') return value.slice(1, value.length - 1);
	if (value === 'true') return true;
	if (value === 'false') return false;
	if (value === 'undefined') return undefined;
	if (value === 'null') return null;
	if (numberRE.test(value)) return Number(value);
	if (value[0] === '[') return parseArray(value, stack);
	if (value[0] === '{') return parseObject(value, stack);

	throw new SyntaxError();
}

const openings = {
	'"': '"',
	'[': ']',
	'{': '}'
};

function parseArray(value: string, stack: Array<unknown>): Array<unknown> {
	const output = [];
	if (
		value.length === 2 &&
		value[1] === "]"
	) {
		return output;
	}
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
	const output = {};
	if (
		value.length === 2 &&
		value[1] === "}"
	) {
		return output;
	}
	const valueStr = value.slice(1, value.length - 1)
	let start = 0;
	let key: string;
	let val: unknown;
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
		if (!stack.length) {
			if (valueStr[i] === ':') {
				key = parse(valueStr.slice(start, i)) as string;
				start = i + 1;
			}
			if (valueStr[i] === ',' || i === valueStr.length) {
				val = parse(valueStr.slice(start, i));
				start = i + 1;
				output[key] = val;
			}
		}
	}
	return output;
}
